var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var User = require('../models/User');
var Post = require('../models/Post');

/**
 * POST /like?postid=123456789012345678901234
 */
exports.likePost = function(req, res) {
  var postid = req.query['postid'];
  if (postid) {
    req.assert('postid', 'id must be 24 chars long').len(24);
    if (req.validationErrors()) {
      res.status(400).send('Error: invalid postid');
      return;
    }
    postid = postid.substring(0, 24);
    Post.Post.findOne({_id: ObjectId(postid)}).exec(function(err, thisPost) {
      if (!err && thisPost) {
        User.findOne({_id: ObjectId(req.user.id)})
            .exec(function(err, thisUser) {
              if (thisUser) {
                var list = thisUser.likedPost;
                thisUser.likedPost.push(ObjectId(postid));
                thisUser.save(function(err) {
                    if (err) return next(err);
                    res.status(200).send('Post ' + postid + ' liked');
                })
              } else {
                res.status(400).send('Error: current user not in db')
              }
            });
      } else {
        res.status(400).send('Error: post not found');
      }
    });
  } else {
    res.status(400).send('Error: like should have postid');
  }
};

/**
 * POST /unlike?postid=123456789012345678901234
 */
exports.unlikePost = function(req, res) {
  var postid = req.query['postid'];
  if (postid) {
    req.assert('postid', 'id must be 24 chars long').len(24);
    if (req.validationErrors()) {
        res.status(400).send('Error: invalid postid');
        return;
    }
    postid = postid.substring(0, 24);
    User.findOne({_id: ObjectId(req.user.id)})
        .exec(function(err, thisUser) {
          if (thisUser) {
            var list = thisUser.likedPost;
            var index = thisUser.likedPost.indexOf(ObjectId(postid));
            if (index > -1) {
              thisUser.likedPost.splice(index, 1);
              thisUser.save(function(err) {
                if (err) return next(err);
                res.status(200).send('Post ' + postid + ' unliked');
              })
            } else {
              res.status(400).send('Error: postid not in liked list');
            }
          } else {
            res.status(400).send('Error: current user not in db')
          }
        });
    } else {
      res.status(400).send('Error: like should have postid');
    }
};