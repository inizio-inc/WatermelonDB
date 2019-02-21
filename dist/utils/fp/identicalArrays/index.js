"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// bottleneck function without dependencies to optimize performance
var identicalArrays = function (arrayA, arrayB) {
  return arrayA.length === arrayB.length && arrayA.every(function (el, index) {
    return el === arrayB[index];
  });
};

var _default = identicalArrays;
exports.default = _default;