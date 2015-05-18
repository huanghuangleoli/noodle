var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var User = require('../models/User');
var Post = require('../models/Post');
var Element = require('../models/Element');


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
                if (thisUser.likedPost.indexOf(ObjectId(postid)) > -1) {
                  res.status(200).send('Post already liked');
                  return;
                }
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







/**
 * ELEMENT /like?elementid=123456789012345678901234
 */
exports.likeElement = function(req, res) {
  var elementid = req.query['elementid'];
  if (elementid) {
    req.assert('elementid', 'id must be 24 chars long').len(24);
    if (req.validationErrors()) {
      res.status(400).send('Error: invalid elementid');
      return;
    }
    elementid = elementid.substring(0, 24);
    Element.Element.findOne({_id: ObjectId(elementid)}).exec(function(err, thisElement) {
      if (!err && thisElement) {
        User.findOne({_id: ObjectId(req.user.id)})
            .exec(function(err, thisUser) {
              if (thisUser) {
                if (thisUser.likedElement.indexOf(ObjectId(elementid)) > -1) {
                  res.status(200).send('Element already liked');
                  return;
                }
                thisUser.likedElement.push(ObjectId(elementid));
                thisUser.save(function(err) {
                  if (err) return next(err);
                  res.status(200).send('Element ' + elementid + ' liked');
                })
              } else {
                res.status(400).send('Error: current user not in db')
              }
            });
      } else {
        res.status(400).send('Error: element not found');
      }
    });
  } else {
    res.status(400).send('Error: like should have elementid');
  }
};

/**
 * ELEMENT /unlike?elementid=123456789012345678901234
 */
exports.unlikeElement = function(req, res) {
  var elementid = req.query['elementid'];
  if (elementid) {
    req.assert('elementid', 'id must be 24 chars long').len(24);
    if (req.validationErrors()) {
      res.status(400).send('Error: invalid elementid');
      return;
    }
    elementid = elementid.substring(0, 24);
    User.findOne({_id: ObjectId(req.user.id)})
        .exec(function(err, thisUser) {
          if (thisUser) {
            var list = thisUser.likedElement;
            var index = thisUser.likedElement.indexOf(ObjectId(elementid));
            if (index > -1) {
              thisUser.likedElement.splice(index, 1);
              thisUser.save(function(err) {
                if (err) return next(err);
                res.status(200).send('Element ' + elementid + ' unliked');
              })
            } else {
              res.status(400).send('Error: elementid not in liked list');
            }
          } else {
            res.status(400).send('Error: current user not in db')
          }
        });
  } else {
    res.status(400).send('Error: like should have elementid');
  }
};