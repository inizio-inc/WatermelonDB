"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = observeCount;

var _operators = require("rxjs/operators");

// Produces an observable version of a query count by re-querying the database
// when any change occurs in any of the relevant Stores.
//
// TODO: Potential optimizations:
// - increment/decrement counter using matchers on insert/delete
function observeCount(query, isThrottled) {
  var {
    database: database
  } = query.collection;
  var changes = database.withChangesForTables(query.allTables);
  var throttledChanges = isThrottled ? changes.pipe((0, _operators.throttleTime)(250)) : changes;
  return throttledChanges.pipe((0, _operators.switchMap)(function () {
    return query.collection.fetchCount(query);
  }), (0, _operators.distinctUntilChanged)());
}