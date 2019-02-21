"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.devMeasureTime = devMeasureTime;
exports.devMeasureTimeAsync = devMeasureTimeAsync;
exports.getPreciseTime = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var getPreciseTime = function () {
  if (global && global.nativePerformanceNow) {
    return global.nativePerformanceNow;
  } else if ('undefined' !== typeof window && window.performance && window.performance.now) {
    return window.performance.now.bind(window.performance);
  }

  return Date.now;
}();

exports.getPreciseTime = getPreciseTime;

function devMeasureTime(executeBlock) {
  var start = getPreciseTime();
  var result = executeBlock();
  var time = getPreciseTime() - start;
  return [result, time];
}

function devMeasureTimeAsync() {
  return _devMeasureTimeAsync.apply(this, arguments);
}

function _devMeasureTimeAsync() {
  _devMeasureTimeAsync = _asyncToGenerator(function* (executeBlock) {
    var start = getPreciseTime();
    var result = yield executeBlock();
    var time = getPreciseTime() - start;
    return [result, time];
  });
  return _devMeasureTimeAsync.apply(this, arguments);
}