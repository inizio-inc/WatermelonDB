"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactNative = require("react-native");

var _common = require("../../utils/common");

var _common2 = require("../common");

var _encodeQuery = _interopRequireDefault(require("./encodeQuery"));

var _encodeUpdate = _interopRequireDefault(require("./encodeUpdate"));

var _encodeInsert = _interopRequireDefault(require("./encodeInsert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || "[object Arguments]" === Object.prototype.toString.call(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; var ownKeys = Object.keys(source); if ('function' === typeof Object.getOwnPropertySymbols) { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Native = _reactNative.NativeModules.DatabaseBridge;

var SQLiteAdapter =
/*#__PURE__*/
function () {
  function SQLiteAdapter({
    dbName: dbName,
    schema: schema,
    migrationsExperimental: migrationsExperimental
  }) {
    var _this = this;

    _classCallCheck(this, SQLiteAdapter);

    this._tag = (0, _common.connectionTag)();
    this.schema = schema;
    this.migrations = migrationsExperimental;
    this._dbName = this._getName(dbName);
    _common.isDevelopment && (0, _common2.validateAdapter)(this);
    (0, _common2.devLogSetUp)(function () {
      return _this._init();
    });
  }

  _createClass(SQLiteAdapter, [{
    key: "testClone",
    value: function testClone(options = {}) {
      return new SQLiteAdapter(_objectSpread({
        dbName: this._dbName,
        schema: this.schema
      }, this.migrations ? {
        migrationsExperimental: this.migrations
      } : {}, options));
    }
  }, {
    key: "_getName",
    value: function _getName(name) {
      if ('test' === process.env.NODE_ENV) {
        return name || "file:testdb".concat(this._tag, "?mode=memory&cache=shared");
      }

      return name || 'watermelon';
    }
  }, {
    key: "_init",
    value: function () {
      var _init2 = _asyncToGenerator(function* () {
        // Try to initialize the database with just the schema number. If it matches the database,
        // we're good. If not, we try again, this time sending the compiled schema or a migration set
        // This is to speed up the launch (less to do and pass through bridge), and avoid repeating
        // migration logic inside native code
        var status = yield Native.initialize(this._tag, this._dbName, this.schema.version);

        if ('schema_needed' === status.code) {
          yield this._setUpWithSchema();
        } else if ('migrations_needed' === status.code) {
          yield this._setUpWithMigrations(status.databaseVersion);
        } else {
          (0, _common.invariant)('ok' === status.code, 'Invalid database initialization status');
        }
      });

      return function _init() {
        return _init2.apply(this, arguments);
      };
    }()
  }, {
    key: "_setUpWithMigrations",
    value: function () {
      var _setUpWithMigrations2 = _asyncToGenerator(function* (databaseVersion) {
        _common.logger.log('[DB] Database needs migrations');

        (0, _common.invariant)(0 < databaseVersion, 'Invalid database schema version');

        var migrationSteps = this._migrationSteps(databaseVersion);

        if (migrationSteps) {
          _common.logger.log("[DB] Migrating from version ".concat(databaseVersion, " to ").concat(this.schema.version, "..."));

          try {
            yield Native.setUpWithMigrations(this._tag, this._dbName, this._encodeMigrations(migrationSteps), databaseVersion, this.schema.version);

            _common.logger.log('[DB] Migration successful');
          } catch (error) {
            _common.logger.error('[DB] Migration failed', error);

            throw error;
          }
        } else {
          _common.logger.warn('[DB] Migrations not available for this version range, resetting database instead');

          yield this._setUpWithSchema();
        }
      });

      return function _setUpWithMigrations() {
        return _setUpWithMigrations2.apply(this, arguments);
      };
    }()
  }, {
    key: "_setUpWithSchema",
    value: function () {
      var _setUpWithSchema2 = _asyncToGenerator(function* () {
        _common.logger.log("[DB] Setting up database with schema version ".concat(this.schema.version));

        yield Native.setUpWithSchema(this._tag, this._dbName, this._encodedSchema(), this.schema.version);

        _common.logger.log("[DB] Schema set up successfully");
      });

      return function _setUpWithSchema() {
        return _setUpWithSchema2.apply(this, arguments);
      };
    }()
  }, {
    key: "find",
    value: function () {
      var _find = _asyncToGenerator(function* (table, id) {
        var _this2 = this;

        return (0, _common2.devLogFind)(
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          return (0, _common2.sanitizeFindResult)((yield Native.find(_this2._tag, table, id)), _this2.schema.tables[table]);
        }), table, id);
      });

      return function find() {
        return _find.apply(this, arguments);
      };
    }()
  }, {
    key: "query",
    value: function () {
      var _query2 = _asyncToGenerator(function* (_query) {
        var _this3 = this;

        return (0, _common2.devLogQuery)(
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          return (0, _common2.sanitizeQueryResult)((yield Native.query(_this3._tag, _query.table, (0, _encodeQuery.default)(_query))), _this3.schema.tables[_query.table]);
        }), _query);
      });

      return function query() {
        return _query2.apply(this, arguments);
      };
    }()
  }, {
    key: "count",
    value: function () {
      var _count = _asyncToGenerator(function* (query) {
        var _this4 = this;

        return (0, _common2.devLogCount)(function () {
          return Native.count(_this4._tag, (0, _encodeQuery.default)(query, true));
        }, query);
      });

      return function count() {
        return _count.apply(this, arguments);
      };
    }()
  }, {
    key: "batch",
    value: function () {
      var _batch = _asyncToGenerator(function* (operations) {
        var _this5 = this;

        yield (0, _common2.devLogBatch)(
        /*#__PURE__*/
        _asyncToGenerator(function* () {
          yield Native.batch(_this5._tag, operations.map(function ([type, record]) {
            switch (type) {
              case 'create':
                return ['create', record.table, record.id].concat(_toConsumableArray((0, _encodeInsert.default)(record)));

              case 'markAsDeleted':
                return ['markAsDeleted', record.table, record.id];

              case 'destroyPermanently':
                return ['destroyPermanently', record.table, record.id];

              default:
                // case 'update':
                return ['execute', record.table].concat(_toConsumableArray((0, _encodeUpdate.default)(record)));
            }
          }));
        }), operations);
      });

      return function batch() {
        return _batch.apply(this, arguments);
      };
    }()
  }, {
    key: "getDeletedRecords",
    value: function getDeletedRecords(table) {
      return Native.getDeletedRecords(this._tag, table);
    }
  }, {
    key: "destroyDeletedRecords",
    value: function destroyDeletedRecords(table, recordIds) {
      return Native.destroyDeletedRecords(this._tag, table, recordIds);
    }
  }, {
    key: "unsafeResetDatabase",
    value: function () {
      var _unsafeResetDatabase = _asyncToGenerator(function* () {
        yield Native.unsafeResetDatabase(this._tag, this._encodedSchema(), this.schema.version);

        _common.logger.log('[DB] Database is now reset');
      });

      return function unsafeResetDatabase() {
        return _unsafeResetDatabase.apply(this, arguments);
      };
    }()
  }, {
    key: "getLocal",
    value: function getLocal(key) {
      return Native.getLocal(this._tag, key);
    }
  }, {
    key: "setLocal",
    value: function setLocal(key, value) {
      return Native.setLocal(this._tag, key, value);
    }
  }, {
    key: "removeLocal",
    value: function removeLocal(key) {
      return Native.removeLocal(this._tag, key);
    }
  }, {
    key: "_encodedSchema",
    value: function _encodedSchema() {
      var {
        encodeSchema: encodeSchema
      } = require('./encodeSchema');

      return encodeSchema(this.schema);
    }
  }, {
    key: "_migrationSteps",
    value: function _migrationSteps(fromVersion) {
      var {
        stepsForMigration: stepsForMigration
      } = require('../../Schema/migrations/helpers');

      var {
        migrations: migrations
      } = this; // TODO: Remove this after migrations are shipped

      if (!migrations) {
        return null;
      }

      return stepsForMigration({
        migrations: migrations,
        fromVersion: fromVersion,
        toVersion: this.schema.version
      });
    }
  }, {
    key: "_encodeMigrations",
    value: function _encodeMigrations(steps) {
      var {
        encodeMigrationSteps: encodeMigrationSteps
      } = require('./encodeSchema');

      return encodeMigrationSteps(steps);
    }
  }]);

  return SQLiteAdapter;
}();

exports.default = SQLiteAdapter;