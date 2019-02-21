"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// It's faster to cache NODE_ENV
// See: https://github.com/facebook/react/issues/812
var isDevelopment = 'development' === process.env.NODE_ENV || 'test' === process.env.NODE_ENV;
var _default = isDevelopment;
exports.default = _default;