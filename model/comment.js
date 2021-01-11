const db = require('~/lib/db');

const MODEL_NAME = 'comments';

/**
  * Create new comment
  * @param {Object} data     Comment data
*/
exports.create = async (data) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.insertOne(data);
};

/**
  * Update comment
  * @param {Object} condition
  * @param {Object} data
*/
exports.update = async (condition, data) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.updateOne(condition, { $set: data });
};

/**
  * Delete comment
  * @param {Object} condition
*/
exports.delete = async (condition) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.deleteOne(condition, function (err) {
    if (err) console.log(err);
  });
};

/**
  * Get comment by id
  * @param {String} id Comment id
  * @param {Array}  fields Comment fields
  * @returns {Promise<Object>}
*/
exports.getCommentById = async (id, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find({ _id: db.ObjectID(id) })
    .project(db.fieldProjector(fields))
    .next();
};

/**
  * Get comment by key
  * @param {Object} key
  * @param {Array}  fields Comment fields
  * @returns {Promise<Object>}
*/
exports.getCommentByKey = async (key, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find(key)
    .project(db.fieldProjector(fields))
    .next();
};

/**
  * Get all comments by post id
  * @param {Object} postId
  * @param {Array}  fields Comment fields
  * @returns {Promise<Object>}
*/
exports.getAllCommentsByPostId = async (postId, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find(postId)
    .project(db.fieldProjector(fields))
    .toArray();
};
