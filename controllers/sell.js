var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Sell = require('../models/Sell');
var Element = require('../models/Element');
var Vendor = require('../models/Vendor');

/**
 * GET /sells
 */
exports.getSell = function(req, res) {
    var id = req.query['id'];

    var sellModel = mongoose.model('Sell', Sell.sellSchema);
    var elementModel = mongoose.model('Element', Element.elementSchema);

    if (id != null) {
        req.assert('id', 'id must be 24 chars long').len(24);
        if (req.validationErrors()) {
            res.status(400).send('Error: invalid id');
            return;
        }
        id = id.substring(0, 24);
        sellModel.collection.find({
            _id: ObjectId(id)
        }).toArray(function(err, docs) {
            if (!err && docs && docs.length > 0) {
                console.log('Found sell id ' + id);
                if (docs[0].element) {
                    elementModel.collection.find({
                        _id: docs[0].element
                    }).toArray(function(err, elementDocs) {
                        docs[0].element = elementDocs[0];
                        console.log(elementDocs.toString());
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
                        res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
                        res.setHeader('Access-Control-Allow-Credential', true);
                        res.send(JSON.parse(JSON.stringify(docs[0])));
                    });
                } else {
                    res.status(400).send('Error: sell has no element');
                }
            } else {
                res.status(400).send('Error: sell not found for oid ' + id);
            }
        });
    } else {
        res.status(400).send('Error: sell id cannot be null');
    }
};

/**
 * GET /sellsByElement
 */
exports.getSellByElement = function(req, res) {
    var id = req.query['id'];
    var offset = req.query['offset'];
    offset = offset ? offset : 0;

    var sellModel = mongoose.model('Sell', Sell.sellSchema);
    var vendorModel = mongoose.model('Vendor', Vendor.vendorSchema);

    if (id != null) {
        req.assert('id', 'id must be 24 chars long').len(24);
        if (req.validationErrors()) {
            res.status(400).send({error: 'id is invalid'});
            return;
        }
        id = id.substring(0, 24);
        sellModel.collection
            .find({
                element: ObjectId(id)
            })
            .skip(offset)
            .toArray(function(err, docs) {
            if (!err && docs && docs.length > 0) {
                console.log('Found element id ' + id);
                if (docs[0].vendor) {
                    vendorModel.collection
                        .find({
                            _id: docs[0].vendor
                        })
                        .toArray(function(err, vendorDocs) {
                        if (!err && vendorDocs && vendorDocs.length > 0) {
                            docs[0].vendorName = vendorDocs[0].name;
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
                            res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
                            res.setHeader('Access-Control-Allow-Credential', true);
                            res.send(JSON.parse(JSON.stringify(docs[0])));
                        }
                    });
                } else {
                    res.status(400).send({error: 'get sell by id'});
                }
            } else {
                res.status(400).send({error: 'get sell by id'});
            }
        });
    } else {
        res.status(400).send({error: 'get sell by id'});
    }
};
