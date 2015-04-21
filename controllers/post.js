var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Post = require('../models/Post');
var postModel = mongoose.model('Post', Post.postSchema);

var User = require('../models/User');

var NUM_OF_POSTS = 10;

/**
 * GET /posts
 * GET /posts?offset=2&contains=Chicken
 *
 * sorted by title from A to Z
 * limit to [NUM_OF_POSTS] posts per response
 *
 * offset
 * contains: search query, should have 3 ~ 16 characters
 *           otherwise is ignored.
 */
exports.getPost = function(req, res) {
  var offset = req.query['offset'];
  offset = offset ? offset : 0;
  var contains = req.query['contains'];
  var id = req.query['id'];
  var category = req.query['category']

  if (id != null || category != null) {
    req.assert('id', 'id must be 24 chars long').len(24);
    if (req.validationErrors()) {
      res.status(400).send('Error: invalid post');
      return;
    }
    id = id.substring(0, 24);
    postModel.collection.find({
      _id: ObjectId(id),
      category: category
    }).toArray(function(err, docs) {
      if (!err && docs && docs.length > 0) {
        console.log('Found id ' + id);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
        res.setHeader('Access-Control-Allow-Credential', true);
        res.send(JSON.parse(JSON.stringify(docs[0])));
      } else {
        res.status(400).send('Error: post not found for oid ' + id);
      }
    });
  } else {
    postModel.collection
        .find({
          '$text': {
            '$search': contains
          }
        }, {
          title: 1,
          tags: 1,
          dishType: 1,
          occasions: 1,
          specials: 1,
          origins: 1,
          textScore: {
            $meta: "textScore"
          }
        })
        .limit(NUM_OF_POSTS)
        .sort({
          textScore: {
            $meta: 'textScore'
          }
        })
        .toArray(function (err, docs) {
          if (err) {
            // 启动备用方案，只搜索title
            console.log('Error on indexing, use backup search.')
            Post.Post
                .find({title: new RegExp(contains)})
                .skip(offset)
                .limit(NUM_OF_POSTS)
                .sort('-title')
                .exec(function (err, newDocs) {
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
                  res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
                  res.setHeader('Access-Control-Allow-Credential', true);
                  res.send(JSON.parse(JSON.stringify(newDocs)));
                })
          } else {
            console.log('No error on indexing search.');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
            res.setHeader('Access-Control-Allow-Credential', true);
            res.send(JSON.parse(JSON.stringify(docs)));
          }
        });
  }
};

/*
 * POST /posts
 */
exports.postPost = function(req, res, next) {
  req.assert('title', 'Title must be at least 8 characters long').len(8);
  if (req.validationErrors()) {
    res.status(400).send('Error: invalid post');
    return;
  }
  Post.Post
      .findOne({ title: req.body.title})
      .exec(function(err, existPost) {
        if (existPost) {
          res.status(400).send('Error: title already exists');
          return;
        }
        var post = new Post.Post(req.body);
        post.tags = req.tags.join();
        post.creator = req.user._id;
        post.save(function(err) {
          if (err) return next(err);
          res.redirect('/');
        });
      });
};

/*
 * PUT /posts
 */
exports.postPostUpdate = function(req, res, next) {
  Post.Post
      .findById(req.query['id'], function(err, doc) {
    if (err) return next(err);
    doc.title = req.body.title || '';
        console.log(doc.title);

    doc.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'post updated.' });
    });
  });
};

/**
 * GET /posts/myposts
 */
exports.getPostMyposts = function(req, res) {
  var offset = req.query['offset'];
  offset = offset ? offset : 0;
  console.log('Get mypost for user ' + req.user.email);
  Post.Post
      .find({creator: ObjectId(req.user.id)}, {})
      .skip(offset)
      .limit(NUM_OF_POSTS)
      .sort('-title')
      .exec(function(err, docs) {
    if (!err && docs) {
      console.log(docs);
      res.send(JSON.parse(JSON.stringify(docs)));
    } else {
      res.status(400).send('No posts');
    }
  });
};

/**
 * GET /posts/mylikes
 */
exports.getPostMylikes = function(req, res) {
  var offset = req.query['offset'];
  offset = offset ? offset : 0;
  User
      .findOne({_id: ObjectId(req.user.id)})
      .exec(function(err, user) {
        postList = user.likedPost;
        if (postList && postList.length > 0) {
          console.log(user.likedPost.length);
          Post.Post
              .find({_id: {$in: postList}})
              .skip(offset)
              .limit(NUM_OF_POSTS)
              .exec(function(err, docs) {
                res.send(JSON.parse(JSON.stringify(docs)));
              });
        } else {
          res.status(400).send('No liked post');
        }
      });
};