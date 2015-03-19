var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var Server = mongo.Server;
var assert = require('assert');
var secrets = require('./config/secrets');

var dbName = secrets.dbName;

var collections = [
  'elements',
  'posts',
  'sells',
  'vendors'
];

function clearDB() {
  collections.forEach(function(collection) {
    var mongoClient = new MongoClient(new Server('localhost', 27017));
    var db;
    mongoClient.open(function (err, mongoClient) {
      db = mongoClient.db(dbName);
      db.dropCollection(collection, function (err, result) {
        db.collectionNames(collection, function (err, names) {
          assert.equal(0, names.length);
          console.log('collection ' + collection + ' is cleared.');
          db.close();
          mongoClient.close();
        });
      });
    });
  });
}

function loadFromJsonFile() {
  collections.forEach(function(collection) {
    var mongoClient = new MongoClient(new Server('localhost', 27017));
    var db;
    mongoClient.open(function (err, mongoClient) {
      db = mongoClient.db(dbName);
      db.createCollection(collection, {
        strict: true,
        capped: false,
        size: 5242880,
        autoIndexId: true,
        w: 1
      }, function (err, collectionFromDB) {
        if (err) {
          console.log(err);
        } else {
          var parsedJSON = require('./data/' + collection + '.json');
          for (var i = 0; i < parsedJSON.length; i++) {
            collectionFromDB.insert(parsedJSON[i], {}, function (colerr, result) {
            });
          }
        }
        console.log('Loaded ' + collection + '.json to db ' + dbName);
        db.close();
        mongoClient.close();
      });
    });
  });
}

function createIndexForPost() {
  var mongoClient = new MongoClient(new Server('localhost', 27017));
  var db;
  mongoClient.open(function (err, mongoClient) {
    db = mongoClient.db(dbName);
    db.collection('posts', function (colerr, collection) {
      collection.createIndex({
            title: 'text',
            tags: 'text',
            dishType: 'text',
            occasions: 'text',
            specials: 'text',
            origins: 'text'
          },
          {
            unique: false,
            background: true,
            weights: {
              title: 10,
              tags: 1
            },
            w: 1
          },
          function (error, res) {
            if (error) {
              return console.error('failed ensureIndex with error', error);
            }
            console.log('ensureIndex succeeded with response', res);
          });
    });
  });
}

//clearDB();
//loadFromJsonFile();
//createIndexForPost();

