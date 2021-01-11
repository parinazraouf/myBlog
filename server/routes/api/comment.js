const db = require('~/lib/db');
const { httpInvariant } = require('~/lib/error');
const { Joi } = require('~/lib/validate');
const { comment: commentLimit } = require('~/config/limit');
const commentModel = require('~/model/comment');
const postModel = require('~/model/post');

const {
  app: appError,
  post: postError,
  comment: commentError
} = require('~/config/error');

const properties = {
  comment: [
    'id',
    'key',
    'content',
    'attachmentKey',
    'authorId',
    'postKey',
    'likesCount',
    'createdAt',
    'updatedAt',
    'deletedAt'
  ]
};

module.exports = router => {
  const sendCommentSchema = Joi.object().keys({
    id: Joi.string().required(),
    userId: Joi.string().required(),
    content: Joi.string().min(commentLimit.contentLengthRange[0]).max(commentLimit.contentLengthRange[1]).required().trim(),
    attachmentKey: Joi.string().uuid({ version: 'uuidv4' }),
    likesCount: Joi.number()
  });

  router.post('/comment/create/:id/:userId', async ctx => {
    const { id, userId, content, likesCount } = Joi.attempt({ ...ctx.request.body, userId: ctx.params.userId, id: ctx.params.id }, sendCommentSchema);

    const post = await postModel.getPostById(id, ['id', 'content']);

    // Check if post exists or doesn't
    httpInvariant(post, ...postError.postNotFound);

    const res = await commentModel.create({
      content,
      authorId: userId,
      postId: id,
      likesCount
    });

    ctx.body = res.ops;
  });

  const editCommentSchema = Joi.object().keys({
    _id: Joi.string().required(),
    userId: Joi.string().required(),
    content: Joi.string().min(commentLimit.contentLengthRange[0]).max(commentLimit.contentLengthRange[1]).required().trim()
  });

  router.put('/comment/:_id/:userId', async ctx => {
    const { _id, userId, content } = Joi.attempt({ ...ctx.request.body, userId: ctx.params.userId, _id: ctx.params._id }, editCommentSchema);

    const comment = await commentModel.getCommentById(_id, properties.comment);

    // Check comment existence
    httpInvariant(comment, ...commentError.commentNotFound);

    // Check comment's author
    httpInvariant(comment.authorId === userId, ...appError.forbiddenAccess);

    // Edit comment
    const res = await commentModel.update({ _id: db.ObjectID(_id) }, { content });

    ctx.body = !!res;
  });

  const deleteCommentSchema = Joi.object().keys({
    _id: Joi.string().required(),
    userId: Joi.string().required()
  });

  router.delete('/comment/:_id/:userId', async ctx => {
    const { _id, userId } = Joi.attempt({ _id: ctx.params._id, userId: ctx.params.userId }, deleteCommentSchema);

    const comment = await commentModel.getCommentById(_id, ['_id', 'postId', 'authorId']);

    // Check comment existence
    httpInvariant(comment, ...commentError.commentNotFound);

    const post = await postModel.getPostById(comment.postId, ['_id']);

    // Check comment's author
    httpInvariant(post && comment.authorId === userId, ...appError.forbiddenAccess);

    // Delete comment
    const res = await commentModel.delete({ _id: db.ObjectID(_id) });

    ctx.body = !res;
  });

  const getCommentByIdSchema = Joi.object().keys({
    id: Joi.string().required()
  });

  router.get('/comment/id/:id', async ctx => {
    const { id } = Joi.attempt({ id: ctx.params.id }, getCommentByIdSchema);

    // Check comment existence
    const comment = await commentModel.getCommentById(id, ['id']);

    httpInvariant(comment, ...commentError.commentNotFound);

    const res = await commentModel.getCommentById(id, properties.comment);

    ctx.body = res;
  });

  const getCommentByKeySchema = Joi.object().keys({
    key: Joi.string().required()
  });

  router.get('/comment/key/:key', async ctx => {
    const { key } = Joi.attempt({ key: ctx.params.key }, getCommentByKeySchema);

    // Check comment existence
    const comment = await commentModel.getCommentByKey(key, ['key']);

    httpInvariant(comment, ...commentError.commentNotFound);

    const res = await commentModel.getCommentByKey(key, properties.comment);

    ctx.body = res;
  });

  const getAllPostCommentsSchema = Joi.object().keys({
    id: Joi.string().required()
  });

  router.get('/comment/all/:id', async ctx => {
    const { id } = Joi.attempt({ id: ctx.params.id }, getAllPostCommentsSchema);

    const post = await postModel.getPostById(id, ['id']);

    // Check if post exists or doesn't
    httpInvariant(post, ...postError.postNotFound);

    const res = await commentModel.getAllCommentsByPostId(id, properties.comment);

    ctx.body = res;
  });

  const likeCommentSchema = Joi.object().keys({
    _id: Joi.string().required()
  });

  router.get('/comment/like/:_id', async ctx => {
    const { _id } = Joi.attempt({ _id: ctx.params._id }, likeCommentSchema);

    // Check comment existence
    const comment = await commentModel.getCommentById(_id, properties.comment);

    httpInvariant(comment, ...commentError.commentNotFound);

    await commentModel.update({ _id: db.ObjectID(_id) }, { likesCount: +comment.likesCount + 1 });

    // Total count
    const total = +comment.likesCount + 1;

    ctx.body = { total };
  });
};
