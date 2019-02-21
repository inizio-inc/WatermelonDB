"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logError = _interopRequireDefault(require("../../../utils/common/logError"));

var _invariant = _interopRequireDefault(require("../../../utils/common/invariant"));

var _executor = _interopRequireDefault(require("./executor"));

var _queue = _interopRequireDefault(require("./queue"));

var _common = require("../common");

var _executorMethods;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || "[object Arguments]" === Object.prototype.toString.call(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ExecutorProto = _executor.default.prototype;
var executorMethods = (_executorMethods = {}, _executorMethods[_common.actions.SETUP] = ExecutorProto.setUp, _executorMethods[_common.actions.FIND] = ExecutorProto.find, _executorMethods[_common.actions.QUERY] = ExecutorProto.query, _executorMethods[_common.actions.COUNT] = ExecutorProto.count, _executorMethods[_common.actions.CREATE] = ExecutorProto.create, _executorMethods[_common.actions.BATCH] = ExecutorProto.batch, _executorMethods[_common.actions.UPDATE] = ExecutorProto.update, _executorMethods[_common.actions.DESTROY_PERMANENTLY] = ExecutorProto.destroyPermanently, _executorMethods[_common.actions.UNSAFE_RESET_DATABASE] = ExecutorProto.unsafeResetDatabase, _executorMethods[_common.actions.GET_LOCAL] = ExecutorProto.getLocal, _executorMethods[_common.actions.SET_LOCAL] = ExecutorProto.setLocal, _executorMethods[_common.actions.REMOVE_LOCAL] = ExecutorProto.removeLocal, _executorMethods[_common.actions.MARK_AS_DELETED] = ExecutorProto.markAsDeleted, _executorMethods[_common.actions.GET_DELETED_RECORDS] = ExecutorProto.getDeletedRecords, _executorMethods[_common.actions.DESTROY_DELETED_RECORDS] = ExecutorProto.destroyDeletedRecords, _executorMethods);
var {
  RESPONSE_SUCCESS: RESPONSE_SUCCESS,
  RESPONSE_ERROR: RESPONSE_ERROR
} = _common.responseActions;

var LokiWorker =
/*#__PURE__*/
function () {
  function LokiWorker(workerContext) {
    var _this = this;

    _classCallCheck(this, LokiWorker);

    this.workerContext = workerContext;

    this._setUpQueue(); // listen for messages
    // https://github.com/facebook/flow/blob/master/lib/bom.js#L504
    // looks like incorrect type, should be: onmessage: (ev: MessageEvent) => any;
    // PR: https://github.com/facebook/flow/pull/6100


    var context = this.workerContext;

    context.onmessage = function (e) {
      _this.asyncQueue.push(e.data, function (action) {
        var {
          type: type,
          payload: payload
        } = action;

        _this.workerContext.postMessage({
          type: type,
          payload: payload
        });
      });
    };
  }

  _createClass(LokiWorker, [{
    key: "_setUpQueue",
    value: function _setUpQueue() {
      var _this2 = this;

      this.asyncQueue = (0, _queue.default)(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (action, callback) {
          try {
            var {
              type: type,
              payload: payload
            } = action;
            (0, _invariant.default)(type in _common.actions, "Unknown worker action ".concat(type));

            if (type === _common.actions.SETUP) {
              // app just launched, set up executor with options sent
              (0, _invariant.default)(!_this2.executor, "Loki executor already set up - cannot set up again");
              var [options] = payload;
              var executor = new _executor.default(options); // set up, make this.executor available only if successful

              yield executor.setUp();
              _this2.executor = executor;
              callback({
                type: RESPONSE_SUCCESS,
                payload: null
              });
            } else {
              // run action
              (0, _invariant.default)(_this2.executor, "Cannot run actions because executor is not set up");
              var runExecutorAction = executorMethods[type].bind(_this2.executor);
              var response = yield runExecutorAction.apply(void 0, _toConsumableArray(payload));
              callback({
                type: RESPONSE_SUCCESS,
                payload: response
              });
            }
          } catch (error) {
            // Main process only receives error message — this logError is to retain call stack
            (0, _logError.default)(error);
            callback({
              type: RESPONSE_ERROR,
              payload: error
            });
          }
        });

        return function () {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }]);

  return LokiWorker;
}();

exports.default = LokiWorker;