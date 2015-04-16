var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Element = require('../models/Element');

var NUM_OF_ELEMENTS = 10;

/**
 * GET /elements
 * GET /elements?offset=2&contains=Chicken
 *
 * sorted by title from A to Z
 * limit to [NUM_OF_ELEMENTS] per response
 *
 * offset
 * contains: search query, should have 3 ~ 16 characters
 *           otherwise is ignored.
 */
exports.getElement = function(req, res) {
  var offset = req.query['offset'];
  offset = offset ? offset : 0;
  var contains = req.query['contains'];
  var id = req.query['id'];

  var elementModel = mongoose.model('Element', Element.elementSchema);

  if (id != null) {
    elementModel.collection.find({
      _id: ObjectId(id)
    }).toArray(function(err, docs) {
      if (!err) {
        console.log('Found id ' + id);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
        res.setHeader('Access-Control-Allow-Credential', true);
        res.send(JSON.parse(JSON.stringify(docs[0])));
      } else {
        res.status(400).send('Error: element not found for oid ' + id);
      }
    });
  } else {
    elementModel.collection.find({
      '$text': {
        '$search': contains
      }
    }, {
      name: 1,
      brand: 1,
      thumb: 1,
      photos: 1,
      ingredients: 1,
      intro: 1,
      category_1: 1,
      category_2: 1,
      category_3: 1,
      certificates: 1,
      tags: 1,
      creator: 1,
      createdAt: 1,
      updateAt: 1,
      textScore: {
        $meta: "textScore"
      }
    })
    .skip(offset)
    .limit(NUM_OF_ELEMENTS)
    .sort({
      textScore: {
        $meta: 'textScore'
      }
    })
    .toArray(function (err, docs) {
      if (err) {
        // 启动备用方案，只搜索title
        console.log('Error on indexing, use backup search.')
        Element.Element.find({title: new RegExp(contains)})
            .skip(offset)
            .limit(NUM_OF_ELEMENTS)
            .sort('-title')
            .exec(function (err, newDocs) {
              res.send(JSON.parse(JSON.stringify(newDocs)));
            })
      } else {
        console.log('No error on indexing search.')
        res.send(JSON.parse(JSON.stringify(docs)));
      }
    });
  }
};

/*
 * POST /elements
 */
exports.postElement = function(req, res, next) {
  req.assert('title', 'Title must be at least 8 characters long').len(8);
  if (req.validationErrors()) {
    res.status(400).send('Error: invalid post');
    return;
  }
  Element.Element
      .findOne({ title: req.body.title})
      .exec(function(err, existElement) {
        if (existElement) {
          res.status(400).send('Error: title already exists');
          return;
        }
        var element = new Element.Element(req.body);
        element.tags = req.tags.join();
        element.creator = req.user._id;
        element.save(function(err) {
          if (err) return next(err);
          res.redirect('/');
        });
      });
};

/**
 * GET /elements/myelements
 */
exports.getMyelements = function(req, res) {
  res.send('TODO: return elements created for user ' + req.user.email);
};