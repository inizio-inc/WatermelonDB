"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash.clonedeep"));

var _lokiWorker = _interopRequireDefault(require("./lokiWorker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Simulates the web worker API for test env (while really just passing messages asynchronously
// on main thread)
var LokiWorkerMock =
/*#__PURE__*/
function () {
  function LokiWorkerMock() {
    var _this = this;

    _classCallCheck(this, LokiWorkerMock);

    this.onmessage = function () {};

    // $FlowFixMe
    this._workerContext = {
      postMessage: function postMessage(data) {
        var clonedData = (0, _lodash.default)(data);
        setImmediate(function () {
          _this.onmessage({
            data: clonedData
          });
        });
      },
      onmessage: function onmessage() {} // $FlowFixMe

    };
    this._worker = new _lokiWorker.default(this._workerContext);
  }

  _createClass(LokiWorkerMock, [{
    key: "postMessage",
    value: function postMessage(data) {
      var _this2 = this;

      var clonedData = (0, _lodash.default)(data);
      setImmediate(function () {
        // $FlowFixMe
        _this2._workerContext.onmessage({
          data: clonedData
        });
      });
    }
  }]);

  return LokiWorkerMock;
}();

exports.default = LokiWorkerMock;