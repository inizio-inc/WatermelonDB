"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _makeDecorator = _interopRequireDefault(require("../../utils/common/makeDecorator"));

var _common = require("../common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Defines a model property representing user-input text
//
// On set, all strings are trimmed (whitespace is removed from beginning/end)
// and all non-string values are converted to strings
// (Except null which is passed as-is)
//
// Pass the database column name as an argument
//
// Examples:
//   @text(Column.name) name: string
//   @text('full_description') fullDescription: string
var text = (0, _makeDecorator.default)(function (columnName) {
  return function (target, key, descriptor) {
    (0, _common.ensureDecoratorUsedProperly)(columnName, target, key, descriptor);
    return {
      configurable: true,
      enumerable: true,
      get: function get() {
        return this._getRaw(columnName);
      },
      set: function set(value) {
        this._setRaw(columnName, 'string' === typeof value ? value.trim() : null);
      }
    };
  };
});
var _default = text;
exports.default = _default;