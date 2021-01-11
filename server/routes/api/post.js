const db = require('~/lib/db');
const { httpInvariant } = require('~/lib/error');
const { Joi } = require('~/lib/validate');
const { post: postLimit } = require('~/config/limit');
const postModel = require('~/model/post');
const userModel = require('~/model/user');

const {
  app: appError,
  post: postError,
  user: userError
} = require('~/config/error');

const properties = {
  post: [
    '_id',
    'key',
    'content',
    'category',
    'attachmentKey',
    'authorId',
    'likesCount',
    'commentsCount',
    'createdAt',
    'updatedAt',
    'deletedAt'
  ],
  user: [
    '_id',
    'phoneNumber',
    'userName',
    'displayName'
  ]
};

module.exports = router => {
  const createPostSchema = Joi.object().keys({
    userId: Joi.string().required(),
    data: Joi.object().keys({
      content: Joi.string()
        .min(postLimit.contentLengthRange[0])
        .max(postLimit.contentLengthRange[1])
        .required()
        .trim(),
      category: Joi.string()
        .min(postLimit.categoryLengthRange[0])
        .max(postLimit.categoryLengthRange[1])
        .required()
        .trim(),
      likesCount: Joi.number()
    })
  });

  router.post('/post/create/:userId', async ctx => {
    const { userId, data } = Joi.attempt({ data: ctx.request.body, userId: ctx.params.userId }, createPostSchema);

    const newPost = await postModel.create({
      authorId: userId,
      content: data.content,
      category: data.category,
      likesCount: data.likesCount
    });

    ctx.body = newPost.ops;
  });

  const editPostSchema = Joi.object().keys({
    _id: Joi.string().required(),
    userId: Joi.string().required(),
    data: Joi.object().keys({
      content: Joi.string()
        .min(postLimit.contentLengthRange[0])
        .max(postLimit.contentLengthRange[1])
        .trim(),
      category: Joi.string()
        .min(postLimit.categoryLengthRange[0])
        .max(postLimit.categoryLengthRange[1])
        .trim()
    })
  });

  router.put('/post/:_id/:userId', async ctx => {
    const { _id, userId, data } = Joi.attempt({
      _id: ctx.params._id,
      userId: ctx.params.userId,
      data: ctx.request.body
    }, editPostSchema);

    const post = await postModel.getPostById(_id, [
      'authorId',
      'createdAt'
    ]);

    // Check post existence
    httpInvariant(post, ...postError.postNotFound);

    // Check post's author
    httpInvariant(post.authorId === userId, ...appError.permissionDenied);

    // Edit post
    const res = await postModel.update({ _id: db.ObjectID(_id) }, { content: data.content, category: data.category });

    ctx.body = !!res;
  });

  const deletePostSchema = Joi.object().keys({
    _id: Joi.string().required(),
    userId: Joi.string().required()
  });

  router.delete('/post/:_id/:userId', async ctx => {
    const { _id, userId } = Joi.attempt({ _id: ctx.params._id, userId: ctx.params.userId }, deletePostSchema);

    // Check post existence
    const post = await postModel.getPostById(_id, ['_id', 'authorId']);

    httpInvariant(post, ...postError.postNotFound);

    // Check post's author
    httpInvariant(userId === post.authorId, ...appError.permissionDenied);

    // Delete post
    const res = await postModel.delete({ _id: db.ObjectID(_id) });

    ctx.body = !res;
  });

  const getPostByIdSchema = Joi.object().keys({
    id: Joi.string().required()
  });

  router.get('/post/id/:id', async ctx => {
    const { id } = Joi.attempt({ id: ctx.params.id }, getPostByIdSchema);

    // Check post existence
    const post = await postModel.getPostById(id, ['_id']);

    httpInvariant(post, ...postError.postNotFound);

    const res = await postModel.getPostById(id, properties.post);

    ctx.body = res;
  });

  const getPostByKeySchema = Joi.object().keys({
    key: Joi.string().uuid({ version: 'uuidv4' }).required()
  });

  router.get('/post/key/:key', async ctx => {
    const { key } = Joi.attempt({ key: ctx.params.key }, getPostByKeySchema);

    // Check post existence
    const post = await postModel.getPostByKey(key, ['key']);

    httpInvariant(post, ...postError.postNotFound);

    const res = await postModel.getPostByKey(key, properties.post);

    ctx.body = res;
  });

  const getAllPostsByAuthorIdSchema = Joi.object().keys({
    authorId: Joi.string().required()
  });

  router.get('/post/alluserposts/:authorId', async ctx => {
    const { authorId } = Joi.attempt({ authorId: ctx.params.authorId }, getAllPostsByAuthorIdSchema);

    // Check user existence
    const user = await userModel.getUserById(authorId, properties.user);

    httpInvariant(user, ...userError.userNotFound);

    const res = await postModel.getAllPostsByAuthorId({ authorId }, properties.post);

    ctx.body = res;
  });

  const getAllPostsByCategorySchema = Joi.object().keys({
    category: Joi.string()
      .min(postLimit.categoryLengthRange[0])
      .max(postLimit.categoryLengthRange[1])
      .required()
      .trim()
  });

  router.get('/post/category/:category', async ctx => {
    const { category } = Joi.attempt({ category: ctx.params.category }, getAllPostsByCategorySchema);

    const post = await postModel.getAllPostsByCategory({ category }, properties.post);

    ctx.body = post;
  });

  router.get('/post/all', async ctx => {
    const post = await postModel.getAllPosts(properties.post);

    ctx.body = post;
  });

  const likePostSchema = Joi.object().keys({
    _id: Joi.string().required()
  });

  router.get('/post/like/:_id', async ctx => {
    const { _id } = Joi.attempt({ _id: ctx.params._id }, likePostSchema);

    // Check post existence
    const post = await postModel.getPostById(_id, properties.post);

    httpInvariant(post, ...postError.postNotFound);

    await postModel.update({ _id: db.ObjectID(_id) }, { likesCount: +post.likesCount + 1 });

    // Total count
    const total = +post.likesCount + 1;

    ctx.body = { total };
  });
};
