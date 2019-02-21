"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rambdax = require("rambdax");

var _cacheWhileConnected = _interopRequireDefault(require("../utils/rx/cacheWhileConnected"));

var _allPromises = _interopRequireDefault(require("../utils/fp/allPromises"));

var _lazy = _interopRequireDefault(require("../decorators/lazy"));

var _observeCount = _interopRequireDefault(require("../observation/observeCount"));

var _observeQuery = _interopRequireDefault(require("../observation/observeQuery"));

var _fieldObserver = _interopRequireDefault(require("../observation/fieldObserver"));

var _QueryDescription = require("../QueryDescription");

var _helpers = require("./helpers");

var _class, _descriptor, _descriptor2, _descriptor3, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || "[object Arguments]" === Object.prototype.toString.call(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object['ke' + 'ys'](descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && void 0 !== desc.initializer) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (void 0 === desc.initializer) { Object['define' + 'Property'](target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper() { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.'); }

var Query = (_class = (_temp =
/*#__PURE__*/
function () {
  // Note: Don't use this directly, use Collection.query(...)
  function Query(collection, conditions) {
    _classCallCheck(this, Query);

    _initializerDefineProperty(this, "_cachedObservable", _descriptor, this);

    _initializerDefineProperty(this, "_cachedCountObservable", _descriptor2, this);

    _initializerDefineProperty(this, "_cachedCountThrottledObservable", _descriptor3, this);

    this.collection = collection;
    this._rawDescription = (0, _QueryDescription.buildQueryDescription)(conditions);
    this.description = (0, _QueryDescription.queryWithoutDeleted)(this._rawDescription);
  } // Creates a new Query that extends the conditions of this query


  _createClass(Query, [{
    key: "extend",
    value: function extend(...conditions) {
      var {
        collection: collection,
        _rawDescription: {
          join: join,
          where: where
        }
      } = this;
      return new Query(collection, [].concat(_toConsumableArray(join), _toConsumableArray(where), conditions));
    }
  }, {
    key: "pipe",
    value: function pipe(transform) {
      return transform(this);
    } // Queries database and returns an array of matching records

  }, {
    key: "fetch",
    value: function fetch() {
      return this.collection.fetchQuery(this);
    } // Emits an array of matching records, then emits a new array every time it changes

  }, {
    key: "observe",
    value: function observe() {
      return this._cachedObservable;
    } // Same as `observe()` but also emits the list when any of the records
    // on the list has one of `rawFields` chaged

  }, {
    key: "observeWithColumns",
    value: function observeWithColumns(rawFields) {
      return (0, _fieldObserver.default)(this.observe(), rawFields);
    } // Returns the number of matching records

  }, {
    key: "fetchCount",
    value: function fetchCount() {
      return this.collection.fetchCount(this);
    } // Emits the number of matching records, then emits a new count every time it changes
    // Note: By default, the Observable is throttled!

  }, {
    key: "observeCount",
    value: function observeCount(isThrottled = true) {
      return isThrottled ? this._cachedCountThrottledObservable : this._cachedCountObservable;
    } // Marks as deleted all records matching the query

  }, {
    key: "markAllAsDeleted",
    value: function () {
      var _markAllAsDeleted = _asyncToGenerator(function* () {
        var records = yield this.fetch();
        yield (0, _allPromises.default)(function (record) {
          return record.markAsDeleted();
        }, records);
      });

      return function markAllAsDeleted() {
        return _markAllAsDeleted.apply(this, arguments);
      };
    }() // Destroys all records matching the query

  }, {
    key: "destroyAllPermanently",
    value: function () {
      var _destroyAllPermanently = _asyncToGenerator(function* () {
        var records = yield this.fetch();
        yield (0, _allPromises.default)(function (record) {
          return record.destroyPermanently();
        }, records);
      });

      return function destroyAllPermanently() {
        return _destroyAllPermanently.apply(this, arguments);
      };
    }() // MARK: - Internals

  }, {
    key: "serialize",
    // Serialized version of Query (e.g. for sending to web worker)
    value: function serialize() {
      var {
        table: table,
        description: description,
        associations: associations
      } = this;
      return {
        table: table,
        description: description,
        associations: associations
      };
    }
  }, {
    key: "modelClass",
    get: function get() {
      return this.collection.modelClass;
    }
  }, {
    key: "table",
    get: function get() {
      return this.modelClass.table;
    }
  }, {
    key: "secondaryTables",
    get: function get() {
      return (0, _helpers.getSecondaryTables)(this.description);
    }
  }, {
    key: "allTables",
    get: function get() {
      return (0, _rambdax.prepend)(this.table, this.secondaryTables);
    }
  }, {
    key: "associations",
    get: function get() {
      return (0, _helpers.getAssociations)(this.secondaryTables, this.modelClass.associations);
    } // `true` if query contains conditions on foreign tables

  }, {
    key: "hasJoins",
    get: function get() {
      return !!this.description.join.length;
    }
  }]);

  return Query;
}(), _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "_cachedObservable", [_lazy.default], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return (0, _observeQuery.default)(this).pipe(_cacheWhileConnected.default);
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "_cachedCountObservable", [_lazy.default], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return (0, _observeCount.default)(this, false).pipe(_cacheWhileConnected.default);
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "_cachedCountThrottledObservable", [_lazy.default], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function initializer() {
    return (0, _observeCount.default)(this, true).pipe(_cacheWhileConnected.default);
  }
})), _class);
exports.default = Query;