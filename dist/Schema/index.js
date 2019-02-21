"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tableName = tableName;
exports.columnName = columnName;
exports.appSchema = appSchema;
exports.validateColumnSchema = validateColumnSchema;
exports.tableSchema = tableSchema;

var _rambdax = require("rambdax");

var _logger = _interopRequireDefault(require("../utils/common/logger"));

var _isDevelopment = _interopRequireDefault(require("../utils/common/isDevelopment"));

var _invariant = _interopRequireDefault(require("../utils/common/invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function tableName(name) {
  return name;
}

function columnName(name) {
  return name;
}

function appSchema({
  version: version,
  tables: tableList
}) {
  _isDevelopment.default && (0, _invariant.default)(0 < version, "Schema version must be greater than 0");
  var tables = tableList.reduce(function (map, table) {
    map[table.name] = table;
    return map;
  }, {});
  return {
    version: version,
    tables: tables
  };
}

function validateColumnSchema(column) {
  if (_isDevelopment.default) {
    (0, _invariant.default)(column.name, "Missing column name");
    (0, _invariant.default)((0, _rambdax.contains)(column.type, ['string', 'boolean', 'number']), "Invalid type ".concat(column.type, " for column ").concat(column.name, " (valid: string, boolean, number)"));
    (0, _invariant.default)(!(0, _rambdax.contains)(column.name, ['id', '_changed', '_status']), "You must not define a column with name ".concat(column.name));

    if ('created_at' === column.name || 'updated_at' === column.name) {
      (0, _invariant.default)('number' === column.type && !column.isOptional, "".concat(column.name, " must be of type number and not optional"));
    }

    if ('last_modified' === column.name) {
      (0, _invariant.default)('number' === column.type, "For compatibility reasons, column last_modified must be of type 'number', and should be optional");
    }
  }
}

function tableSchema({
  name: name,
  columns: columnList
}) {
  _isDevelopment.default && (0, _invariant.default)(name, "Missing table name in schema");
  var columns = columnList.reduce(function (map, column) {
    // TODO: `bool` is deprecated -- remove compat after a while
    if ('bool' === column.type) {
      column.type = 'boolean';

      if (_isDevelopment.default) {
        _logger.default.warn("[DEPRECATION] Column type 'bool' is deprecated \u2014 change to 'boolean' (in ".concat(JSON.stringify(column), ")"));
      }
    }

    if (_isDevelopment.default) {
      validateColumnSchema(column);
    }

    map[column.name] = column;
    return map;
  }, {});
  return {
    name: name,
    columns: columns
  };
}