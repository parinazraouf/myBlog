const mongodb = require('mongodb');

// Connection URL
const url = 'mongodb://mongodb:27017/blogdb';

let db;

module.exports = {
  collection: async name => {
    if (db) {
      return db.collection(name);
    }

    const client = await mongodb.MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });
    db = client.db('blogdb');

    return db.collection(name);
  },

  fieldProjector: fields => fields.reduce((acc, value) => {
    acc[[value]] = 1;

    return acc;
  }, {}),

  ObjectID: mongodb.ObjectID
};
