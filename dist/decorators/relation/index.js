"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _common = require("../common");

var _Relation = _interopRequireDefault(require("../../Relation"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Defines a model property that fetches a record with a specific ID
// Returns an mutable Relation object
// - when the fetched record changes
// - when the record ID changes (new record must be fetched)
// - … or emits null whenever record ID is null
//
// If the record ID *can't* change, use `immutableRelation` for efficiency
//
// Property's setter assigns a new record (you pass the record, and the ID is set)
//
// relationIdColumn - name of the column with record ID
// relationTable - name of the table containing desired recods
//
// Example: a Task has a project it belongs to (and the project can change), so it may define:
//   @relation('project', 'project_id') project: Relation<Project>
var relation = function (relationTable, relationIdColumn, options) {
  return function (target, key, descriptor) {
    (0, _common.ensureDecoratorUsedProperly)(relationIdColumn, target, key, descriptor);
    return {
      get: function get() {
        this._relationCache = this._relationCache || {};
        var cachedRelation = this._relationCache[key];

        if (cachedRelation) {
          return cachedRelation;
        }

        var newRelation = new _Relation.default(this, relationTable, relationIdColumn, options || {
          isImmutable: false
        });
        this._relationCache[key] = newRelation;
        return newRelation;
      },
      set: function set() {
        throw new Error('Don\'t set relation directly. Use relation.set() instead');
      }
    };
  };
};

var _default = relation;
exports.default = _default;