"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rambdax = require("rambdax");

var _reloadingObserver = _interopRequireDefault(require("./reloadingObserver"));

var _simpleObserver = _interopRequireDefault(require("./simpleObserver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// $FlowFixMe
var observeQuery = (0, _rambdax.ifElse)((0, _rambdax.prop)('hasJoins'), _reloadingObserver.default, _simpleObserver.default);
var _default = observeQuery;
exports.default = _default;