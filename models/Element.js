var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var elementSchema = new Schema({
  name : { type: String },
  brand : { type: String },
  vendor : { type: ObjectId },
  thumb : { type: String },
  photos : [ String ],
  intro : { type: String },
  ingredients : { type: String },
  category_1 : { type: String},
  category_2 : { type: String},
  category_3 : { type: String},
  certificates : [ String],
  tags : [ String ],
  state : String,
  creator : { type: ObjectId},
  createAt : Date,
  updateAt : Date,
  usedIn : [ObjectId]
});

module.exports.elementSchema = elementSchema;
module.exports.Element = mongoose.model('Elements', elementSchema);