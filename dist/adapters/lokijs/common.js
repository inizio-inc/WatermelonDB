"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.responseActions = exports.actions = void 0;
var actions = {
  SETUP: 'SETUP',
  FIND: 'FIND',
  QUERY: 'QUERY',
  COUNT: 'COUNT',
  BATCH: 'BATCH',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DESTROY_PERMANENTLY: 'DESTROY_PERMANENTLY',
  MARK_AS_DELETED: 'MARK_AS_DELETED',
  GET_DELETED_RECORDS: 'GET_DELETED_RECORDS',
  DESTROY_DELETED_RECORDS: 'DESTROY_DELETED_RECORDS',
  UNSAFE_RESET_DATABASE: 'UNSAFE_RESET_DATABASE',
  GET_LOCAL: 'GET_LOCAL',
  SET_LOCAL: 'SET_LOCAL',
  REMOVE_LOCAL: 'REMOVE_LOCAL'
};
exports.actions = actions;
var responseActions = {
  RESPONSE_SUCCESS: 'RESPONSE_SUCCESS',
  RESPONSE_ERROR: 'RESPONSE_ERROR'
};
exports.responseActions = responseActions;