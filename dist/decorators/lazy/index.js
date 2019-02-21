"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = lazy;

// Defines a property whose value is evaluated the first time it is accessed
// For example:
//
// class X {
//   @lazy date = new Date()
// }
//
// `date` will be set to the current date not when constructed, but only when `xx.date` is called.
// All subsequent calls will return the same value
function lazy(target, key, descriptor) {
  var {
    configurable: configurable,
    enumerable: enumerable,
    initializer: initializer,
    value: value
  } = descriptor;
  return {
    configurable: configurable,
    enumerable: enumerable,
    get: function get() {
      // This happens if someone accesses the
      // property directly on the prototype
      if (this === target) {
        return undefined;
      }

      var returnValue = initializer ? initializer.call(this) : value; // Next time this property is called, skip the decorator, and just return the precomputed value

      Object.defineProperty(this, key, {
        configurable: configurable,
        enumerable: enumerable,
        writable: true,
        value: returnValue
      });
      return returnValue;
    }
  };
} // Implementation inspired by lazyInitialize from `core-decorators`