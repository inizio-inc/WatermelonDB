"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Subject = require("rxjs/Subject");

var _Observable = require("rxjs/Observable");

var _operators = require("rxjs/operators");

var _identity = _interopRequireDefault(require("../../../utils/fp/identity"));

var _noop = _interopRequireDefault(require("../../../utils/fp/noop"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createQueueTask(worker, data, callback) {
  return _Observable.Observable.create(function (observer) {
    worker(data, function (result) {
      observer.next(data);
      callback(result);
      observer.complete();
    });
  });
} // TODO: Refactor Queue code to follow idiomatic Rx style instead of approximating the API of `async/queue`


function makeQueue(worker) {
  var subject = new _Subject.Subject();
  subject.pipe((0, _operators.concatMap)(_identity.default, _noop.default)).subscribe(_noop.default);
  return {
    push: function push(data, callback) {
      subject.next(createQueueTask(worker, data, callback));
    }
  };
}

var _default = makeQueue;
exports.default = _default;