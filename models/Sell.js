var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Sorted by alphabet.
var sellSchema = new Schema({
    vendor : { type: ObjectId },
    element : { type: ObjectId },
    url : { type: String },
    price : {
      amount : { type: String },
      unit : { type: String }
    },
    active : { type: Boolean },
    createdAt : { type: Date },
    updateAt : { type: Date }
});

module.exports.sellSchema = sellSchema;
module.exports.Sell = mongoose.model('sells', sellSchema);