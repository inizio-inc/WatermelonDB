"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLastPulledAt = getLastPulledAt;
exports.setLastPulledAt = setLastPulledAt;
Object.defineProperty(exports, "applyRemoteChanges", {
  enumerable: true,
  get: function get() {
    return _applyRemote.default;
  }
});
Object.defineProperty(exports, "fetchLocalChanges", {
  enumerable: true,
  get: function get() {
    return _fetchLocal.default;
  }
});
Object.defineProperty(exports, "hasUnsyncedChanges", {
  enumerable: true,
  get: function get() {
    return _fetchLocal.hasUnsyncedChanges;
  }
});
Object.defineProperty(exports, "markLocalChangesAsSynced", {
  enumerable: true,
  get: function get() {
    return _markAsSynced.default;
  }
});

var _common = require("../../utils/common");

var _applyRemote = _interopRequireDefault(require("./applyRemote"));

var _fetchLocal = _interopRequireWildcard(require("./fetchLocal"));

var _markAsSynced = _interopRequireDefault(require("./markAsSynced"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (null != obj) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var lastSyncedAtKey = '__watermelon_last_pulled_at';

function getLastPulledAt() {
  return _getLastPulledAt.apply(this, arguments);
}

function _getLastPulledAt() {
  _getLastPulledAt = _asyncToGenerator(function* (database) {
    return parseInt((yield database.adapter.getLocal(lastSyncedAtKey)), 10) || null;
  });
  return _getLastPulledAt.apply(this, arguments);
}

function setLastPulledAt() {
  return _setLastPulledAt.apply(this, arguments);
}

function _setLastPulledAt() {
  _setLastPulledAt = _asyncToGenerator(function* (database, timestamp) {
    var previousTimestamp = (yield getLastPulledAt(database)) || 0;

    if (timestamp < previousTimestamp) {
      (0, _common.logError)("[Sync] Pull has finished and received server time ".concat(timestamp, " \u2014 but previous pulled-at time was greater - ").concat(previousTimestamp, ". This is most likely server bug."));
    }

    yield database.adapter.setLocal(lastSyncedAtKey, "".concat(timestamp));
  });
  return _setLastPulledAt.apply(this, arguments);
}