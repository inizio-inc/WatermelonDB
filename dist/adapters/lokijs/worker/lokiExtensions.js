"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newLoki = newLoki;
exports.loadDatabase = loadDatabase;
exports.deleteDatabase = deleteDatabase;

var _lokijs = _interopRequireWildcard(require("lokijs"));

var _lokiIndexedAdapter = _interopRequireDefault(require("lokijs/src/loki-indexed-adapter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (null != obj) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function newLoki(name, peristenceAdapter) {
  var newAdapter = 'test' === process.env.NODE_ENV ? new _lokijs.LokiMemoryAdapter() : new _lokiIndexedAdapter.default(name);
  return new _lokijs.default(name, {
    adapter: peristenceAdapter || newAdapter,
    autosave: true,
    autosaveInterval: 250,
    // TODO: Remove this and force database save when we have transactions
    env: 'BROWSER',
    // TODO: ?
    verbose: true // TODO: remove later

  });
}

function loadDatabase() {
  return _loadDatabase.apply(this, arguments);
}

function _loadDatabase() {
  _loadDatabase = _asyncToGenerator(function* (loki) {
    yield new Promise(function (resolve, reject) {
      loki.loadDatabase({}, function (error) {
        error ? reject(error) : resolve();
      });
    });
  });
  return _loadDatabase.apply(this, arguments);
}

function deleteDatabase() {
  return _deleteDatabase.apply(this, arguments);
}

function _deleteDatabase() {
  _deleteDatabase = _asyncToGenerator(function* (loki) {
    yield new Promise(function (resolve, reject) {
      loki.deleteDatabase({}, function (response) {
        // LokiIndexedAdapter responds with `{ success: true }`, while
        // LokiMemory adapter just calls it with no params
        if (response && response.success || response === undefined) {
          resolve();
        } else {
          reject(response);
        }
      });
    });
  });
  return _deleteDatabase.apply(this, arguments);
}