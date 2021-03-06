var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Element = require('../models/Element');
var elementModel = mongoose.model('Element', Element.elementSchema);

var User = require('../models/User');

var NUM_OF_ELEMENTS = 12;

/* ================ RESTful APIs ================ */

/**
 * GET /elements
 * GET /elements?offset=2&contains=Chicken
 *
 * sorted by name from A to Z
 * limit to [NUM_OF_POSTS] elements per response
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
  var category = req.query['category'];
  var sortCriteria = '-createdAt';
  if (req.query['sort'] && req.query['sort'] == 'name') {
    sortCriteria = 'name';
  }

  if (id != null || category != null) {
    id = id.trim();
    if (id && id.length < 24) {
      res.status(400).send({error: 'element id is invalid'});
      return;
    } else {
      id = id.substring(0, 24);
    }
    console.log(id);
    elementModel.collection.find({
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
        res.status(400).send({error: 'element ' + id + ' is not found'});
      }
    });
  } else {
    elementModel.collection
        .find({
          '$text': {
            '$search': contains
          }
        }, {
          name: 1,
          brand: 1,
          vendor: 1,
          url: 1,
          price: 1,
          thumb: 1,
          photo: 1,
          intro: 1,
          certificates: 1,
          ingredients: 1,
          active: 1,
          category_1: 1,
          category_2: 1,
          category_3: 1,
          tags: 1,
          createdAt: 1,
          creator: 1,
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
          },
          createdAt: -1
        })
        .toArray(function (err, docs) {
          if (err || !docs) {
            console.log('No search.');
            Element.Element
                .find()
                .skip(offset)
                .limit(NUM_OF_ELEMENTS)
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
 * POST /elements
 */
exports.postElement = function(req, res) {
  req.assert('name', 'Name must be at least 8 characters long').len(8);
  if (req.validationErrors()) {
    res.status(400).send({error: 'element name has less than 8 characters'});
    return;
  }
  Element.Element
      .findOne({ name: req.body.name})
      .exec(function(err, existElement) {
        if (existElement) {
          res.status(400).send({error: 'name already exists'});
          return;
        }
        var element = new Element.Element(req.body);
        element.creator = req.user._id;
        element.createdAt = new Date(Date.now());
        element.save(function(err) {
          if (err) {
            res.status(400).send({error: 'insert element error'});
            return;
          }
          res.status(200).send({success: 'element is created'});
        });
      });
};

/*
 * PUT /elements
 */
var UPDATE_FIELDS = [
  'name',
  'brand',
  'vendor',
  'url',
  'price',
  'thumb',
  'photo',
  'intro',
  'certificates',
  'ingredients',
  'active',
  'category_1',
  'category_2',
  'category_3',
  'tags',
  'createdAt',
  'creator',
  'updateAt'
];
exports.putElement = function(req, res) {
  var id = req.query['id'];

  if (!id || id.length < 24) {
    console.log(id);
    res.status(400).send({error: 'element id is invalid'});
    return;
  }

  Element.Element
      .findById(id, function(err, doc) {
        if (err || !doc) {
          res.status(400).send({error: 'element is not found'});
          return;
        }
        if (req.user._id != doc.creator.toString()) {
          console.log('user is ' + req.user._id);
          console.log('element creator is ' + doc.creator);
          res.status(400).send({error: 'permission denied'});
          return;
        }
        UPDATE_FIELDS.forEach(function(field) {
          doc[field] = req.body[field] || '';
        });
        doc.updateAt = Date.now();

        doc.save(function(err) {
          if (err) {
            res.status(400).send({error: 'modify element error'});
            return;
          }
          res.send({success: 'element is updated'});
        });
      });
};

/**
 * GET /elements/myelements
 */
exports.getElementMyelements = function(req, res) {
  var offset = req.query['offset'];
  offset = offset ? offset : 0;
  console.log('Get myelement for user ' + req.user.email);
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
        if (!err && docs) {
          console.log(docs);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
          res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
          res.setHeader('Access-Control-Allow-Credential', true);
          res.send(JSON.parse(JSON.stringify(docs)));
        } else {
          res.status(400).send({error: 'get my element error'});
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
          res.status(400).send({error: 'get my liked element error'});
        }
      });
};
