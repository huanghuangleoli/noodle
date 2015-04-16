var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Sorted by alphabet.
var elementSchema = new Schema({
  brand : { type: String },
  category_1 : { type: String },
  category_2 : { type: String },
  category_3 : { type: String },
  certificates : [ String ],
  createdAt : { type: Date },
  creator : { type: ObjectId },
  ingredients : { type: String },
  intro : { type: String },
  name : { type: String },
  photos : [ String ],
  state : { type: String },
  tags : [ String ],
  thumb : { type: String },
  updateAt : { type: Date }
});

module.exports.elementSchema = elementSchema;
module.exports.Element = mongoose.model('Elements', elementSchema);