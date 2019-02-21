"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = _interopRequireDefault(require("./worker/index.worker"));

var _common = require("./common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var {
  RESPONSE_SUCCESS: RESPONSE_SUCCESS,
  RESPONSE_ERROR: RESPONSE_ERROR
} = _common.responseActions;

var WorkerBridge =
/*#__PURE__*/
function () {
  function WorkerBridge() {
    _classCallCheck(this, WorkerBridge);

    this._worker = this._createWorker();
    this._pendingRequests = [];
  }

  _createClass(WorkerBridge, [{
    key: "_createWorker",
    value: function _createWorker() {
      var _this = this;

      var worker = new _index.default();

      worker.onmessage = function ({
        data: data
      }) {
        var {
          type: type,
          payload: payload
        } = data;

        var {
          resolve: resolve,
          reject: reject
        } = _this._pendingRequests.shift();

        if (type === RESPONSE_ERROR) {
          reject(payload);
        } else if (type === RESPONSE_SUCCESS) {
          resolve(payload);
        }
      };

      return worker;
    } // TODO: `any` should be `WorkerResponsePayload` here

  }, {
    key: "send",
    value: function send(type, payload = []) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2._pendingRequests.push({
          resolve: resolve,
          reject: reject
        });

        _this2._worker.postMessage({
          type: type,
          payload: payload
        });
      });
    }
  }]);

  return WorkerBridge;
}();

var _default = WorkerBridge;
exports.default = _default;