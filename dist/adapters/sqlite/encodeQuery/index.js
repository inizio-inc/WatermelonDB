"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var Q = _interopRequireWildcard(require("../../../QueryDescription"));

var _encodeValue = _interopRequireDefault(require("../encodeValue"));

var _encodeName = _interopRequireDefault(require("../encodeName"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (null != obj) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/* eslint-disable no-use-before-define */
function mapJoin(array, mapper, joiner) {
  return array.reduce(function (string, value) {
    return '' === string ? mapper(value) : "".concat(string).concat(joiner).concat(mapper(value));
  }, '');
}

function mapConcat(array, mapper) {
  return array.reduce(function (string, value) {
    return "".concat(string).concat(mapper(value));
  }, '');
}

var encodeValues = function (values) {
  return "(".concat(mapJoin(values, _encodeValue.default, ', '), ")");
};

var getComparisonRight = function (table, comparisonRight) {
  if (comparisonRight.values) {
    return encodeValues(comparisonRight.values);
  } else if (comparisonRight.column) {
    return "".concat((0, _encodeName.default)(table), ".").concat((0, _encodeName.default)(comparisonRight.column));
  }

  return 'undefined' !== typeof comparisonRight.value ? (0, _encodeValue.default)(comparisonRight.value) : 'null';
}; // Note: it's necessary to use `is` / `is not` for NULL comparisons to work correctly
// See: https://sqlite.org/lang_expr.html


var operators = {
  eq: 'is',
  notEq: 'is not',
  gt: '>',
  gte: '>=',
  weakGt: '>',
  // For non-column comparison case
  lt: '<',
  lte: '<=',
  oneOf: 'in',
  notIn: 'not in',
  between: 'between',
  like: 'like'
};

var encodeComparison = function (table, comparison) {
  if ('between' === comparison.operator) {
    var {
      right: right
    } = comparison;
    return right.values ? "between ".concat((0, _encodeValue.default)(right.values[0]), " and ").concat((0, _encodeValue.default)(right.values[1])) : '';
  }

  return "".concat(operators[comparison.operator], " ").concat(getComparisonRight(table, comparison.right));
};

var encodeWhere = function (table) {
  return function (where) {
    if ('and' === where.type) {
      return "(".concat(encodeAndOr('and', table, where), ")");
    } else if ('or' === where.type) {
      return "(".concat(encodeAndOr('or', table, where), ")");
    }

    return encodeWhereCondition(table, where.left, where.comparison);
  };
};

var encodeWhereCondition = function (table, left, comparison) {
  // if right operand is a value, we can use simple comparison
  // if a column, we must check for `not null > null`
  if ('weakGt' === comparison.operator && comparison.right.column) {
    return encodeWhere(table)(Q.or(Q.where(left, Q.gt(comparison.right)), Q.and(Q.where(left, Q.notEq(null)), Q.where(comparison.right.column, null))));
  }

  return "".concat((0, _encodeName.default)(table), ".").concat((0, _encodeName.default)(left), " ").concat(encodeComparison(table, comparison));
};

var encodeAndOr = function (op, table, andOr) {
  if (andOr.conditions.length) {
    return mapJoin(andOr.conditions, encodeWhere(table), " ".concat(op, " "));
  }

  return '';
};

var encodeOn = function ({
  table: table,
  left: left,
  comparison: comparison
}) {
  return encodeWhereCondition(table, left, comparison);
};

var andJoiner = ' and ';

var encodeConditions = function (table, description) {
  var wheres = mapJoin(description.where, encodeWhere(table), andJoiner);
  var joins = mapJoin(description.join, encodeOn, andJoiner);

  if (joins.length || wheres.length) {
    var joiner = wheres.length && joins.length ? andJoiner : '';
    return " where ".concat(joins).concat(joiner).concat(wheres);
  }

  return '';
}; // If query contains `on()` conditions on tables with which the primary table has a has-many
// relation, then we need to add `distinct` on the query to ensure there are no duplicates


var encodeMethod = function (table, countMode, needsDistinct) {
  if (countMode) {
    return needsDistinct ? "select count(distinct ".concat((0, _encodeName.default)(table), ".\"id\") as \"count\" from ").concat((0, _encodeName.default)(table)) : "select count(*) as \"count\" from ".concat((0, _encodeName.default)(table));
  }

  return needsDistinct ? "select distinct ".concat((0, _encodeName.default)(table), ".* from ").concat((0, _encodeName.default)(table)) : "select ".concat((0, _encodeName.default)(table), ".* from ").concat((0, _encodeName.default)(table));
};

var encodeAssociation = function (mainTable) {
  return function ([joinedTable, association]) {
    return 'belongs_to' === association.type ? " join ".concat((0, _encodeName.default)(joinedTable), " on ").concat((0, _encodeName.default)(joinedTable), ".\"id\" = ").concat((0, _encodeName.default)(mainTable), ".").concat((0, _encodeName.default)(association.key)) : " join ".concat((0, _encodeName.default)(joinedTable), " on ").concat((0, _encodeName.default)(joinedTable), ".").concat((0, _encodeName.default)(association.foreignKey), " = ").concat((0, _encodeName.default)(mainTable), ".\"id\"");
  };
};

var encodeJoin = function (table, associations) {
  return associations.length ? mapConcat(associations, encodeAssociation(table)) : '';
};

var encodeQuery = function (query, countMode = false) {
  var {
    table: table,
    description: description
  } = query;
  var hasJoins = !!query.description.join.length;
  var associations = hasJoins ? query.associations : [];
  var hasToManyJoins = associations.some(function ([, association]) {
    return 'has_many' === association.type;
  });
  var sql = encodeMethod(table, countMode, hasToManyJoins) + encodeJoin(table, associations) + encodeConditions(table, description);
  return sql;
};

var _default = encodeQuery;
exports.default = _default;