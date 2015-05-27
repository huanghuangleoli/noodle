var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Post = require('../models/Post');
var postModel = mongoose.model('Post', Post.postSchema);

var User = require('../models/User');

var NUM_OF_POSTS = 30;

/* ================ RESTful APIs ================ */

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
  var category = req.query['category'];
  var sortCriteria = '-createdAt';
  if (req.query['sort'] && req.query['sort'] == 'name') {
    sortCriteria = 'title';
  }

  if (id != null || category != null) {
    id = id.trim();
    if (id && id.length < 24) {
      res.status(400).send({error: 'post id is invalid'});
      return;
    } else {
      id = id.substring(0, 24);
    }
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
        res.status(400).send({error: 'post ' + id + ' is not found'});
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
          createdAt: 1,
          creator: 1,
          updateAt: 1,
          textScore: {
            $meta: "textScore"
          }
        })
        .skip(offset)
        .limit(NUM_OF_POSTS)
        .sort({
          textScore: {
            $meta: 'textScore'
          },
	  createdAt: -1
        })
        .toArray(function (err, docs) {
          if (err || !docs) {
            console.log('No search.');
            Post.Post
                .find()
                .skip(offset)
                .limit(NUM_OF_POSTS)
                .sort(sortCriteria)
                .exec(function (err, newDocs) {
                  if (err || !newDocs) {
                    res.status(400).send({error: 'search error'});
                    return;
                  }
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
exports.postPost = function(req, res) {
  req.assert('title', 'Title must be at least 8 characters long').len(8);
  if (req.validationErrors()) {
    res.status(400).send({error: 'post title has less than 8 characters'});
    return;
  }
  Post.Post
      .findOne({ title: req.body.title})
      .exec(function(err, existPost) {
        if (existPost) {
          res.status(400).send({error: 'title already exists'});
          return;
        }
        var post = new Post.Post(req.body);
        post.creator = req.user._id;
        post.createdAt = new Date(Date.now());
        post.save(function(err) {
          if (err) {
            res.status(400).send({error: 'insert post error'});
            return;
          }
          res.status(200).send({success: 'post is created'});
        });
      });
};

/*
 * PUT /posts
 */
var UPDATE_FIELDS = [
  'title',
  'photo',
  'url',
  'dishType',
  'elements',
  'intro',
  'occasions',
  'origins',
  'serving',
  'specials',
  'state',
  'steps',
  'tags',
  'time',
  'video'
];
exports.putPost = function(req, res) {
  var id = req.query['id'];

  if (!id || id.length < 24) {
    console.log(id);
    res.status(400).send({error: 'post id is invalid'});
    return;
  }

  Post.Post
      .findById(id, function(err, doc) {
        if (err || !doc) {
          res.status(400).send({error: 'post is not found'});
          return;
        }
        if (req.user._id != doc.creator.toString()) {
          console.log('user is ' + req.user._id);
          console.log('post creator is ' + doc.creator);
          res.status(400).send({error: 'permission denied'});
          return;
        }
        UPDATE_FIELDS.forEach(function(field) {
          doc[field] = req.body[field] || '';
        });
        doc.updateAt = Date.now();

        doc.save(function(err) {
          if (err) {
            res.status(400).send({error: 'modify post error'});
            return;
          }
          res.send({success: 'post is updated'});
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
  var sortCriteria = '-createdAt';
  if (req.query['sort'] && req.query['sort'] == 'name') {
    sortCriteria = 'title';
  }

  Post.Post
      .find({creator: ObjectId(req.user.id)}, {})
      .skip(offset)
      .limit(NUM_OF_POSTS)
      .sort(sortCriteria)
      .exec(function(err, docs) {
    if (!err && docs) {
      console.log(docs);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
      res.setHeader('Access-Control-Allow-Credential', true);
      res.send(JSON.parse(JSON.stringify(docs)));
    } else {
      res.status(400).send({error: 'get my post error'});
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
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
                res.setHeader('Access-Control-Allow-Credential', true);
                res.send(JSON.parse(JSON.stringify(docs)));
              });
        } else {
          res.status(400).send({error: 'get my liked post error'});
        }
      });
};
