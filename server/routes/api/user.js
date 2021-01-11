const db = require('~/lib/db');
const { httpInvariant } = require('~/lib/error');
const { Joi } = require('~/lib/validate');
const { user: userLimit } = require('~/config/limit');
const { app: appLimit } = require('~/config/limit');
const userModel = require('~/model/user');

const {
  user: userError
} = require('~/config/error');

const properties = {
  user: [
    'key',
    'phoneNumber',
    'displayName',
    'userName',
    'password',
    'avatarKey',
    'createdAt',
    'updatedAt',
    'deletedAt'
  ]
};

module.exports = router => {
  const createUserSchema = Joi.object().keys({
    phoneNumber: Joi.phoneNumber().irMobile().required(),
    displayName: Joi.string().min(userLimit.displayNameLengthRange[0]).max(userLimit.displayNameLengthRange[1]).required().trim(),
    userName: Joi.string().min(userLimit.usernameLengthRange[0]).max(userLimit.usernameLengthRange[1]).required().trim(),
    password: Joi.string().min(appLimit.passwordLengthRange[0]).max(appLimit.passwordLengthRange[1]).required(),
    avatarKey: Joi.string().uuid({ version: 'uuidv4' }).allow(null)
  });

  router.post('/user/create', async ctx => {
    const data = Joi.attempt(ctx.request.body, createUserSchema);

    // Insert `user` record
    const user = await userModel.create({
      phoneNumber: data.phoneNumber,
      displayName: data.displayName,
      userName: data.userName,
      password: data.password,
      avatarKey: data.avatarKey
    });

    ctx.body = !!user;
  });

  const editUserSchema = Joi.object().keys({
    _id: Joi.string().required(),
    data: Joi.object().keys({
      phoneNumber: Joi.phoneNumber().irMobile(),
      displayName: Joi.string().min(userLimit.displayNameLengthRange[0]).max(userLimit.displayNameLengthRange[1]).trim(),
      userName: Joi.name().username(),
      password: Joi.string().min(appLimit.passwordLengthRange[0]).max(appLimit.passwordLengthRange[1])
    })
  });

  router.put('/user/:_id', async ctx => {
    const { _id, data } = Joi.attempt({ data: ctx.request.body, _id: ctx.params._id }, editUserSchema);

    const user = await userModel.getUserById(_id, properties.user);

    // Check user existence
    httpInvariant(user, ...userError.userNotFound);

    if (data.userName) {
      const isExist = await userModel.getUserByUserName({ userName: data.userName }, ['userName']);

      // Check username existence
      httpInvariant(!isExist, ...userError.usernameAlreadyTaken);
    }

    // Edit user
    const updatedUser = await userModel.update({ _id: db.ObjectID(_id) }, data);

    ctx.body = !!updatedUser;
  });

  const deleteUserSchema = Joi.object().keys({
    _id: Joi.string().required()
  });

  router.delete('/user/:_id', async ctx => {
    const { _id } = Joi.attempt({ _id: ctx.params._id }, deleteUserSchema);

    // Check user existence
    const user = await userModel.getUserById(_id, properties.user);

    httpInvariant(user, ...userError.userNotFound);

    // Delete user
    const res = await userModel.delete({ _id: db.ObjectID(_id) });

    ctx.body = !res;
  });

  const getUserByIdSchema = Joi.object().keys({
    id: Joi.string().required()
  });

  router.get('/user/id/:id', async ctx => {
    const { id } = Joi.attempt({ id: ctx.params.id }, getUserByIdSchema);

    // Check user existence
    const user = await userModel.getUserById(id, properties.user);

    httpInvariant(user, ...userError.userNotFound);

    ctx.body = user;
  });

  const getUserByKeySchema = Joi.object().keys({
    key: Joi.string().uuid({ version: 'uuidv4' }).required()
  });

  router.get('/user/key/:key', async ctx => {
    const { key } = Joi.attempt({ key: ctx.params.key }, getUserByKeySchema);

    // Check user existence
    const user = await userModel.getUserByKey(key, properties.user);

    httpInvariant(user, ...userError.userNotFound);

    ctx.body = user;
  });

  const getUserByUserNameSchema = Joi.object().keys({
    userName: Joi.name().username().required()
  });

  router.get('/user/username/:userName', async ctx => {
    const { userName } = Joi.attempt({ userName: ctx.params.userName }, getUserByUserNameSchema);

    // Check user existence
    const user = await userModel.getUserByUserName({ userName }, properties.user);

    httpInvariant(user, ...userError.userNotFound);

    ctx.body = user;
  });

  const getUserByPhoneNumberSchema = Joi.object().keys({
    phoneNumber: Joi.phoneNumber().irMobile().required()
  });

  router.get('/user/phonenumber/:phoneNumber', async ctx => {
    const { phoneNumber } = Joi.attempt({ phoneNumber: ctx.params.phoneNumber }, getUserByPhoneNumberSchema);

    // Check user existence
    const user = await userModel.getUserByPhoneNumber({ phoneNumber }, properties.user);

    httpInvariant(user, ...userError.userNotFound);

    ctx.body = user;
  });

  const checkUserNameExistenceSchema = Joi.object().keys({
    userName: Joi.name().username().required()
  });

  // Check username existence
  // This api returns `false` if username doesn't exist and `true` if username aleady exists
  router.get('/user/username/:userName/check', async ctx => {
    const { userName } = Joi.attempt({ userName: ctx.params.userName }, checkUserNameExistenceSchema);

    // Check username existence
    const user = await userModel.getUserByUserName({ userName }, ['key', 'userName']);

    ctx.body = !!user;
  });
};
