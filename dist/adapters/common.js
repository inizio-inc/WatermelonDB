"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateAdapter = validateAdapter;
exports.sanitizeFindResult = sanitizeFindResult;
exports.sanitizeQueryResult = sanitizeQueryResult;
exports.devLogSetUp = devLogSetUp;
exports.devLogFind = devLogFind;
exports.devLogQuery = devLogQuery;
exports.devLogCount = devLogCount;
exports.devLogBatch = devLogBatch;

var _common = require("../utils/common");

var _RawRecord = require("../RawRecord");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function validateAdapter(adapter) {
  if (_common.isDevelopment) {
    var {
      schema: schema,
      migrations: migrations
    } = adapter; // TODO: uncomment when full migrations are shipped
    // invariant(migrations, `Missing migrations`)

    if (migrations) {
      (0, _common.invariant)(migrations.validated, "Invalid migrations - use schemaMigrations() to create migrations. See docs for more details.");
      var {
        minVersion: minVersion,
        maxVersion: maxVersion
      } = migrations;
      (0, _common.invariant)(maxVersion <= schema.version, "Migrations can't be newer than schema. Schema is version ".concat(schema.version, " and migrations cover range from ").concat(minVersion, " to ").concat(maxVersion));
      (0, _common.invariant)(maxVersion === schema.version, "Missing migration. Database schema is currently at version ".concat(schema.version, ", but migrations only cover range from ").concat(minVersion, " to ").concat(maxVersion));
    }
  }
}

function sanitizeFindResult(dirtyRecord, tableSchema) {
  return dirtyRecord && 'object' === typeof dirtyRecord ? (0, _RawRecord.sanitizedRaw)(dirtyRecord, tableSchema) : dirtyRecord;
}

function sanitizeQueryResult(dirtyRecords, tableSchema) {
  return dirtyRecords.map(function (dirtyRecord) {
    return 'string' === typeof dirtyRecord ? dirtyRecord : (0, _RawRecord.sanitizedRaw)(dirtyRecord, tableSchema);
  });
}

function devLogSetUp() {
  return _devLogSetUp.apply(this, arguments);
}

function _devLogSetUp() {
  _devLogSetUp = _asyncToGenerator(function* (executeBlock) {
    try {
      var [, time] = yield (0, _common.devMeasureTimeAsync)(executeBlock);

      _common.logger.log("[DB] All set up in ".concat(time, "ms"));
    } catch (error) {
      _common.logger.error("[DB] Uh-oh. Database failed to load, we're in big trouble", error);
    }
  });
  return _devLogSetUp.apply(this, arguments);
}

function devLogFind() {
  return _devLogFind.apply(this, arguments);
}

function _devLogFind() {
  _devLogFind = _asyncToGenerator(function* (executeBlock, id, table) {
    var [data, time] = yield (0, _common.devMeasureTimeAsync)(executeBlock);

    _common.logger.log("[DB] Found ".concat(table, "#").concat(id, " in ").concat(time, "ms"));

    return data;
  });
  return _devLogFind.apply(this, arguments);
}

function devLogQuery() {
  return _devLogQuery.apply(this, arguments);
}

function _devLogQuery() {
  _devLogQuery = _asyncToGenerator(function* (executeBlock, query) {
    var [dirtyRecords, time] = yield (0, _common.devMeasureTimeAsync)(executeBlock);

    _common.logger.log("[DB] Loaded ".concat(dirtyRecords.length, " ").concat(query.table, " in ").concat(time, "ms"));

    return dirtyRecords;
  });
  return _devLogQuery.apply(this, arguments);
}

function devLogCount() {
  return _devLogCount.apply(this, arguments);
}

function _devLogCount() {
  _devLogCount = _asyncToGenerator(function* (executeBlock, query) {
    var [count, time] = yield (0, _common.devMeasureTimeAsync)(executeBlock);

    _common.logger.log("[DB] Counted ".concat(count, " ").concat(query.table, " in ").concat(time, "ms"));

    return count;
  });
  return _devLogCount.apply(this, arguments);
}

function devLogBatch() {
  return _devLogBatch.apply(this, arguments);
}

function _devLogBatch() {
  _devLogBatch = _asyncToGenerator(function* (executeBlock, operations) {
    if (!operations.length) {
      return;
    }

    var [, time] = yield (0, _common.devMeasureTimeAsync)(executeBlock);
    var [type, {
      table: table
    }] = operations[0];

    _common.logger.log("[DB] Executed batch of ".concat(operations.length, " operations (first: ").concat(type, " on ").concat(table, ") in ").concat(time, "ms"));
  });
  return _devLogBatch.apply(this, arguments);
}