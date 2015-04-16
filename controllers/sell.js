var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Sell = require('../models/Sell');

/**
 * GET /sells
 */
exports.getSell = function(req, res) {
    var id = req.query['id'];

    var sellModel = mongoose.model('Sell', Sell.sellSchema);

    if (id != null) {
        sellModel.collection.find({
            _id: ObjectId(id)
        }).toArray(function(err, docs) {
            if (!err) {
                console.log('Found id ' + id);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
                res.setHeader('Access-Control-Allow-Credential', true);
                res.send(JSON.parse(JSON.stringify(docs)));
            } else {
                res.status(400).send('Error: sell not found for oid ' + id);
            }
        });
    } else {
        res.status(400).send('Error: sell id cannot be null');
    }
};
