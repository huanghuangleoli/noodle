var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Sorted by alphabet.
var postSchema = new Schema({
  // __v
  // _id
  createdAt: { type: Date },
  creator: ObjectId,
  creditTo: { type: String },
  creditURL: { type: String },
  dishType: [ String ],
  elements: [{
    name: { type: String },
    unit: { type: String },
    amount: { type: Number },
    addi: { type: String },
    id: { type: ObjectId }
  }],
  intro: { type: String },
  likes: { type: Number },
  occasions: [ String],
  origins: { type: String },
  photo: { type: String },
  serving: { type: String},
  specials: [ String ],
  state: { type: String },
  steps: [ String ],
  tags: { type: [ String ] },
  time: {
    prepare: { type: Number },
    inactive: { type: Number },
    cook: { type: Number }
  },
  title: { type: String },
  updateAt: { type: Date },
  url: { type: String },
  video: { type: String },
  viewed: { type: Number },
  repost: { type: ObjectId }
});

module.exports.postSchema = postSchema;
module.exports.Post = mongoose.model('Posts', postSchema);
