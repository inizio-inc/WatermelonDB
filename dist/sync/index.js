"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.synchronize = synchronize;
exports.hasUnsyncedChanges = hasUnsyncedChanges;

var _common = require("../utils/common");

var _impl = require("./impl");

var _helpers = require("./impl/helpers");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// See Sync docs for usage details
function synchronize() {
  return _synchronize.apply(this, arguments);
}

function _synchronize() {
  _synchronize = _asyncToGenerator(function* ({
    database: database,
    pullChanges: pullChanges,
    pushChanges: pushChanges,
    sendCreatedAsUpdated: sendCreatedAsUpdated
  }) {
    (0, _helpers.ensureActionsEnabled)(database); // pull phase

    var lastPulledAt = yield (0, _impl.getLastPulledAt)(database);
    var {
      changes: remoteChanges,
      timestamp: newLastPulledAt
    } = yield pullChanges({
      lastPulledAt: lastPulledAt
    });
    yield database.action(
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(function* (action) {
        (0, _common.invariant)(lastPulledAt === (yield (0, _impl.getLastPulledAt)(database)), '[Sync] Concurrent synchronization is not allowed. More than one synchronize() call was running at the same time, and the later one was aborted before committing results to local database.');
        yield action.subAction(function () {
          return (0, _impl.applyRemoteChanges)(database, remoteChanges, !!sendCreatedAsUpdated);
        });
        yield (0, _impl.setLastPulledAt)(database, newLastPulledAt);
      });

      return function () {
        return _ref.apply(this, arguments);
      };
    }(), 'sync-synchronize-apply'); // push phase

    var localChanges = yield (0, _impl.fetchLocalChanges)(database);
    yield pushChanges({
      changes: localChanges.changes,
      lastPulledAt: newLastPulledAt
    });
    yield (0, _impl.markLocalChangesAsSynced)(database, localChanges);
  });
  return _synchronize.apply(this, arguments);
}

function hasUnsyncedChanges() {
  return _hasUnsyncedChanges.apply(this, arguments);
}
/*

## Sync design and implementation

Read this if you want to contribute to Watermelon sync adapter or write your own custom one.

General design:
- two phase: first pull remote changes to local app, then push local changes to server
- client resolves conflicts
- content-based, not time-based conflict resolution
- conflicts are resolved using per-column client-wins strategy: in conflict, server version is taken
  except for any column that was changed locally since last sync.
- local app tracks its changes using a _status (synced/created/updated/deleted) field and _changes
  field (which specifies columns changed since last sync)
- server only tracks timestamps (or version numbers) of every record, not specific changes
- sync is performed for the entire database at once, not per-collection
- eventual consistency (client and server are consistent at the moment of successful pull if no
  local changes need to be pushed)
- non-blocking: local database writes (but not reads) are only momentarily locked when writing data
  but user can safely make new changes throughout the process

Procedure:
1. Pull phase
  - get `last pulled at` timestamp locally (null if first sync)
  - call push changes function, passing `lastPulledAt`
    - server responds with all changes (create/update/delete) that occured since `lastPulledAt`
    - server serves us with its current timestamp
  - IN ACTION (lock local writes):
    - ensure no concurrent syncs
    - apply remote changes locally
      - insert new records
        - if already exists (error), update
        - if locally marked as deleted (error), un-delete and update
      - update records
        - if synced, just replace contents with server version
        - if locally updated, we have a conflict!
          - take remote version, apply local fields that have been changed locally since last sync
            (per-column client wins strategy)
          - record stays marked as updated, because local changes still need to be pushed
        - if locally marked as deleted, ignore (deletion will be pushed later)
        - if doesn't exist locally (error), create
      - destroy records
        - if alredy deleted, ignore
        - if locally changed, destroy anyway
        - ignore children (server ought to schedule children to be destroyed)
    - if successful, save server's timestamp as new `lastPulledAt`
2. Push phase
  - Fetch local changes
    - Find all locally changed records (created/updated record + deleted IDs) for all collections
    - Strip _status, _changed
  - Call push changes function, passing local changes object, and the new `lastPulledAt` timestamp
    - Server applies local changes to database, and sends OK
    - If one of the pushed records has changed *on the server* since `lastPulledAt`, push is aborted,
      all changes reverted, and server responds with an error
  - IN ACTION (lock local writes):
    - markLocalChangesAsSynced:
      - take local changes fetched in previous step, and:
      - permanently destroy records marked as deleted
      - mark created/updated records as synced and reset their _changed field
      - note: *do not* mark record as synced if it changed locally since `fetch local changes` step
        (user could have made new changes that need syncing)

Notes:
- This procedure is designed such that if sync fails at any moment, and even leaves local app in inconsistent (not fully synced) state, we should still achieve consistency with the next sync:
  - applyRemoteChanges is designed such that if all changes are applied, but `lastPulledAt` doesn't get
    saved — so during next pull server will serve us the same changes, second applyRemoteChanges will
    arrive at the same result
  - local changes before "fetch local changes" step don't matter at all - user can do anything
  - local changes between "fetch local changes" and "mark local changes as synced" will be ignored
    (won't be marked as synced) - will be pushed during next sync
  - if changes don't get marked as synced, and are pushed again, server should apply them the same way
  - remote changes between pull and push phase will be locally ignored (will be pulled next sync)
    unless there's a per-record conflict (then push fails, but next sync resolves both pull and push)

This design has been informed by:
- 10 years of experience building synchronization at Nozbe
- Kinto & Kinto.js
  - https://github.com/Kinto/kinto.js/blob/master/src/collection.js
  - https://kintojs.readthedocs.io/en/latest/api/#fetching-and-publishing-changes
- Histo - https://github.com/mirkokiefer/syncing-thesis

*/


function _hasUnsyncedChanges() {
  _hasUnsyncedChanges = _asyncToGenerator(function* ({
    database: database
  }) {
    return (0, _impl.hasUnsyncedChanges)(database);
  });
  return _hasUnsyncedChanges.apply(this, arguments);
}