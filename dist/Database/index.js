"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _merge = require("rxjs/observable/merge");

var _operators = require("rxjs/operators");

var _rambdax = require("rambdax");

var _common = require("../utils/common");

var _CollectionMap = _interopRequireDefault(require("./CollectionMap"));

var _ActionQueue = _interopRequireDefault(require("./ActionQueue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || "[object Arguments]" === Object.prototype.toString.call(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Database =
/*#__PURE__*/
function () {
  function Database({
    adapter: adapter,
    modelClasses: modelClasses,
    actionsEnabled = false
  }) {
    _classCallCheck(this, Database);

    this._actionQueue = new _ActionQueue.default();
    this.adapter = adapter;
    this.schema = adapter.schema;
    this.collections = new _CollectionMap.default(this, modelClasses);
    this._actionsEnabled = actionsEnabled;
  } // Executes multiple prepared operations
  // (made with `collection.prepareCreate` and `record.prepareUpdate`)


  _createClass(Database, [{
    key: "batch",
    value: function () {
      var _batch = _asyncToGenerator(function* (...records) {
        this._ensureInAction("Database.batch() can only be called from inside of an Action. See docs for more details.");

        var operations = records.map(function (record) {
          (0, _common.invariant)(!record._isCommitted || record._hasPendingUpdate, "Cannot batch a record that doesn't have a prepared create or prepared update");

          if (record._hasPendingUpdate) {
            record._hasPendingUpdate = false; // TODO: What if this fails?

            return ['update', record];
          }

          return ['create', record];
        });
        yield this.adapter.batch(operations);
        operations.forEach(function ([type, record]) {
          var {
            collection: collection
          } = record;

          if ('create' === type) {
            collection._onRecordCreated(record);
          } else if ('update' === type) {
            collection._onRecordUpdated(record);
          }
        });
      });

      return function batch() {
        return _batch.apply(this, arguments);
      };
    }() // TODO: Document me!

  }, {
    key: "action",
    value: function action(work, description) {
      return this._actionQueue.enqueue(work, description);
    } // Emits a signal immediately, and on change in any of the passed tables

  }, {
    key: "withChangesForTables",
    value: function withChangesForTables(tables) {
      var _this = this;

      var changesSignals = tables.map(function (table) {
        return _this.collections.get(table).changes;
      });
      return _merge.merge.apply(void 0, _toConsumableArray(changesSignals)).pipe((0, _operators.startWith)(null));
    } // This only works correctly when no Models are being observed!

  }, {
    key: "unsafeResetDatabase",
    value: function () {
      var _unsafeResetDatabase = _asyncToGenerator(function* () {
        this._unsafeClearCaches();

        yield this.adapter.unsafeResetDatabase();
      });

      return function unsafeResetDatabase() {
        return _unsafeResetDatabase.apply(this, arguments);
      };
    }()
  }, {
    key: "_unsafeClearCaches",
    value: function _unsafeClearCaches() {
      (0, _rambdax.values)(this.collections.map).forEach(function (collection) {
        collection.unsafeClearCache();
      });
    }
  }, {
    key: "_ensureInAction",
    value: function _ensureInAction(error) {
      this._actionsEnabled && (0, _common.invariant)(this._actionQueue.isRunning, error);
    }
  }]);

  return Database;
}();

exports.default = Database;