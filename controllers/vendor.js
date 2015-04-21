var passport = require('passport');
var secrets = require('../config/secrets');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Vendor = require('../models/Vendor');
var Element = require('../models/Element');


/**
 * GET /vendors
 */
exports.getVendor = function(req, res) {
    var id = req.query['id'];
    var vendorModel = mongoose.model('Vendor', Vendor.vendorSchema);

    if (id != null) {
        req.assert('id', 'id must be 24 chars long').len(24);
        if (req.validationErrors()) {
            res.status(400).send('Error: invalid id');
            return;
        }
        id = id.substring(0, 24);
        vendorModel.collection.find({
            _id: ObjectId(id)
        }).toArray(function(err, docs) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
            res.setHeader('Access-Control-Allow-Credential', true);
            res.send(JSON.parse(JSON.stringify(docs[0])));
        });
    } else {
        res.status(400).send('Error: vendor id cannot be null');
    }
};
