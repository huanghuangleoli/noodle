var _ = require('lodash');
var async = require('async');
var passport = require('passport');
var secrets = require('../config/secrets');

/**
 * GET /posts
 */
exports.getPosts = function(req, res) {
  res.send('TODO: return a list of posts');
};

/**
 * GET /posts/mylikes
 */
exports.getPostsMylikes = function(req, res) {
  res.send('TODO: return liked posts for user ' + req.user.email);
};