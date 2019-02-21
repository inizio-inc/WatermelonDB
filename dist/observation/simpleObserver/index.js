"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = simpleObserver;

var _Observable = require("rxjs/Observable");

var _defer = require("rxjs/observable/defer");

var _operators = require("rxjs/operators");

var _doOnDispose = _interopRequireDefault(require("../../utils/rx/doOnDispose"));

var _doOnSubscribe = _interopRequireDefault(require("../../utils/rx/doOnSubscribe"));

var _logger = _interopRequireDefault(require("../../utils/common/logger"));

var _common = require("../../Collection/common");

var _encodeMatcher = _interopRequireDefault(require("../encodeMatcher"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function observeChanges(query) {
  var matcher = (0, _encodeMatcher.default)(query.description);
  return function (initialRecords) {
    return _Observable.Observable.create(function (observer) {
      // Send initial matching records
      var matchingRecords = initialRecords;

      var emit = function () {
        return observer.next(matchingRecords.slice(0));
      };

      emit(); // Observe changes to the collection

      return query.collection.changes.subscribe(function (changes) {
        var shouldEmit = false;
        changes.forEach(function (change) {
          var {
            record: record,
            type: type
          } = change;
          var index = matchingRecords.indexOf(record);
          var currentlyMatching = -1 < index;

          if (currentlyMatching && type === _common.CollectionChangeTypes.destroyed) {
            // Remove if record was deleted
            matchingRecords.splice(index, 1);
            shouldEmit = true;
            return;
          }

          var matches = matcher(record);

          if (currentlyMatching && !matches) {
            // Remove if doesn't match anymore
            matchingRecords.splice(index, 1);
            shouldEmit = true;
          } else if (matches && !currentlyMatching) {
            // Add if should be included but isn't
            matchingRecords.push(record);
            shouldEmit = true;
          }
        });

        if (shouldEmit) {
          emit();
        }
      });
    });
  };
}

function simpleObserver(query) {
  return (0, _defer.defer)(function () {
    return query.collection.fetchQuery(query);
  }).pipe((0, _operators.switchMap)(observeChanges(query)), (0, _doOnSubscribe.default)(function () {
    return _logger.default.log("Subscribed to changes in a ".concat(query.table, " query"));
  }), (0, _doOnDispose.default)(function () {
    return _logger.default.log("Unsubscribed from changes in a ".concat(query.table, " query"));
  }));
}