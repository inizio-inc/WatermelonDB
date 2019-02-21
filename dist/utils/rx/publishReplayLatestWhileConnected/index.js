"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = publishReplayLatestWhileConnected;

var _ReplaySubject = require("rxjs/ReplaySubject");

var _operators = require("rxjs/operators");

// Creates a Connectable observable, that, while connected, replays the latest emission
// upon subscription. When disconnected, the replay cache is cleared.
function publishReplayLatestWhileConnected(source) {
  return source.pipe((0, _operators.multicast)(function () {
    return new _ReplaySubject.ReplaySubject(1);
  }));
}