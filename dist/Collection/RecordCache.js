"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logError = _interopRequireDefault(require("../utils/common/logError"));

var _invariant = _interopRequireDefault(require("../utils/common/invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RecordCache =
/*#__PURE__*/
function () {
  function RecordCache(tableName, recordInsantiator) {
    _classCallCheck(this, RecordCache);

    this.map = new Map();
    this.tableName = tableName;
    this.recordInsantiator = recordInsantiator;
  }

  _createClass(RecordCache, [{
    key: "get",
    value: function get(id) {
      return this.map.get(id);
    }
  }, {
    key: "add",
    value: function add(record) {
      this.map.set(record.id, record);
    }
  }, {
    key: "delete",
    value: function _delete(record) {
      this.map.delete(record.id);
    }
  }, {
    key: "unsafeClear",
    value: function unsafeClear() {
      this.map = new Map();
    }
  }, {
    key: "recordsFromQueryResult",
    value: function recordsFromQueryResult(result) {
      var _this = this;

      return result.map(function (res) {
        return _this.recordFromQueryResult(res);
      });
    }
  }, {
    key: "recordFromQueryResult",
    value: function recordFromQueryResult(result) {
      if ('string' === typeof result) {
        return this._cachedModelForId(result);
      }

      return this._modelForRaw(result);
    }
  }, {
    key: "_cachedModelForId",
    value: function _cachedModelForId(id) {
      var record = this.map.get(id);
      (0, _invariant.default)(record, "Record ID ".concat(this.tableName, "#").concat(id, " was sent over the bridge, but it's not cached"));
      return record;
    }
  }, {
    key: "_modelForRaw",
    value: function _modelForRaw(raw) {
      // Sanity check: is this already cached?
      var cachedRecord = this.map.get(raw.id);

      if (cachedRecord) {
        (0, _logError.default)("Record ".concat(this.tableName, "#").concat(cachedRecord.id, " is cached, but full raw object was sent over the bridge"));
        return cachedRecord;
      } // Return new model


      var newRecord = this.recordInsantiator(raw);
      this.add(newRecord);
      return newRecord;
    }
  }]);

  return RecordCache;
}();

exports.default = RecordCache;