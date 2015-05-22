var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Element = require('../models/Element');
var elementModel = mongoose.model('Element', Element.elementSchema);
var User = require('../models/User');

var NUM_OF_ELEMENTS = 12;

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
  var sortCriteria = '-createdAt';
  if (req.query['sort'] && req.query['sort'] == 'name') {
    sortCriteria = 'name';
  }

  if (id != null) {
    req.assert('id', 'id must be 24 chars long').len(24);
    if (req.validationErrors()) {
      res.status(400).send('Error: invalid id');
      return;
    }
    id = id.substring(0, 24);
    elementModel.collection.find({
      _id: ObjectId(id)
    }).toArray(function(err, docs) {
      if (!err && docs && docs.length > 0) {
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
        console.log('No search.');
        Element.Element
            .find()
            .skip(offset)
            .limit(NUM_OF_ELEMENTS)
            .sort(sortCriteria)
            .exec(function (err, newDocs) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
              res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
              res.setHeader('Access-Control-Allow-Credential', true);
              res.send(JSON.parse(JSON.stringify(newDocs)));
            })
      } else {
        console.log('No error on indexing search.')
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
  var offset = req.query['offset'];
  offset = offset ? offset : 0;
  console.log('Get myelements for user ' + req.user.email);
  var sortCriteria = '-createdAt';
  if (req.query['sort'] && req.query['sort'] == 'name') {
    sortCriteria = 'name';
  }

  Element.Element
      .find({creator: ObjectId(req.user.id)}, {})
      .skip(offset)
      .limit(NUM_OF_ELEMENTS)
      .sort(sortCriteria)
      .exec(function(err, docs) {
        if (!err & docs) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
          res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
          res.setHeader('Access-Control-Allow-Credential', true);
          res.send(JSON.parse(JSON.stringify(docs)));
        } else {
          res.status(400).send('No elements');
        }
      });
};

/**
* GET /elements/mylikes
*/
exports.getElementMylikes = function(req, res) {
  var offset = req.query['offset'];
  offset = offset ? offset : 0;
  User
      .findOne({_id: ObjectId(req.user.id)})
      .exec(function(err, user) {
        elementList = user.likedElement;
        if (elementList && elementList.length > 0) {
          console.log(user.likedElement.length);
          Element.Element
              .find({_id: {$in: elementList}})
              .skip(offset)
              .limit(NUM_OF_ELEMENTS)
              .exec(function(err, docs) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
                res.setHeader('Access-Control-Allow-Credential', true);
                res.send(JSON.parse(JSON.stringify(docs)));
              });
        } else {
          res.status(400).send('No liked element');
        }
      });
};