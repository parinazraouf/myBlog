const db = require('~/lib/db');

const MODEL_NAME = 'posts';
const paginator = require('~/lib/paginator');

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
  * @returns {Promise<Array>}
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
  * @returns {Promise<Array>}
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
  * @param {number} pageNumber
  * @param {Object} options
  * @returns {Promise<Array>}
*/
exports.getAllPostsByAuthorId = async (authorId, fields, pageNumber, { condition, sort } = {}) => {
  return paginator(MODEL_NAME, fields, pageNumber, {
    match: condition,
    sort
  });
};

/**
  * Get all posts by category
  * @param {Object} category
  * @param {Array}  fields Post fields
  * @param {number} pageNumber
  * @param {Object} options
  * @returns {Promise<Array>}
*/
exports.getAllPostsByCategory = async (category, fields, pageNumber, { condition, sort } = {}) => {
  return paginator(MODEL_NAME, fields, pageNumber, {
    match: condition,
    sort
  });
};

/**
  * Get all posts
  * @param {Array}  fields Post fields
  * @param {number} pageNumber
  * @param {Object} options
  * @returns {Promise<Array>}
*/
exports.getAllPosts = async (fields, pageNumber, { sort } = {}) => {
  return paginator(MODEL_NAME, fields, pageNumber, {
    sort
  });
};
