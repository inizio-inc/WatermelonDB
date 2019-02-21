"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _makeDecorator = _interopRequireDefault(require("../../utils/common/makeDecorator"));

var _invariant = _interopRequireDefault(require("../../utils/common/invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; var ownKeys = Object.keys(source); if ('function' === typeof Object.getOwnPropertySymbols) { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Marks a model field as immutable after create — you can set and change the value in
// create() and prepareCreate(), but after it's saved to the database, it cannot be changed
var nochange = (0, _makeDecorator.default)(function () {
  return function (target, key, descriptor) {
    (0, _invariant.default)(descriptor.set, "@nochange can only be applied to model fields (to properties with a setter)");
    var errorMessage = "Attempt to set a new value on a @nochange field: ".concat(target.constructor.name, ".prototype.").concat(key);
    return _objectSpread({}, descriptor, {
      set: function set(value) {
        (0, _invariant.default)(!this._isCommitted, errorMessage);
        descriptor.set.call(this, value);
      }
    });
  };
});
var _default = nochange;
exports.default = _default;