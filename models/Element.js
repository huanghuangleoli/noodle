var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Sorted by alphabet.
var elementSchema = new Schema({
  
  name : { type: String },
  brand : { type: String },
  
  vendor : { type: ObjectId },
  url : { type: String },
  price : {
  	amount : { type: String },
	  unit : { type: String }
  },
  
  thumb : { type: String },
  photos : [ String ],
  
  intro : { type: String },
  certificates : [ String ],
  ingredients : { type: String },
  
  active : { type: Boolean },
  
  category_1 : { type: String },
  category_2 : { type: String },
  category_3 : { type: String },
  tags : [ String ],
  
  creator : { type: ObjectId },
  createdAt : { type: Date },
  updateAt : { type: Date }
});

module.exports.elementSchema = elementSchema;
module.exports.Element = mongoose.model('Elements', elementSchema);