"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchLocalChanges;
exports.hasUnsyncedChanges = hasUnsyncedChanges;

var _rambdax = require("rambdax");

var _fp = require("../../utils/fp");

var Q = _interopRequireWildcard(require("../../QueryDescription"));

var _Schema = require("../../Schema");

var _helpers = require("./helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (null != obj) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; var ownKeys = Object.keys(source); if ('function' === typeof Object.getOwnPropertySymbols) { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var notSyncedQuery = Q.where((0, _Schema.columnName)('_status'), Q.notEq('synced')); // TODO: It would be best to omit _status, _changed fields, since they're not necessary for the server
// but this complicates markLocalChangesAsDone, since we don't have the exact copy to compare if record changed
// TODO: It would probably also be good to only send to server locally changed fields, not full records

var rawsForStatus = function (status, records) {
  return (0, _rambdax.reduce)(function (raws, record) {
    return record._raw._status === status ? raws.concat(_objectSpread({}, record._raw)) : raws;
  }, [], records);
};

function fetchLocalChangesForCollection() {
  return _fetchLocalChangesForCollection.apply(this, arguments);
}

function _fetchLocalChangesForCollection() {
  _fetchLocalChangesForCollection = _asyncToGenerator(function* (collection) {
    var changedRecords = yield collection.query(notSyncedQuery).fetch();
    var changeSet = {
      created: rawsForStatus('created', changedRecords),
      updated: rawsForStatus('updated', changedRecords),
      deleted: yield collection.database.adapter.getDeletedRecords(collection.table)
    };
    return [changeSet, changedRecords];
  });
  return _fetchLocalChangesForCollection.apply(this, arguments);
}

var extractChanges = (0, _rambdax.map)(function ([changeSet]) {
  return changeSet;
});
var extractAllAffectedRecords = (0, _rambdax.pipe)(_rambdax.values, (0, _rambdax.map)(function ([, records]) {
  return records;
}), _fp.unnest);

function fetchLocalChanges(db) {
  (0, _helpers.ensureActionsEnabled)(db);
  return db.action(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    var changes = yield (0, _rambdax.promiseAllObject)((0, _rambdax.map)(fetchLocalChangesForCollection, // $FlowFixMe
    db.collections.map)); // TODO: deep-freeze changes object (in dev mode only) to detect mutations (user bug)

    return {
      // $FlowFixMe
      changes: extractChanges(changes),
      affectedRecords: extractAllAffectedRecords(changes)
    };
  }), 'sync-fetchLocalChanges');
}

function hasUnsyncedChanges() {
  return _hasUnsyncedChanges.apply(this, arguments);
}

function _hasUnsyncedChanges() {
  _hasUnsyncedChanges = _asyncToGenerator(function* (db) {
    var collections = (0, _rambdax.values)(db.collections.map);

    var hasUnsynced =
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(function* (collection) {
        var changes = yield collection.query(notSyncedQuery).fetchCount();
        var deleted = yield db.adapter.getDeletedRecords(collection.table);
        return 0 < changes + deleted.length;
      });

      return function () {
        return _ref2.apply(this, arguments);
      };
    }();

    var unsyncedFlags = yield (0, _fp.allPromises)(hasUnsynced, collections);
    return (0, _rambdax.any)(_rambdax.identity, unsyncedFlags);
  });
  return _hasUnsyncedChanges.apply(this, arguments);
}