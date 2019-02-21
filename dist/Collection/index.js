"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Subject = require("rxjs/Subject");

var _defer = require("rxjs/observable/defer");

var _operators = require("rxjs/operators");

var _invariant = _interopRequireDefault(require("../utils/common/invariant"));

var _noop = _interopRequireDefault(require("../utils/fp/noop"));

var _Query = _interopRequireDefault(require("../Query"));

var _RecordCache = _interopRequireDefault(require("./RecordCache"));

var _common = require("./common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Collection =
/*#__PURE__*/
function () {
  // Emits event every time a record inside Collection changes or is deleted
  // (Use Query API to observe collection changes)
  function Collection(database, ModelClass) {
    var _this = this;

    _classCallCheck(this, Collection);

    this.changes = new _Subject.Subject();
    this.database = database;
    this.modelClass = ModelClass;
    this._cache = new _RecordCache.default(ModelClass.table, function (raw) {
      return new ModelClass(_this, raw);
    });
  } // Finds a record with the given ID
  // Promise will reject if not found


  _createClass(Collection, [{
    key: "find",
    value: function () {
      var _find = _asyncToGenerator(function* (id) {
        (0, _invariant.default)(id, "Invalid record ID ".concat(this.table, "#").concat(id));

        var cachedRecord = this._cache.get(id);

        return cachedRecord || this._fetchRecord(id);
      });

      return function find() {
        return _find.apply(this, arguments);
      };
    }() // Finds the given record and starts observing it
    // (with the same semantics as when calling `model.observe()`)

  }, {
    key: "findAndObserve",
    value: function findAndObserve(id) {
      var _this2 = this;

      return (0, _defer.defer)(function () {
        return _this2.find(id);
      }).pipe((0, _operators.switchMap)(function (model) {
        return model.observe();
      }));
    } // Query records of this type

  }, {
    key: "query",
    value: function query(...conditions) {
      return new _Query.default(this, conditions);
    } // Creates a new record in this collection
    // Pass a function to set attributes of the record.
    //
    // Example:
    // collections.get(Tables.tasks).create(task => {
    //   task.name = 'Task name'
    // })

  }, {
    key: "create",
    value: function () {
      var _create = _asyncToGenerator(function* (recordBuilder = _noop.default) {
        this.database._ensureInAction("Collection.create() can only be called from inside of an Action. See docs for more details.");

        var record = this.prepareCreate(recordBuilder);
        yield this.database.batch(record);
        return record;
      });

      return function create() {
        return _create.apply(this, arguments);
      };
    }() // Prepares a new record in this collection
    // Use this to batch-create multiple records

  }, {
    key: "prepareCreate",
    value: function prepareCreate(recordBuilder = _noop.default) {
      return this.modelClass._prepareCreate(this, recordBuilder);
    } // *** Implementation of Query APIs ***
    // See: Query.fetch

  }, {
    key: "fetchQuery",
    value: function () {
      var _fetchQuery = _asyncToGenerator(function* (query) {
        var rawRecords = yield this.database.adapter.query(query);
        return this._cache.recordsFromQueryResult(rawRecords);
      });

      return function fetchQuery() {
        return _fetchQuery.apply(this, arguments);
      };
    }() // See: Query.fetchCount

  }, {
    key: "fetchCount",
    value: function fetchCount(query) {
      return this.database.adapter.count(query);
    } // *** Implementation details ***

  }, {
    key: "_fetchRecord",
    // Fetches exactly one record (See: Collection.find)
    value: function () {
      var _fetchRecord2 = _asyncToGenerator(function* (id) {
        var raw = yield this.database.adapter.find(this.table, id);
        (0, _invariant.default)(raw, "Record ".concat(this.table, "#").concat(id, " not found"));
        return this._cache.recordFromQueryResult(raw);
      });

      return function _fetchRecord() {
        return _fetchRecord2.apply(this, arguments);
      };
    }()
  }, {
    key: "_markAsDeleted",
    value: function () {
      var _markAsDeleted2 = _asyncToGenerator(function* (record) {
        yield this.database.adapter.batch([['markAsDeleted', record]]);

        this._onRecordDestroyed(record);
      });

      return function _markAsDeleted() {
        return _markAsDeleted2.apply(this, arguments);
      };
    }()
  }, {
    key: "_destroyPermanently",
    value: function () {
      var _destroyPermanently2 = _asyncToGenerator(function* (record) {
        yield this.database.adapter.batch([['destroyPermanently', record]]);

        this._onRecordDestroyed(record);
      });

      return function _destroyPermanently() {
        return _destroyPermanently2.apply(this, arguments);
      };
    }()
  }, {
    key: "_onRecordCreated",
    value: function _onRecordCreated(record) {
      record._isCommitted = true;

      this._cache.add(record);

      this.changes.next([{
        record: record,
        type: _common.CollectionChangeTypes.created
      }]);
    }
  }, {
    key: "_onRecordUpdated",
    value: function _onRecordUpdated(record) {
      this.changes.next([{
        record: record,
        type: _common.CollectionChangeTypes.updated
      }]);

      record._notifyChanged();
    }
  }, {
    key: "_onRecordDestroyed",
    value: function _onRecordDestroyed(record) {
      this._cache.delete(record);

      this.changes.next([{
        record: record,
        type: _common.CollectionChangeTypes.destroyed
      }]);

      record._notifyDestroyed();
    } // See: Database.unsafeClearCaches

  }, {
    key: "unsafeClearCache",
    value: function unsafeClearCache() {
      this._cache.unsafeClear();
    }
  }, {
    key: "table",
    get: function get() {
      return this.modelClass.table;
    }
  }, {
    key: "schema",
    get: function get() {
      return this.database.schema.tables[this.table];
    }
  }]);

  return Collection;
}();

exports.default = Collection;