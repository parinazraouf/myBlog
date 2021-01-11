const db = require('~/lib/db');

const MODEL_NAME = 'posts';

/**
  * Create new post
  * @param {Object} data     Post data
*/
exports.create = async (data) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.insertOne(data);
};

/**
  * Update post
  * @param {Object} condition
  * @param {Object} data
*/
exports.update = async (condition, data) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.updateOne(condition, { $set: data });
};

/**
  * Delete post
  * @param {Object} condition
*/
exports.delete = async (condition) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.deleteOne(condition, function (err) {
    if (err) console.log(err);
  });
};

/**
  * Get post by id
  * @param {String} id Post id
  * @param {Array}  fields Post fields
  * @returns {Promise<Object>}
*/
exports.getPostById = async (id, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find({ _id: db.ObjectID(id) })
    .project(db.fieldProjector(fields))
    .next();
};

/**
  * Get post by key
  * @param {Object} key
  * @param {Array}  fields Post fields
  * @returns {Promise<Object>}
*/
exports.getPostByKey = async (key, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find(key)
    .project(db.fieldProjector(fields))
    .next();
};

/**
  * Get all posts by author id
  * @param {Object} authorId
  * @param {Array}  fields Post fields
  * @returns {Promise<Object>}
*/
exports.getAllPostsByAuthorId = async (authorId, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find(authorId)
    .project(db.fieldProjector(fields))
    .toArray();
};

/**
  * Get all posts by category
  * @param {Object} category
  * @param {Array}  fields Post fields
  * @returns {Promise<Object>}
*/
exports.getAllPostsByCategory = async (category, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find(category)
    .project(db.fieldProjector(fields))
    .toArray();
};

/**
  * Get all posts
  * @param {Array}  fields Post fields
  * @returns {Promise<Object>}
*/
exports.getAllPosts = async (fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find()
    .project(db.fieldProjector(fields))
    .toArray();
};
