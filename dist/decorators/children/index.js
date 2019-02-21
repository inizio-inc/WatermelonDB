"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _makeDecorator = _interopRequireDefault(require("../../utils/common/makeDecorator"));

var _logError = _interopRequireDefault(require("../../utils/common/logError"));

var _invariant = _interopRequireDefault(require("../../utils/common/invariant"));

var Q = _interopRequireWildcard(require("../../QueryDescription"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (null != obj) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Defines a model property that queries records that *belong_to* this model
// Pass name of the table with desired records. (The model defining a @children property must
// have a has_many association defined with this table)
//
// Example: a Task has_many Comments, so it may define:
//   @children('comment') comments: Query<Comment>
var children = (0, _makeDecorator.default)(function (childTable) {
  return function (target) {
    var association = target.constructor.associations[childTable];
    (0, _invariant.default)(association && 'has_many' === association.type, "@children decorator used for a table that's not has_many");
    return {
      get: function get() {
        // Use cached Query if possible
        this._childrenQueryCache = this._childrenQueryCache || {};
        var cachedQuery = this._childrenQueryCache[childTable];

        if (cachedQuery) {
          return cachedQuery;
        } // Cache new Query


        var that = this;
        var childCollection = that.collections.get(childTable);
        var query = childCollection.query(Q.where(association.foreignKey, that.id));
        this._childrenQueryCache[childTable] = query;
        return query;
      },
      set: function set() {
        (0, _logError.default)('Setter called on a @children-marked property');
      }
    };
  };
});
var _default = children;
exports.default = _default;