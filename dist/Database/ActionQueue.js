"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _common = require("../utils/common");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ActionQueue =
/*#__PURE__*/
function () {
  function ActionQueue() {
    _classCallCheck(this, ActionQueue);

    this._queue = [];
    this._subActionIncoming = false;
  }

  _createClass(ActionQueue, [{
    key: "enqueue",
    value: function enqueue(work, description) {
      var _this = this;

      // If a subAction was scheduled using subAction(), database.action() calls skip the line
      if (this._subActionIncoming) {
        this._subActionIncoming = false;
        return work(this);
      }

      return new Promise(function (resolve, reject) {
        if ('production' !== process.env.NODE_ENV) {
          var queue = _this._queue;

          if (queue.length) {
            var current = queue[0];

            _common.logger.warn("The action you're trying to perform (".concat(description || 'unnamed', ") can't be performed yet, beacuse there are ").concat(queue.length, " actions in the queue. Current action: ").concat(current.description || 'unnamed', ". Ignore this message if everything is working fine. But if your actions are not running, it's because the current action is stuck. Remember that if you're calling an action from an action, you must use subAction(). See docs for more details."));

            _common.logger.log("Enqueued action:", work);

            _common.logger.log("Running action:", current.work);
          }
        }

        _this._queue.push({
          work: work,
          resolve: resolve,
          reject: reject,
          description: description
        });

        if (1 === _this._queue.length) {
          _this._executeNext();
        }
      });
    }
  }, {
    key: "subAction",
    value: function subAction(action) {
      try {
        this._subActionIncoming = true;
        return action();
      } catch (error) {
        this._subActionIncoming = false;
        return Promise.reject(error);
      }
    }
  }, {
    key: "_executeNext",
    value: function () {
      var _executeNext2 = _asyncToGenerator(function* () {
        var _this2 = this;

        var {
          work: work,
          resolve: resolve,
          reject: reject
        } = this._queue[0];

        try {
          var workPromise = work(this);

          if ('production' !== process.env.NODE_ENV) {
            (0, _common.invariant)(workPromise instanceof Promise, "The function passed to database.action() or a method marked as @action must be asynchronous \u2014 either marked as 'async' or always returning a promise (in: ".concat(this._queue[0].description || 'unnamed', ")"));
          }

          resolve((yield workPromise));
        } catch (error) {
          reject(error);
        }

        this._queue.shift();

        if (this._queue.length) {
          setTimeout(function () {
            return _this2._executeNext();
          }, 0);
        }
      });

      return function _executeNext() {
        return _executeNext2.apply(this, arguments);
      };
    }()
  }, {
    key: "isRunning",
    get: function get() {
      return 0 < this._queue.length;
    }
  }]);

  return ActionQueue;
}();

exports.default = ActionQueue;