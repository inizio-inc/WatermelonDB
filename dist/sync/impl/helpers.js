"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveConflict = resolveConflict;
exports.prepareCreateFromRaw = prepareCreateFromRaw;
exports.prepareUpdateFromRaw = prepareUpdateFromRaw;
exports.prepareMarkAsSynced = prepareMarkAsSynced;
exports.ensureActionsEnabled = ensureActionsEnabled;

var _common = require("../../utils/common");

var _RawRecord = require("../../RawRecord");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; var ownKeys = Object.keys(source); if ('function' === typeof Object.getOwnPropertySymbols) { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Returns raw record with naive solution to a conflict based on local `_changed` field
// This is a per-column resolution algorithm. All columns that were changed locally win
// and will be applied on top of the remote version.
function resolveConflict(local, remote) {
  // We SHOULD NOT have a reference to a `deleted` record, but since it was locally
  // deleted, there's nothing to update, since the local deletion will still be pushed to the server -- return raw as is
  if ('deleted' === local._status) {
    return local;
  } // mutating code - performance-critical path


  var resolved = _objectSpread({}, local, remote, {
    id: local.id,
    _status: local._status,
    _changed: local._changed // Use local properties where changed

  });

  local._changed.split(',').forEach(function (column) {
    resolved[column] = local[column];
  }); // Handle edge case


  if ('created' === local._status) {
    (0, _common.logError)("[Sync] Server wants client to update record ".concat(local.id, ", but it's marked as locally created. This is most likely either a server error or a Watermelon bug (please file an issue if it is!). Will assume it should have been 'synced', and just replace the raw"));
    resolved._status = 'synced';
  }

  return resolved;
}

function replaceRaw(record, dirtyRaw) {
  record._raw = (0, _RawRecord.sanitizedRaw)(dirtyRaw, record.collection.schema);
}

function prepareCreateFromRaw(collection, dirtyRaw) {
  return collection.prepareCreate(function (record) {
    replaceRaw(record, _objectSpread({}, dirtyRaw, {
      _status: 'synced',
      _changed: ''
    }));
  });
}

function prepareUpdateFromRaw(record, updatedDirtyRaw) {
  var newRaw = resolveConflict(record._raw, updatedDirtyRaw);
  return record.prepareUpdate(function () {
    replaceRaw(record, newRaw);
  });
}

function prepareMarkAsSynced(record) {
  var newRaw = _objectSpread({}, record._raw, {
    _status: 'synced',
    _changed: ''
  });

  return record.prepareUpdate(function () {
    replaceRaw(record, newRaw);
  });
}

function ensureActionsEnabled(database) {
  (0, _common.invariant)(database._actionsEnabled, '[Sync] To use Sync, Actions must be enabled. Pass `{ actionsEnabled: true }` to Database constructor — see docs for more details');
}