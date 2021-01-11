const db = require('~/lib/db');

const MODEL_NAME = 'users';

/**
  * Create new user
  * @param {Object} data User data
  * @returns {Promise<Object>}
*/
exports.create = async data => {
  const collection = await db.collection(MODEL_NAME);

  return collection.insertOne(data);
};

/**
  * Update user
  * @param {Object} condition
  * @param {Object} data
*/
exports.update = async (condition, data) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.updateOne(condition, { $set: data });
};

/**
  * Delete user
  * @param {Object} condition
*/
exports.delete = async (condition) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.deleteOne(condition, function (err) {
    if (err) console.log(err);
  });
};

/**
  * Get user by id
  * @param {String} id User id
  * @param {Array}  fields User fields
  * @returns {Promise<Object>}
*/
exports.getUserById = async (id, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find({ _id: db.ObjectID(id) })
    .project(db.fieldProjector(fields))
    .next();
};

/**
  * Get user by key
  * @param {Object} key
  * @param {Array}  fields User fields
  * @returns {Promise<Object>}
*/
exports.getUserByKey = async (key, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find(key)
    .project(db.fieldProjector(fields))
    .next();
};

/**
  * Get user by phoneNumber
  * @param {Object} phoneNumber
  * @param {Array}  fields User fields
  * @returns {Promise<Object>}
*/
exports.getUserByPhoneNumber = async (phoneNumber, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find(phoneNumber)
    .project(db.fieldProjector(fields))
    .next();
};

/**
  * Get user by userName
  * @param {Object} userName
  * @param {Array}  fields User fields
  * @returns {Promise<Object>}
*/
exports.getUserByUserName = async (userName, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find(userName)
    .project(db.fieldProjector(fields))
    .next();
};
