"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lokijs = _interopRequireWildcard(require("lokijs"));

var _rambdax = require("rambdax");

var _common = require("../../../utils/common");

var _helpers = require("../../../Schema/migrations/helpers");

var _RawRecord = require("../../../RawRecord");

var _lokiExtensions = require("./lokiExtensions");

var _executeQuery = _interopRequireDefault(require("./executeQuery"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (null != obj) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || "[object Arguments]" === Object.prototype.toString.call(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SCHEMA_VERSION_KEY = '_loki_schema_version';

var LokiExecutor =
/*#__PURE__*/
function () {
  function LokiExecutor(options) {
    _classCallCheck(this, LokiExecutor);

    this.cachedRecords = new Map();
    var {
      dbName: dbName,
      schema: schema,
      migrationsExperimental: migrationsExperimental,
      _testLokiAdapter: _testLokiAdapter
    } = options;
    this.dbName = dbName;
    this.schema = schema;
    this.migrations = migrationsExperimental;
    this._testLokiAdapter = _testLokiAdapter;
  }

  _createClass(LokiExecutor, [{
    key: "setUp",
    value: function () {
      var _setUp = _asyncToGenerator(function* () {
        yield this._openDatabase(this._testLokiAdapter);
        yield this._migrateIfNeeded();
      });

      return function setUp() {
        return _setUp.apply(this, arguments);
      };
    }()
  }, {
    key: "isCached",
    value: function isCached(table, id) {
      var cachedSet = this.cachedRecords.get(table);
      return cachedSet ? cachedSet.has(id) : false;
    }
  }, {
    key: "markAsCached",
    value: function markAsCached(table, id) {
      var cachedSet = this.cachedRecords.get(table);

      if (cachedSet) {
        cachedSet.add(id);
      } else {
        this.cachedRecords.set(table, new Set([id]));
      }
    }
  }, {
    key: "removeFromCache",
    value: function removeFromCache(table, id) {
      var cachedSet = this.cachedRecords.get(table);

      if (cachedSet) {
        cachedSet.delete(id);
      }
    }
  }, {
    key: "find",
    value: function find(table, id) {
      if (this.isCached(table, id)) {
        return id;
      }

      var raw = this.loki.getCollection(table).by('id', id);

      if (!raw) {
        return null;
      }

      this.markAsCached(table, id);
      return (0, _RawRecord.sanitizedRaw)(raw, this.schema.tables[table]);
    }
  }, {
    key: "query",
    value: function query(_query) {
      var records = (0, _executeQuery.default)(_query, this.loki).data();
      return this._compactQueryResults(records, _query.table);
    }
  }, {
    key: "count",
    value: function count(query) {
      return (0, _executeQuery.default)(query, this.loki).count();
    }
  }, {
    key: "create",
    value: function create(table, raw) {
      this.loki.getCollection(table).insert(raw);
      this.markAsCached(table, raw.id);
    }
  }, {
    key: "update",
    value: function update(table, rawRecord) {
      var collection = this.loki.getCollection(table); // Loki identifies records using internal $loki ID so we must find the saved record first

      var lokiId = collection.by('id', rawRecord.id).$loki;
      var raw = rawRecord;
      raw.$loki = lokiId;
      collection.update(raw);
    }
  }, {
    key: "destroyPermanently",
    value: function destroyPermanently(table, id) {
      var collection = this.loki.getCollection(table);
      var record = collection.by('id', id);
      collection.remove(record);
      this.removeFromCache(table, id);
    }
  }, {
    key: "markAsDeleted",
    value: function markAsDeleted(table, id) {
      var collection = this.loki.getCollection(table);
      var record = collection.by('id', id);

      if (record) {
        record._status = 'deleted';
        collection.update(record);
        this.removeFromCache(table, id);
      }
    }
  }, {
    key: "batch",
    value: function batch(operations) {
      var _this = this;

      // TODO: Only add to cached records if all is successful
      // TODO: Transactionality
      operations.forEach(function (operation) {
        var [type, table, raw] = operation;

        switch (type) {
          case 'create':
            _this.create(table, raw);

            break;

          case 'update':
            _this.update(table, raw);

            break;

          case 'markAsDeleted':
            _this.markAsDeleted(table, raw.id);

            break;

          case 'destroyPermanently':
            _this.destroyPermanently(table, raw.id);

            break;

          default:
            break;
        }
      });
    }
  }, {
    key: "getDeletedRecords",
    value: function getDeletedRecords(table) {
      return this.loki.getCollection(table).find({
        _status: {
          $eq: 'deleted'
        }
      }).map((0, _rambdax.prop)('id'));
    }
  }, {
    key: "destroyDeletedRecords",
    value: function destroyDeletedRecords(table, records) {
      var collection = this.loki.getCollection(table);
      (0, _rambdax.forEach)(function (recordId) {
        var record = collection.by('id', recordId);
        record && collection.remove(record);
      }, records);
    }
  }, {
    key: "unsafeResetDatabase",
    value: function () {
      var _unsafeResetDatabase = _asyncToGenerator(function* () {
        yield (0, _lokiExtensions.deleteDatabase)(this.loki);
        this.cachedRecords.clear();

        _common.logger.log('[DB][Worker] Database is now reset');

        yield this._openDatabase();

        this._setUpSchema();
      });

      return function unsafeResetDatabase() {
        return _unsafeResetDatabase.apply(this, arguments);
      };
    }() // *** LocalStorage ***

  }, {
    key: "getLocal",
    value: function getLocal(key) {
      var record = this._findLocal(key);

      return record ? record.value : null;
    }
  }, {
    key: "setLocal",
    value: function setLocal(key, value) {
      var record = this._findLocal(key);

      if (record) {
        record.value = value;

        this._localStorage.update(record);
      } else {
        this._localStorage.insert({
          key: key,
          value: value
        });
      }
    }
  }, {
    key: "removeLocal",
    value: function removeLocal(key) {
      var record = this._findLocal(key);

      if (record) {
        this._localStorage.remove(record);
      }
    } // *** Internals ***

  }, {
    key: "_openDatabase",
    value: function () {
      var _openDatabase2 = _asyncToGenerator(function* (adapter) {
        _common.logger.log('[DB][Worker] Initializing IndexedDB');

        this.loki = (0, _lokiExtensions.newLoki)(this.dbName, adapter);
        yield (0, _lokiExtensions.loadDatabase)(this.loki); // Force database to load now

        _common.logger.log('[DB][Worker] Database loaded');
      });

      return function _openDatabase() {
        return _openDatabase2.apply(this, arguments);
      };
    }()
  }, {
    key: "_setUpSchema",
    value: function _setUpSchema() {
      var _this2 = this;

      _common.logger.log('[DB][Worker] Setting up schema'); // Add collections


      (0, _rambdax.values)(this.schema.tables).forEach(function (tableSchema) {
        _this2._addCollection(tableSchema);
      });
      this.loki.addCollection('local_storage', {
        unique: ['key'],
        indices: [],
        disableMeta: true
      }); // Set database version

      this._databaseVersion = this.schema.version;

      _common.logger.log('[DB][Worker] Database collections set up');
    }
  }, {
    key: "_addCollection",
    value: function _addCollection(tableSchema) {
      var {
        name: name,
        columns: columns
      } = tableSchema;
      var indexedColumns = (0, _rambdax.values)(columns).reduce(function (indexes, column) {
        return column.isIndexed ? indexes.concat([column.name]) : indexes;
      }, []);
      this.loki.addCollection(name, {
        unique: ['id'],
        indices: ['_status'].concat(_toConsumableArray(indexedColumns)),
        disableMeta: true
      });
    }
  }, {
    key: "_migrateIfNeeded",
    value: function () {
      var _migrateIfNeeded2 = _asyncToGenerator(function* () {
        var dbVersion = this._databaseVersion;
        var schemaVersion = this.schema.version;

        if (dbVersion === schemaVersion) {// All good!
        } else if (0 === dbVersion) {
          _common.logger.log('[DB][Worker] Empty database, setting up');

          yield this.unsafeResetDatabase();
        } else if (0 < dbVersion && dbVersion < schemaVersion) {
          _common.logger.log('[DB][Worker] Database has old schema version. Migration is required.');

          var migrationSteps = this._getMigrationSteps(dbVersion);

          if (migrationSteps) {
            _common.logger.log("[DB][Worker] Migrating from version ".concat(dbVersion, " to ").concat(this.schema.version, "..."));

            try {
              yield this._migrate(migrationSteps);
            } catch (error) {
              _common.logger.error('[DB][Worker] Migration failed', error);

              throw error;
            }
          } else {
            _common.logger.warn('[DB][Worker] Migrations not available for this version range, resetting database instead');

            yield this.unsafeResetDatabase();
          }
        } else {
          _common.logger.warn('[DB][Worker] Database has newer version than app schema. Resetting database.');

          yield this.unsafeResetDatabase();
        }
      });

      return function _migrateIfNeeded() {
        return _migrateIfNeeded2.apply(this, arguments);
      };
    }()
  }, {
    key: "_getMigrationSteps",
    value: function _getMigrationSteps(fromVersion) {
      // TODO: Remove this after migrations are shipped
      var {
        migrations: migrations
      } = this;

      if (!migrations) {
        return null;
      }

      return (0, _helpers.stepsForMigration)({
        migrations: migrations,
        fromVersion: fromVersion,
        toVersion: this.schema.version
      });
    }
  }, {
    key: "_migrate",
    value: function () {
      var _migrate2 = _asyncToGenerator(function* (steps) {
        var _this3 = this;

        steps.forEach(function (step) {
          if ('create_table' === step.type) {
            _this3._executeCreateTableMigration(step);
          } else if ('add_columns' === step.type) {
            _this3._executeAddColumnsMigration(step);
          } else {
            throw new Error("Unsupported migration step ".concat(step.type));
          }
        }); // Set database version

        this._databaseVersion = this.schema.version;

        _common.logger.log("[DB][Worker] Migration successful");
      });

      return function _migrate() {
        return _migrate2.apply(this, arguments);
      };
    }()
  }, {
    key: "_executeCreateTableMigration",
    value: function _executeCreateTableMigration({
      name: name,
      columns: columns
    }) {
      this._addCollection({
        name: name,
        columns: columns
      });
    }
  }, {
    key: "_executeAddColumnsMigration",
    value: function _executeAddColumnsMigration({
      table: table,
      columns: columns
    }) {
      var collection = this.loki.getCollection(table); // update ALL records in the collection, adding new fields

      collection.findAndUpdate({}, function (record) {
        columns.forEach(function (column) {
          (0, _RawRecord.setRawSanitized)(record, column.name, null, column);
        });
      }); // add indexes, if needed

      columns.forEach(function (column) {
        if (column.isIndexed) {
          collection.ensureIndex(column.name);
        }
      });
    } // Maps records to their IDs if the record is already cached on JS side

  }, {
    key: "_compactQueryResults",
    value: function _compactQueryResults(records, table) {
      var _this4 = this;

      return records.map(function (raw) {
        var {
          id: id
        } = raw;

        if (_this4.isCached(table, id)) {
          return id;
        }

        _this4.markAsCached(table, id);

        return (0, _RawRecord.sanitizedRaw)(raw, _this4.schema.tables[table]);
      });
    }
  }, {
    key: "_findLocal",
    value: function _findLocal(key) {
      var localStorage = this._localStorage;
      return localStorage && localStorage.by('key', key);
    }
  }, {
    key: "_databaseVersion",
    get: function get() {
      var databaseVersionRaw = this.getLocal(SCHEMA_VERSION_KEY) || '';
      return parseInt(databaseVersionRaw, 10) || 0;
    },
    set: function set(version) {
      this.setLocal(SCHEMA_VERSION_KEY, "".concat(version));
    }
  }, {
    key: "_localStorage",
    get: function get() {
      return this.loki.getCollection('local_storage');
    }
  }]);

  return LokiExecutor;
}();

exports.default = LokiExecutor;