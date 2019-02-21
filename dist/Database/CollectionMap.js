"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Collection = _interopRequireDefault(require("../Collection"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; var ownKeys = Object.keys(source); if ('function' === typeof Object.getOwnPropertySymbols) { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CollectionMap =
/*#__PURE__*/
function () {
  function CollectionMap(database, modelClasses) {
    _classCallCheck(this, CollectionMap);

    this.map = modelClasses.reduce(function (map, modelClass) {
      var _objectSpread2;

      return _objectSpread({}, map, (_objectSpread2 = {}, _objectSpread2[modelClass.table] = new _Collection.default(database, modelClass), _objectSpread2));
    }, {});
  }

  _createClass(CollectionMap, [{
    key: "get",
    value: function get(tableName) {
      return this.map[tableName];
    }
  }]);

  return CollectionMap;
}();

exports.default = CollectionMap;