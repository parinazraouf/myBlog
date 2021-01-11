const db = require('~/lib/db');

const MODEL_NAME = 'counters';

/**
  * Upsert counter
  * @param {Object} data     Counter data
*/
exports.upsert = async (data) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.insertOne(data);
};

/**
  * Get all by target id
  * @param {Object} targetId
  * @param {Array}  fields Counter fields
  * @returns {Promise<Object>}
*/
exports.getCounterByTarget = async (targetId, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find(targetId)
    .project(db.fieldProjector(fields))
    .next();
};

/**
  * Get counter by id
  * @param {String} id Counter id
  * @param {Array}  fields Counter fields
  * @returns {Promise<Object>}
*/
exports.getCounterById = async (id, fields) => {
  const collection = await db.collection(MODEL_NAME);

  return collection.find({ _id: db.ObjectID(id) })
    .project(db.fieldProjector(fields))
    .next();
};
