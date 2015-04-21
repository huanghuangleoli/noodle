var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Sorted by alphabet.
var vendorSchema = new Schema({
    name : { type: String },
    location : { type: String },
    website : { type: String },
    phone : { type: String },
    active : { type: Boolean },
    createdAt : { type: Date },
    updateAt : { type: Date }
});

module.exports.vendorSchema = vendorSchema;
module.exports.Vendor = mongoose.model('vendors', vendorSchema);