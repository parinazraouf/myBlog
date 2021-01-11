const { app: appLimit } = require('~/config/limit');
const db = require('~/lib/db');

module.exports = async (modelName, fields, pageNumber, { condition, lookup } = {}) => {
  const limit = appLimit.paginationLimit;
  const offset = pageNumber * limit;

  const collection = await db.collection(modelName);

  const { recordCounts } = await collection.aggregate([
    { $count: 'recordCounts' },
    { $match: condition || {} }
  ])
    .next();

  const data = await collection.aggregate([
    { $project: db.fieldProjector(fields) },
    { $match: condition || {} },
    { $lookup: lookup || {} },
    { $skip: offset },
    { $limit: limit }
  ])
    .toArray();

  const lastPage = Math.ceil(recordCounts / limit);

  return {
    data,
    meta: {
      currentPage: pageNumber,
      totalCount: recordCounts,
      itemsPerPage: appLimit.paginationLimit,
      previousPage: pageNumber > 0 ? pageNumber - 1 : null,
      nextPage: pageNumber < lastPage - 1 ? pageNumber + 1 : null
    }
  };
};
