const { app: appLimit } = require('~/config/limit');
const db = require('~/lib/db');

module.exports = async (modelName, fields, pageNumber, { match, sort, lookup, project = {} } = {}) => {
  const limit = appLimit.pageSize;
  const offset = pageNumber * limit;

  const collection = await db.collection(modelName);

  const { recordCounts } = await collection.aggregate([
    { $match: match || {} },
    { $count: 'recordCounts' }
  ])
    .next();

  const aggregates = [
    { $match: match || {} },
    { $project: { _id: 0, ...db.fieldProjector(fields), ...project } },
    { $skip: offset },
    { $limit: limit }
  ];

  // Add lookup to aggregates
  if (lookup) {
    aggregates.push({ $lookup: lookup });
  }

  // Add sort to aggregates
  if (sort) {
    aggregates.push({ $sort: sort });
  }

  const data = await collection
    .aggregate(aggregates)
    .toArray();

  const lastPage = Math.ceil(recordCounts / limit);

  return {
    data,
    meta: {
      currentPage: pageNumber,
      totalCount: recordCounts,
      itemsPerPage: appLimit.pageSize,
      previousPage: pageNumber > 0 ? pageNumber - 1 : null,
      nextPage: pageNumber < lastPage - 1 ? pageNumber + 1 : null
    }
  };
};
