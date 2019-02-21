"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _makeDecorator = _interopRequireDefault(require("../../utils/common/makeDecorator"));

var _common = require("../common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Defines a model property representing a date
//
// Serializes dates to milisecond-precision Unix timestamps, and deserializes them to Date objects
// (but passes null values as-is)
//
// Pass the database column name as an argument
//
// Examples:
//   @date('reacted_at') reactedAt: Date
var dateDecorator = (0, _makeDecorator.default)(function (columnName) {
  return function (target, key, descriptor) {
    (0, _common.ensureDecoratorUsedProperly)(columnName, target, key, descriptor);
    return {
      configurable: true,
      enumerable: true,
      get: function get() {
        var rawValue = this._getRaw(columnName);

        return rawValue ? new Date(rawValue) : null;
      },
      set: function set(date) {
        var rawValue = date ? +new Date(date) : null;

        this._setRaw(columnName, rawValue);
      }
    };
  };
});
var _default = dateDecorator;
exports.default = _default;