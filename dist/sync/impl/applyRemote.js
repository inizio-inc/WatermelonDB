"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = applyRemoteChanges;

var _rambdax = require("rambdax");

var _fp = require("../../utils/fp");

var _common = require("../../utils/common");

var Q = _interopRequireWildcard(require("../../QueryDescription"));

var _Schema = require("../../Schema");

var _helpers = require("./helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (null != obj) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; var ownKeys = Object.keys(source); if ('function' === typeof Object.getOwnPropertySymbols) { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || "[object Arguments]" === Object.prototype.toString.call(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var getIds = (0, _rambdax.map)(function ({
  id: id
}) {
  return id;
});

var idsForChanges = function ({
  created: created,
  updated: updated,
  deleted: deleted
}) {
  return [].concat(_toConsumableArray(getIds(created)), _toConsumableArray(getIds(updated)), _toConsumableArray(deleted));
};

var queryForChanges = function (changes) {
  return Q.where((0, _Schema.columnName)('id'), Q.oneOf(idsForChanges(changes)));
};

var findRecord = function (id, list) {
  return (0, _rambdax.find)(function (record) {
    return record.id === id;
  }, list);
};

function recordsToApplyRemoteChangesTo() {
  return _recordsToApplyRemoteChangesTo.apply(this, arguments);
}

function _recordsToApplyRemoteChangesTo() {
  _recordsToApplyRemoteChangesTo = _asyncToGenerator(function* (collection, changes) {
    var {
      database: database,
      table: table
    } = collection;
    var {
      deleted: deletedIds
    } = changes;
    var records = yield collection.query(queryForChanges(changes)).fetch();
    var locallyDeletedIds = yield database.adapter.getDeletedRecords(table);
    return _objectSpread({}, changes, {
      records: records,
      locallyDeletedIds: locallyDeletedIds,
      recordsToDestroy: (0, _rambdax.filter)(function (record) {
        return (0, _rambdax.contains)(record.id, deletedIds);
      }, records),
      deletedRecordsToDestroy: (0, _rambdax.filter)(function (id) {
        return (0, _rambdax.contains)(id, deletedIds);
      }, locallyDeletedIds)
    });
  });
  return _recordsToApplyRemoteChangesTo.apply(this, arguments);
}

function validateRemoteRaw(raw) {
  (0, _common.invariant)(raw && 'object' === typeof raw && 'id' in raw && !('_status' in raw || '_changed' in raw), "[Sync] Invalid raw record supplied to Sync. Records must be objects, must have an 'id' field, and must NOT have a '_status' or '_changed' fields");
}

function prepareApplyRemoteChangesToCollection(collection, recordsToApply, sendCreatedAsUpdated) {
  var {
    database: database,
    table: table
  } = collection;
  var {
    created: created,
    updated: updated,
    records: records,
    locallyDeletedIds: locallyDeletedIds
  } = recordsToApply; // if `sendCreatedAsUpdated`, server should send all non-deleted records as `updated`
  // log error if it doesn't — but disable standard created vs updated errors

  if (sendCreatedAsUpdated && created.length) {
    (0, _common.logError)("[Sync] 'sendCreatedAsUpdated' option is enabled, and yet server sends some records as 'created'");
  } // Insert and update records


  var recordsToInsert = (0, _rambdax.map)(function (raw) {
    validateRemoteRaw(raw);
    var currentRecord = findRecord(raw.id, records);

    if (currentRecord) {
      (0, _common.logError)("[Sync] Server wants client to create record ".concat(table, "#").concat(raw.id, ", but it already exists locally. This may suggest last sync partially executed, and then failed; or it could be a serious bug. Will update existing record instead."));
      return (0, _helpers.prepareUpdateFromRaw)(currentRecord, raw);
    } else if ((0, _rambdax.contains)(raw.id, locallyDeletedIds)) {
      (0, _common.logError)("[Sync] Server wants client to create record ".concat(table, "#").concat(raw.id, ", but it already exists locally and is marked as deleted. This may suggest last sync partially executed, and then failed; or it could be a serious bug. Will delete local record and recreate it instead.")); // Note: we're not awaiting the async operation (but it will always complete before the batch)

      database.adapter.destroyDeletedRecords(table, [raw.id]);
      return (0, _helpers.prepareCreateFromRaw)(collection, raw);
    }

    return (0, _helpers.prepareCreateFromRaw)(collection, raw);
  }, created);
  var recordsToUpdate = (0, _rambdax.map)(function (raw) {
    validateRemoteRaw(raw);
    var currentRecord = findRecord(raw.id, records);

    if (currentRecord) {
      return (0, _helpers.prepareUpdateFromRaw)(currentRecord, raw);
    } else if ((0, _rambdax.contains)(raw.id, locallyDeletedIds)) {
      // Nothing to do, record was locally deleted, deletion will be pushed later
      return null;
    } // Record doesn't exist (but should) — just create it


    sendCreatedAsUpdated || (0, _common.logError)("[Sync] Server wants client to update record ".concat(table, "#").concat(raw.id, ", but it doesn't exist locally. This could be a serious bug. Will create record instead."));
    return (0, _helpers.prepareCreateFromRaw)(collection, raw);
  }, updated); // $FlowFixMe

  return [].concat(_toConsumableArray(recordsToInsert), _toConsumableArray((0, _rambdax.filter)(Boolean, recordsToUpdate)));
}

var getAllRecordsToApply = function (db, remoteChanges) {
  return (0, _rambdax.piped)(remoteChanges, (0, _rambdax.map)(function (changes, tableName) {
    return recordsToApplyRemoteChangesTo(db.collections.get(tableName), changes);
  }), _rambdax.promiseAllObject);
};

var getAllRecordsToDestroy = (0, _rambdax.pipe)(_rambdax.values, (0, _rambdax.map)(function ({
  recordsToDestroy: recordsToDestroy
}) {
  return recordsToDestroy;
}), _fp.unnest);

var destroyAllDeletedRecords = function (db, recordsToApply) {
  return (0, _rambdax.piped)(recordsToApply, (0, _rambdax.map)(function ({
    deletedRecordsToDestroy: deletedRecordsToDestroy
  }, tableName) {
    return deletedRecordsToDestroy.length && db.adapter.destroyDeletedRecords(tableName, deletedRecordsToDestroy);
  }), _rambdax.promiseAllObject);
};

var prepareApplyAllRemoteChanges = function (db, recordsToApply, sendCreatedAsUpdated) {
  return (0, _rambdax.piped)(recordsToApply, (0, _rambdax.map)(function (records, tableName) {
    return prepareApplyRemoteChangesToCollection(db.collections.get(tableName), records, sendCreatedAsUpdated);
  }), _rambdax.values, _fp.unnest);
};

var destroyPermanently = function (record) {
  return record.destroyPermanently();
};

function applyRemoteChanges(db, remoteChanges, sendCreatedAsUpdated) {
  (0, _helpers.ensureActionsEnabled)(db);
  return db.action(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    var recordsToApply = yield getAllRecordsToApply(db, remoteChanges); // Perform steps concurrently

    yield Promise.all([(0, _fp.allPromises)(destroyPermanently, getAllRecordsToDestroy(recordsToApply)), destroyAllDeletedRecords(db, recordsToApply), db.batch.apply(db, _toConsumableArray(prepareApplyAllRemoteChanges(db, recordsToApply, sendCreatedAsUpdated)))]);
  }), 'sync-applyRemoteChanges');
}