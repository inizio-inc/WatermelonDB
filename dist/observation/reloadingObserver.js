"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = reloadingObserver;

var _operators = require("rxjs/operators");

var _identicalArrays = _interopRequireDefault(require("../utils/fp/identicalArrays"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Produces an observable version of a query by re-querying the database
// when any change occurs in any of the relevant Stores.
// This is inefficient for simple queries, but necessary for complex queries
function reloadingObserver(query) {
  var {
    database: database
  } = query.collection;
  return database.withChangesForTables(query.allTables).pipe((0, _operators.switchMap)(function () {
    return query.collection.fetchQuery(query);
  })).pipe((0, _operators.distinctUntilChanged)(_identicalArrays.default));
}