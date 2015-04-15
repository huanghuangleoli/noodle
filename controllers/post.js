var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var Post = require('../models/Post');

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

  var postModel = mongoose.model('Post', Post.postSchema);

  postModel.collection.find({
    '$text': {
      '$search': contains
    }}, {
    title: 1,
    tags: 1,
    dishType: 1,
    occasions: 1,
    specials: 1,
    origins: 1,
    textScore: {
      $meta: "textScore"
    }})
      .skip(offset)
      .limit(NUM_OF_POSTS)
      .sort({
        textScore: {
          $meta: 'textScore'
        }
      })
      .toArray(function(err, docs) {
        if (err) {
          // 启动备用方案，只搜索title
          console.log('Error on indexing, use backup search.')
          Post.Post.find({ title: new RegExp(contains)})
              .skip(offset)
              .limit(NUM_OF_POSTS)
              .sort('-title')
              .exec(function(err, newDocs) {
                res.send(JSON.parse(JSON.stringify(newDocs)));
              })
        } else {
          console.log('No error on indexing search.');
          res.header('Access-Control-Allow-Origin', 'null');
          res.send(JSON.parse(JSON.stringify(docs)));
        }
  });
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

/**
 * GET /posts/mylikes
 */
exports.getPostMylikes = function(req, res) {
  res.send('TODO: return liked posts for user ' + req.user.email);
};