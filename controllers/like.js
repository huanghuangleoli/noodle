var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var User = require('../models/User');
var Post = require('../models/Post');
var Element = require('../models/Element');


/**
 * POST /like/post?postid=123456789012345678901234
 */
exports.likePost = function(req, res) {
  var postid = req.query['postid'];
  if (!postid) {
    res.status(400).send({error: 'postid is empty'});
    return;
  }
  req.assert('postid', 'post oid is less than 24 characters').len(24);
  if (req.validationErrors()) {
    res.status(400).send({error: 'postid is less than 24 characters'});
    return;
  }
  postid = postid.substring(0, 24);
  Post.Post.findOne({_id: ObjectId(postid)}).exec(function (err, thisPost) {
    if (err || !thisPost) {
      res.status(400).send({error: 'post is not found'});
      return;
    }
    User.findOne({_id: ObjectId(req.user.id)}).exec(function (err, thisUser) {
      if (!thisUser) {
        res.status(400).send({error: 'user is not found'});
        return;
      }
      if (thisUser.likedPost.indexOf(ObjectId(postid)) > -1) {
        res.send({error: 'post was already liked'});
        return;
      }
      thisUser.likedPost.push(ObjectId(postid));
      thisUser.save(function (err) {
        if (err) {
          res.status(400).send({error: 'save error'});
          return;
        }
        res.send({succeed: 'post ' + postid + ' is liked'});
      });
    });
  });
};

/**
 * POST /unlike/post?postid=123456789012345678901234
 */
exports.unlikePost = function(req, res) {
  var postid = req.query['postid'];
  if (!postid) {
    res.status(400).send({error: 'postid is empty'});
    return;
  }
  req.assert('postid', 'postid is less than 24 characters').len(24);
  if (req.validationErrors()) {
    res.status(400).send({error: 'post oid is less than 24 characters'});
    return;
  }
  postid = postid.substring(0, 24);
  Post.Post.findOne({_id: ObjectId(postid)}).exec(function (err, thisPost) {
    if (err || !thisPost) {
      res.status(400).send({error: 'post is not found'});
      return;
    }
    User.findOne({_id: ObjectId(req.user.id)}).exec(function (err, thisUser) {
      if (!thisUser) {
        res.status(400).send({error: 'user is not found'});
        return;
      }
      var index = thisUser.likedPost.indexOf(ObjectId(postid));
      if (index == -1) {
        res.status(400).send({error: 'post was not liked'});
        return;
      }
      thisUser.likedPost.splice(index, 1);
      thisUser.save(function (err) {
        if (err) {
          res.status(400).send({error: 'save error'});
          return;
        }
        res.send({succeed: 'post ' + postid + ' is unliked'});
      });
    });
  });
};










/**
 * POST /like/element?elementid=123456789012345678901234
 */
exports.likeElement = function(req, res) {
  var elementid = req.query['elementid'];
  if (!elementid) {
    res.status(400).send({error: 'elementid is empty'});
    return;
  }
  req.assert('elementid', 'elementid is less than 24 characters').len(24);
  if (req.validationErrors()) {
    res.status(400).send({error: 'element oid is less than 24 characters'});
    return;
  }
  elementid = elementid.substring(0, 24);
  Element.Element.findOne({_id: ObjectId(elementid)}).exec(function (err, thisElement) {
    if (err || !thisElement) {
      res.status(400).send({error: 'element is not found'});
      return;
    }
    User.findOne({_id: ObjectId(req.user.id)}).exec(function (err, thisUser) {
      if (!thisUser) {
        res.status(400).send({error: 'user is not found'});
        return;
      }
      if (thisUser.likedElement.indexOf(ObjectId(elementid)) > -1) {
        res.send({error: 'element was already liked'});
        return;
      }
      thisUser.likedElement.push(ObjectId(elementid));
      thisUser.save(function (err) {
        if (err) {
          res.status(400).send({error: 'save error'});
          return;
        }
        res.send({succeed: 'element ' + elementid + ' is liked'});
      });
    });
  });
};

/**
 * POST /unlike/element?elementid=123456789012345678901234
 */
exports.unlikeElement = function(req, res) {
  var elementid = req.query['elementid'];
  if (!elementid) {
    res.status(400).send({error: 'elementid is empty'});
    return;
  }
  req.assert('elementid', 'element oid is less than 24 characters').len(24);
  if (req.validationErrors()) {
    res.status(400).send({error: 'elementid is less than 24 characters'});
    return;
  }
  elementid = elementid.substring(0, 24);
  Element.Element.findOne({_id: ObjectId(elementid)}).exec(function (err, thisElement) {
    if (err || !thisElement) {
      res.status(400).send({error: 'element is not found'});
      return;
    }
    User.findOne({_id: ObjectId(req.user.id)}).exec(function (err, thisUser) {
      if (!thisUser) {
        res.status(400).send({error: 'user is not found'});
        return;
      }
      var index = thisUser.likedElement.indexOf(ObjectId(elementid));
      if (index == -1) {
        res.status(400).send({error: 'element was not liked'});
        return;
      }
      thisUser.likedElement.splice(index, 1);
      thisUser.save(function (err) {
        if (err) {
          res.status(400).send({error: 'save error'});
          return;
        }
        res.send({succeed: 'element ' + elementid + ' is unliked'});
      });
    });
  });
};
