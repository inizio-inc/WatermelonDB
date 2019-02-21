"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = action;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; var ownKeys = Object.keys(source); if ('function' === typeof Object.getOwnPropertySymbols) { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// TODO: Document me
function action(target, key, descriptor) {
  var actionName = "".concat(target.table, ".").concat(key);
  return _objectSpread({}, descriptor, {
    value: function value(...args) {
      var _this = this;

      return this.collection.database.action(function () {
        return descriptor.value.apply(_this, args);
      }, actionName);
    }
  });
}