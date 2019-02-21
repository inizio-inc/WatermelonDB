"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = encodeInsert;

var _rambdax = require("rambdax");

var _encodeName = _interopRequireDefault(require("../encodeName"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var columnNames = (0, _rambdax.pipe)(_rambdax.keys, (0, _rambdax.map)(_encodeName.default), (0, _rambdax.join)(', '));
var valuePlaceholders = (0, _rambdax.pipe)(_rambdax.values, (0, _rambdax.map)((0, _rambdax.always)('?')), (0, _rambdax.join)(', '));

function encodeInsert(model) {
  var {
    _raw: raw,
    table: table
  } = model;
  var sql = "insert into ".concat(table, " (").concat(columnNames(raw), ") values (").concat(valuePlaceholders(raw), ")");
  var args = (0, _rambdax.values)(raw);
  return [sql, args];
}