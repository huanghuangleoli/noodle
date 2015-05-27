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

// Deprecated!
// Use mongo to clean up.
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


// Deprecated!
// New json format is NOT valid.
// The only way of importing it is
// mongoimport --db dinneract --collection elements --file elements.json
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
            dishType: 'text',
            occasions: 'text',
            origins: 'text',
            specials: 'text',
            tags: 'text',
            title: 'text'
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
            db.close();
            mongoClient.close();
          });
    });
  });
}

function createIndexForElement() {
  var mongoClient = new MongoClient(new Server('localhost', 27017));
  var db;
  mongoClient.open(function (err, mongoClient) {
    db = mongoClient.db(dbName);
    db.collection('elements', function (colerr, collection) {
      collection.createIndex({
            name: 'text',
            tags: 'text',
            category_1: 'text',
            category_2: 'text',
            category_3: 'text'
          },
          {
            unique: false,
            background: true,
            weights: {
              name: 10,
              tags: 5,
              category_1: 3,
              category_2: 2,
              category_3: 1
            },
            w: 1
          },
          function (error, res) {
            if (error) {
              return console.error('failed ensureIndex with error', error);
            }
            console.log('ensureIndex succeeded with response', res);
            db.close();
            mongoClient.close();
          });
    });
  });
}

createIndexForPost();
createIndexForElement();

// mongoimport --db test --collection elements --file elements.json
// mongoimport --db test --collection posts --file posts.json
// mongoimport --db test --collection sells --file sells.json
// mongoimport --db test --collection vendors --file vendors.json
// mongoimport --db test --collection users --file users.json
