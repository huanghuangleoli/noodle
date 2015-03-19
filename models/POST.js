var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var postSchema = new Schema({
  title: {
    type: String
  },
  creditTo: { type: String },
  creditURL: { type: String },
  photo: { type: String },
  URL: { type: String },
  likes: { type: Number },
  viewed: { type: Number },
  time: {
    prepare: {type: Number},
    inactive: {type: Number},
    cook: {type: Number}
  },
  steps: [ String ],
  video: { type: String },
  elements: [{
    id: { type: ObjectId },
    name: { type: String },
    unit: { type: String },
    amount: { type: Number },
    addi: { type: String }
  }],
  dishType: [ String ],
  occasions: [ String],
  specials: [ String ],
  origins: { type: String },
  tags: { type: [ String ] },
  state: { type: String },
  creator: ObjectId,
  createdAt: { type: Date },
  updateAt: { type: Date },
  repost: { type: ObjectId },
  service: [ ObjectId ]
});

module.exports.postSchema = postSchema;
module.exports.Post = mongoose.model('Posts', postSchema);