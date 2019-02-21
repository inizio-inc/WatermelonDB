"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fieldObserver;

var _Observable = require("rxjs/Observable");

var _operators = require("rxjs/operators");

var _rambdax = require("rambdax");

var _identicalArrays = _interopRequireDefault(require("../../utils/fp/identicalArrays"));

var _arrayDifference = _interopRequireDefault(require("../../utils/fp/arrayDifference"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getRecordState = function (record, rawFields) {
  return (// `pickAll` guarantees same length and order of keys!
    // $FlowFixMe
    (0, _rambdax.pickAll)(rawFields, record._raw)
  );
}; // Invariant: same length and order of keys!


var recordStatesEqual = function (left, right) {
  return (0, _identicalArrays.default)((0, _rambdax.values)(left), (0, _rambdax.values)(right));
};

var unsubscribeAll = (0, _rambdax.pipe)(_rambdax.values, (0, _rambdax.forEach)(function (subscription) {
  return subscription.unsubscribe();
})); // Observes the given observable list of records, and in those records,
// changes to given `rawFields`
//
// Emits a list of records when:
// - source observable emits a new list
// - any of the records in the list has any of the given fields changed
//
// TODO: Possible future optimizations:
// - simpleObserver could emit added/removed events, and this could operate on those instead of
//   re-deriving the same thing. For reloadingObserver, a Rx adapter could be fitted
// - multiple levels of array copying could probably be omitted

function fieldObserver(sourceRecords, rawFields) {
  return _Observable.Observable.create(function (observer) {
    // State kept for comparison between emissions
    var observedRecords = [];
    var recordStates = {};
    var subscriptions = {};

    var emitCopy = function (records) {
      return observer.next(records.slice(0));
    }; // Observe the list of records matching the record


    var sourceSubscription = sourceRecords.subscribe(function (records) {
      // Re-emit changes to the list
      emitCopy(records); // Find changes, and save current list for comparison on next emission

      var {
        added: added,
        removed: removed
      } = (0, _arrayDifference.default)(observedRecords, records);
      observedRecords = records; // Unsubscribe from records removed from list

      removed.forEach(function (record) {
        subscriptions[record.id].unsubscribe();
        delete subscriptions[record.id];
        delete recordStates[record.id];
      }); // Subscribe to newly added records

      added.forEach(function (newRecord) {
        // Save current record state for later comparison
        recordStates[newRecord.id] = getRecordState(newRecord, rawFields); // Skip the initial emission (only check for changes)

        subscriptions[newRecord.id] = newRecord.observe().pipe((0, _operators.skip)(1)).subscribe(function (record) {
          // Check if there are any relevant changes to the record
          var previousState = recordStates[record.id];
          var newState = getRecordState(record, rawFields); // Save current state even if there are no relevant changes
          // (because there might be irrelevant diffs like false->0 that obscure debugging)

          recordStates[record.id] = newState;

          if (!recordStatesEqual(previousState, newState)) {
            emitCopy(observedRecords);
          }
        });
      });
    }); // Dispose of record subscriptions on disposal of this observable

    return sourceSubscription.add(function () {
      unsubscribeAll(subscriptions);
    });
  });
}