"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = randomId;

var _rambdax = require("rambdax");

// Only numers and letters for human friendliness
var alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
var idLength = 16;

var randomCharacter = function () {
  var random = Math.floor(Math.random() * alphabet.length);
  return alphabet[random];
}; // Note: for explanation of generating record IDs on the client side, see:
// https://github.com/Nozbe/WatermelonDB/issues/5#issuecomment-442046292


function randomId() {
  return (0, _rambdax.join)('', (0, _rambdax.times)(randomCharacter, idLength));
}