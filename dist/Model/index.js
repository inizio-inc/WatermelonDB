"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.associations = associations;
exports.default = void 0;

var _BehaviorSubject = require("rxjs/BehaviorSubject");

var _isDevelopment = _interopRequireDefault(require("../utils/common/isDevelopment"));

var _invariant = _interopRequireDefault(require("../utils/common/invariant"));

var _ensureSync = _interopRequireDefault(require("../utils/common/ensureSync"));

var _fromPairs = _interopRequireDefault(require("../utils/fp/fromPairs"));

var _noop = _interopRequireDefault(require("../utils/fp/noop"));

var _field = _interopRequireDefault(require("../decorators/field"));

var _readonly = _interopRequireDefault(require("../decorators/readonly"));

var _Schema = require("../Schema");

var _RawRecord = require("../RawRecord");

var _helpers = require("../sync/helpers");

var _helpers2 = require("./helpers");

var _dec, _dec2, _class, _descriptor, _descriptor2, _class2, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object['ke' + 'ys'](descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && void 0 !== desc.initializer) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (void 0 === desc.initializer) { Object['define' + 'Property'](target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper() { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.'); }

function associations(...associationList) {
  return (0, _fromPairs.default)(associationList);
}

var Model = (_dec = (0, _field.default)('id'), _dec2 = (0, _field.default)('_status'), (_class = (_temp = _class2 =
/*#__PURE__*/
function () {
  _createClass(Model, [{
    key: "update",
    // Set this in concrete Models to the name of the database table
    // Set this in concrete Models to define relationships between different records
    // `false` when instantiated but not yet in the database
    // `true` when prepareUpdate was called, but not yet sent to be executed
    // turns to `false` the moment the update is sent to be executed, even if database
    // did not respond yet
    // Modifies the model (using passed function) and saves it to the database.
    // Touches `updatedAt` if available.
    //
    // Example:
    // someTask.update(task => {
    //   task.name = 'New name'
    // })
    value: function () {
      var _update = _asyncToGenerator(function* (recordUpdater = _noop.default) {
        this.collection.database._ensureInAction("Model.update() can only be called from inside of an Action. See docs for more details.");

        this.prepareUpdate(recordUpdater);
        yield this.collection.database.batch(this);
      });

      return function update() {
        return _update.apply(this, arguments);
      };
    }() // Prepares an update to the database (using passed function).
    // Touches `updatedAt` if available.
    //
    // After preparing an update, you must execute it synchronously using
    // database.batch()

  }, {
    key: "prepareUpdate",
    value: function prepareUpdate(recordUpdater = _noop.default) {
      var _this = this;

      (0, _invariant.default)(this._isCommitted, "Cannot update uncommitted record");
      (0, _invariant.default)(!this._hasPendingUpdate, "Cannot update a record with pending updates");
      this._isEditing = true; // Touch updatedAt (if available)

      if ((0, _helpers2.hasUpdatedAt)(this)) {
        this._setRaw((0, _Schema.columnName)('updated_at'), Date.now());
      } // Perform updates


      (0, _ensureSync.default)(recordUpdater(this));
      this._isEditing = false;
      this._hasPendingUpdate = true; // TODO: `process.nextTick` doesn't work on React Native
      // We could polyfill with setImmediate, but it doesn't have the same effect — test and enseure
      // it would actually work for this purpose

      if (_isDevelopment.default && process && process.nextTick) {
        process.nextTick(function () {
          (0, _invariant.default)(!_this._hasPendingUpdate, "record.prepareUpdate was called on ".concat(_this.table, "#").concat(_this.id, " but wasn't sent to batch() synchronously -- this is bad!"));
        });
      }

      return this;
    } // Marks this record as deleted (will be permanently deleted after sync)
    // Note: Use this only with Sync

  }, {
    key: "markAsDeleted",
    value: function () {
      var _markAsDeleted = _asyncToGenerator(function* () {
        this.collection.database._ensureInAction("Model.markAsDeleted() can only be called from inside of an Action. See docs for more details.");

        (0, _invariant.default)(this._isCommitted, "Cannot mark as deleted uncommitted record");
        this._raw._status = 'deleted';
        yield this.collection._markAsDeleted(this);
      });

      return function markAsDeleted() {
        return _markAsDeleted.apply(this, arguments);
      };
    }() // Pernamently removes this record from the database
    // Note: Don't use this when using Sync

  }, {
    key: "destroyPermanently",
    value: function () {
      var _destroyPermanently = _asyncToGenerator(function* () {
        this.collection.database._ensureInAction("Model.destroyPermanently() can only be called from inside of an Action. See docs for more details.");

        (0, _invariant.default)(this._isCommitted, "Cannot destroy uncommitted record");
        yield this.collection._destroyPermanently(this);
      });

      return function destroyPermanently() {
        return _destroyPermanently.apply(this, arguments);
      };
    }() // *** Observing changes ***
    // Returns an observable that emits `this` upon subscription and every time this record changes
    // Emits `complete` if this record is destroyed

  }, {
    key: "observe",
    value: function observe() {
      (0, _invariant.default)(this._isCommitted, "Cannot observe uncommitted record");
      return this._changes;
    } // *** Implementation details ***

  }, {
    key: "batch",
    // See: Database.batch()
    // To be used by Model subclass methods only
    value: function batch(...records) {
      var _this$collection$data;

      return (_this$collection$data = this.collection.database).batch.apply(_this$collection$data, records);
    } // TODO: Document me
    // To be used by Model subclass methods only

  }, {
    key: "subAction",
    value: function subAction(action) {
      return this.collection.database._actionQueue.subAction(action);
    }
  }, {
    key: "collections",
    // Collections of other Models in the same domain as this record
    get: function get() {
      return this.collection.database.collections;
    }
  }, {
    key: "table",
    get: function get() {
      return this.constructor.table;
    } // Don't use this directly! Use `collection.create()`

  }]);

  function Model(collection, raw) {
    _classCallCheck(this, Model);

    this._isEditing = false;
    this._isCommitted = true;
    this._hasPendingUpdate = false;
    this._changes = new _BehaviorSubject.BehaviorSubject(this);

    _initializerDefineProperty(this, "id", _descriptor, this);

    _initializerDefineProperty(this, "syncStatus", _descriptor2, this);

    this.collection = collection;
    this._raw = raw;
  }

  _createClass(Model, [{
    key: "_notifyChanged",
    value: function _notifyChanged() {
      this._changes.next(this);
    }
  }, {
    key: "_notifyDestroyed",
    value: function _notifyDestroyed() {
      this._changes.complete();
    }
  }, {
    key: "_getRaw",
    value: function _getRaw(rawFieldName) {
      return this._raw[rawFieldName];
    }
  }, {
    key: "_setRaw",
    value: function _setRaw(rawFieldName, rawValue) {
      (0, _invariant.default)(this._isEditing, 'Not allowed to change record outside of create/update()');
      (0, _invariant.default)(!this._changes.isStopped && 'deleted' !== this._raw._status, 'Not allowed to change deleted records');
      (0, _helpers.setRawColumnChange)(this._raw, rawFieldName);
      (0, _RawRecord.setRawSanitized)(this._raw, rawFieldName, rawValue, this.collection.schema.columns[rawFieldName]);
    }
  }], [{
    key: "_prepareCreate",
    value: function _prepareCreate(collection, recordBuilder) {
      var record = new this(collection, // sanitizedRaw sets id
      (0, _RawRecord.sanitizedRaw)((0, _helpers2.createTimestampsFor)(this.prototype), collection.schema));
      record._isCommitted = false;
      record._isEditing = true;
      (0, _ensureSync.default)(recordBuilder(record));
      record._isEditing = false;
      return record;
    }
  }]);

  return Model;
}(), _class2.associations = {}, _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "id", [_readonly.default, _dec], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "syncStatus", [_readonly.default, _dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class));
exports.default = Model;