"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = encodeMatcher;

var _rambdax = require("rambdax");

var _cond = _interopRequireDefault(require("../../utils/fp/cond"));

var _invariant = _interopRequireDefault(require("../../utils/common/invariant"));

var _operators = _interopRequireDefault(require("./operators"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-use-before-define */
// don't import whole `utils` to keep worker size small
var getComparisonRightFor = function (element) {
  return (0, _cond.default)([[(0, _rambdax.has)('value'), (0, _rambdax.prop)('value')], [(0, _rambdax.has)('values'), (0, _rambdax.prop)('values')], [(0, _rambdax.has)('column'), function (arg) {
    return element._raw[arg.column];
  }]]);
};

var encodeWhereDescription = function (description) {
  return function (element) {
    var left = element._raw[description.left];
    var {
      comparison: comparison
    } = description;
    var operator = _operators.default[comparison.operator];
    var getRight = getComparisonRightFor(element);
    var right = getRight(comparison.right);
    return operator(left, right);
  };
};

var typeEq = (0, _rambdax.propEq)('type');

var encodeWhere = function (where) {
  return (0, _cond.default)([[typeEq('and'), encodeAnd], [typeEq('or'), encodeOr], [typeEq('where'), encodeWhereDescription]])(where);
};

var encodeAnd = (0, _rambdax.pipe)((0, _rambdax.prop)('conditions'), (0, _rambdax.map)(encodeWhere), _rambdax.allPass);
var encodeOr = (0, _rambdax.pipe)((0, _rambdax.prop)('conditions'), (0, _rambdax.map)(encodeWhere), _rambdax.anyPass);
var encodeConditions = (0, _rambdax.pipe)((0, _rambdax.map)(encodeWhere), _rambdax.allPass);

function encodeMatcher(query) {
  var {
    join: join,
    where: where
  } = query;
  (0, _invariant.default)(!join.length, "Queries with joins can't be encoded into a matcher");
  return encodeConditions(where);
}