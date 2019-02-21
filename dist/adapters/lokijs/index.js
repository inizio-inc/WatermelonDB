"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rambdax = require("rambdax");

var _common = require("../../utils/common");

var _common2 = require("../common");

var _WorkerBridge = _interopRequireDefault(require("./WorkerBridge"));

var _common3 = require("./common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; var ownKeys = Object.keys(source); if ('function' === typeof Object.getOwnPropertySymbols) { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var {
  SETUP: SETUP,
  FIND: FIND,
  QUERY: QUERY,
  COUNT: COUNT,
  BATCH: BATCH,
  UNSAFE_RESET_DATABASE: UNSAFE_RESET_DATABASE,
  GET_LOCAL: GET_LOCAL,
  SET_LOCAL: SET_LOCAL,
  REMOVE_LOCAL: REMOVE_LOCAL,
  GET_DELETED_RECORDS: GET_DELETED_RECORDS,
  DESTROY_DELETED_RECORDS: DESTROY_DELETED_RECORDS
} = _common3.actions;

var LokiJSAdapter =
/*#__PURE__*/
function () {
  function LokiJSAdapter(options) {
    var _this = this;

    _classCallCheck(this, LokiJSAdapter);

    this.workerBridge = new _WorkerBridge.default();
    var {
      schema: schema,
      migrationsExperimental: migrations,
      dbName: dbName
    } = options;
    this.schema = schema;
    this.migrations = migrations;
    this._dbName = dbName;
    _common.isDevelopment && (0, _common2.validateAdapter)(this);
    (0, _common2.devLogSetUp)(function () {
      return _this.workerBridge.send(SETUP, [options]);
    });
  }

  _createClass(LokiJSAdapter, [{
    key: "testClone",
    value: function testClone(options = {}) {
      // Ensure data is saved to memory
      // $FlowFixMe
      var {
        executor: executor
      } = this.workerBridge._worker._worker;
      executor.loki.close(); // Copy

      var lokiAdapter = executor.loki.persistenceAdapter;
      return new LokiJSAdapter(_objectSpread({
        dbName: this._dbName,
        schema: this.schema
      }, this.migrations ? {
        migrationsExperimental: this.migrations
      } : {}, {
        _testLokiAdapter: lokiAdapter
      }, options));
    }
  }, {
    key: "find",
    value: function () {
      var _find = _asyncToGenerator(function* (table, id) {
        var _this2 = this;

        return (0, _common2.devLogFind)(function () {
          return _this2.workerBridge.send(FIND, [table, id]);
        }, table, id);
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

        return (0, _common2.devLogQuery)(function () {
          return _this3.workerBridge.send(QUERY, [_query.serialize()]);
        }, _query);
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
          return _this4.workerBridge.send(COUNT, [query.serialize()]);
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

        yield (0, _common2.devLogBatch)(function () {
          return _this5.workerBridge.send(BATCH, [(0, _rambdax.map)(function ([type, record]) {
            return [type, record.table, record._raw];
          }, operations)]);
        }, operations);
      });

      return function batch() {
        return _batch.apply(this, arguments);
      };
    }()
  }, {
    key: "getDeletedRecords",
    value: function getDeletedRecords(tableName) {
      return this.workerBridge.send(GET_DELETED_RECORDS, [tableName]);
    }
  }, {
    key: "destroyDeletedRecords",
    value: function destroyDeletedRecords(tableName, recordIds) {
      return this.workerBridge.send(DESTROY_DELETED_RECORDS, [tableName, recordIds]);
    }
  }, {
    key: "unsafeResetDatabase",
    value: function unsafeResetDatabase() {
      return this.workerBridge.send(UNSAFE_RESET_DATABASE);
    }
  }, {
    key: "getLocal",
    value: function getLocal(key) {
      return this.workerBridge.send(GET_LOCAL, [key]);
    }
  }, {
    key: "setLocal",
    value: function setLocal(key, value) {
      return this.workerBridge.send(SET_LOCAL, [key, value]);
    }
  }, {
    key: "removeLocal",
    value: function removeLocal(key) {
      return this.workerBridge.send(REMOVE_LOCAL, [key]);
    }
  }]);

  return LokiJSAdapter;
}();

exports.default = LokiJSAdapter;