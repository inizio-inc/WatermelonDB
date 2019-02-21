"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTimestampsFor = exports.hasUpdatedAt = void 0;

var _hasIn = _interopRequireDefault(require("../utils/fp/hasIn"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasCreatedAt = (0, _hasIn.default)('createdAt');
var hasUpdatedAt = (0, _hasIn.default)('updatedAt');
exports.hasUpdatedAt = hasUpdatedAt;

var createTimestampsFor = function (model) {
  var date = Date.now();
  var timestamps = {};

  if (hasCreatedAt(model)) {
    timestamps.created_at = date;
  }

  if (hasUpdatedAt(model)) {
    timestamps.updated_at = date;
  }

  return timestamps;
};

exports.createTimestampsFor = createTimestampsFor;