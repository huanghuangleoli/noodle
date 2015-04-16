var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Sell = require('../models/Sell');
var Element = require('../models/Element');


/**
 * GET /sells
 */
exports.getSell = function(req, res) {
    var id = req.query['id'];

    var sellModel = mongoose.model('Sell', Sell.sellSchema);
    var elementModel = mongoose.model('Element', Element.elementSchema);

    if (id != null) {
        sellModel.collection.find({
            _id: ObjectId(id)
        }).toArray(function(err, docs) {
            if (!err && docs && docs.length > 0) {
                console.log('Found sell id ' + id);
                if (docs[0].element) {
                    elementModel.collection.find({
                        _id: docs[0].element
                    }).toArray(function(err, elementDocs) {
                        docs[0].element = elementDocs;
                        console.log(elementDocs.toString());
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
                        res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
                        res.setHeader('Access-Control-Allow-Credential', true);
                        res.send(JSON.parse(JSON.stringify(docs)));
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
