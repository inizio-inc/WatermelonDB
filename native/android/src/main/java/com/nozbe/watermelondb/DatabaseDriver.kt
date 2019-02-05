package com.nozbe.watermelondb

import android.content.Context
import android.database.Cursor
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import java.lang.Exception
import java.util.logging.Logger

class DatabaseDriver(context: Context, dbName: String) {
    sealed class Operation {
        class Execute(val query: SQL, val args: QueryArgs) : Operation()
        class Create(val id: RecordID, val query: SQL, val args: QueryArgs) : Operation()
        class MarkAsDeleted(val table: TableName, val id: RecordID) : Operation()
        class DestroyPermanently(val table: TableName, val id: RecordID) : Operation()
        // class SetLocal(val key: String, val value: String) : Operation()
        // class RemoveLocal(val key: String) : Operation()
    }

    class SchemaNeededError : Exception()
    data class MigrationNeededError(val databaseVersion: SchemaVersion) : Exception()

    constructor(context: Context, dbName: String, schemaVersion: SchemaVersion)
            : this(context, dbName) {
        val compatibility = isCompatible(schemaVersion)
        when (compatibility) {
            is SchemaCompatibility.NeedsSetup -> throw SchemaNeededError()
            is SchemaCompatibility.NeedsMigration ->
                throw MigrationNeededError(compatibility.fromVersion)
        }
    }

    constructor(context: Context, dbName: String, schema: Schema) : this(context, dbName) {
        unsafeResetDatabase(schema)
    }

    constructor(context: Context, dbName: String, migrations: MigrationSet) :
            this(context, dbName) {
        migrate(migrations)
    }

    private val database: Database = Database(dbName, context)

    private val log: Logger? = if (BuildConfig.DEBUG) Logger.getLogger("DB_Driver") else null

    private var cachedRecords: ArrayList<String> = arrayListOf()

    fun find(table: TableName, id: RecordID): Any? {
        if (isCached(id)) {
            return id
        }
        database.rawQuery("select * from $table where id == ? limit 1", arrayOf(id)).use {
            if (it.count <= 0) {
                return null
            }
            val resultMap = Arguments.createMap()
            markAsCached(id)
            it.moveToFirst()
            resultMap.mapCursor(it)
            return resultMap
        }
    }

    fun cachedQuery(query: SQL): WritableArray {
        log?.info("Cached Query: $query")
        val resultArray = Arguments.createArray()
        database.rawQuery(query).use {
            if (it.count > 0 && it.columnNames.contains("id")) {
                while (it.moveToNext()) {
                    val id = it.getString(it.getColumnIndex("id"))
                    if (isCached(id)) {
                        resultArray.pushString(id)
                    } else {
                        markAsCached(id)
                        resultArray.pushMapFromCursor(it)
                    }
                }
            }
        }
        return resultArray
    }

    private fun WritableArray.pushMapFromCursor(cursor: Cursor) {
        val cursorMap = Arguments.createMap()
        cursorMap.mapCursor(cursor)
        this.pushMap(cursorMap)
    }

    fun getDeletedRecords(table: TableName): WritableArray {
        val resultArray = Arguments.createArray()
        database.rawQuery(Queries.selectDeletedIdsFromTable(table)).use {
            it.moveToFirst()
            for (i in 0 until it.count) {
                resultArray.pushString(it.getString(0))
                it.moveToNext()
            }
        }
        return resultArray
    }

    fun destroyDeletedRecords(table: TableName, records: QueryArgs) =
            database.delete(Queries.multipleDeleteFromTable(table, records), records)

    fun count(query: SQL): Int = database.count(query)

    private fun execute(query: SQL, args: QueryArgs) {
        log?.info("Executing: $query")
        database.execute(query, args)
    }

    fun getLocal(key: String): String? {
        log?.info("Get Local: $key")
        return database.getFromLocalStorage(key)
    }

    fun setLocal(key: String, value: String) {
        log?.info("Set Local: $key -> $value")
        database.insertToLocalStorage(key, value)
    }

    fun removeLocal(key: String) {
        log?.info("Remove local: $key")
        database.deleteFromLocalStorage(key)
    }

    private fun create(id: RecordID, query: SQL, args: QueryArgs) {
        log?.info("Create id: $id query: $query")
        database.execute(query, args)
    }

    fun batch(operations: List<Operation>) {
        val newIds = arrayListOf<RecordID>()
        val removedIds = arrayListOf<RecordID>()
        database.transaction {
            operations.forEach {
                when (it) {
                    is Operation.Execute -> execute(it.query, it.args)
                    is Operation.Create -> {
                        create(it.id, it.query, it.args)
                        newIds.add(it.id)
                    }
                    is Operation.MarkAsDeleted -> {
                        database.execute(Queries.setStatusDeleted(it.table), arrayListOf(it.id))
                        removedIds.add(it.id)
                    }
                    is Operation.DestroyPermanently -> {
                        database.execute(Queries.destroyPermanently(it.table), arrayListOf(it.id))
                        removedIds.add(it.id)
                    }
                }
            }
        }
        newIds.forEach(this::markAsCached)
        removedIds.forEach { cachedRecords.remove(it) }
    }

    fun unsafeResetDatabase(schema: Schema) {
        log?.info("Unsafe Reset Database")
        database.unsafeDestroyEverything()
        cachedRecords.clear()
        setUpSchema(schema)
    }

    fun close() = database.close()

    private fun markAsCached(id: RecordID) {
        log?.info("Mark as cached $id")
        cachedRecords.add(id)
    }

    private fun isCached(id: RecordID): Boolean = cachedRecords.contains(id)

    private fun setUpSchema(schema: Schema) {
        database.transaction {
            database.executeStatements(schema.sql + Queries.localStorageSchema)
            database.userVersion = schema.version
        }
    }

    private fun migrate(migrations: MigrationSet) {
        require(database.userVersion == migrations.from) {
            "Incompatbile migration set applied. " +
                    "DB: ${database.userVersion}, migration: ${migrations.from}"
        }

        database.transaction {
            database.executeStatements(migrations.sql)
            database.userVersion = migrations.to
        }
    }

    sealed class SchemaCompatibility {
        object Compatible : SchemaCompatibility()
        object NeedsSetup : SchemaCompatibility()
        class NeedsMigration(val fromVersion: SchemaVersion) : SchemaCompatibility()
    }

    private fun isCompatible(schemaVersion: SchemaVersion): SchemaCompatibility {
        val databaseVersion = database.userVersion

        return when (databaseVersion) {
            schemaVersion -> SchemaCompatibility.Compatible
            0 -> SchemaCompatibility.NeedsSetup
            in 1..(schemaVersion - 1) ->
                SchemaCompatibility.NeedsMigration(fromVersion = databaseVersion)
            else -> {
                log?.info("Database has newer version ($databaseVersion) than what the " +
                        "app supports ($schemaVersion). Will reset database.")
                SchemaCompatibility.NeedsSetup
            }
        }
    }
}
