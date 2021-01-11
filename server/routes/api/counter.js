const { Joi } = require('~/lib/validate');
const { counter: counterEnum } = require('~/config/enum');
const counterModel = require('~/model/counter');

const properties = {
  counter: [
    'targetId',
    'targetType',
    'counterField',
    'userId',
    'value',
    'createdAt',
    'updatedAt'
  ]
};

module.exports = router => {
  const addCounterSchema = Joi.object().keys({
    targetId: Joi.string().required(),
    targetType: Joi.number().valid(...Object.values(counterEnum.targetType)).required(),
    counterField: Joi.string().required(),
    userId: Joi.string().required(),
    value: Joi.number().min(1).max(5)
  });

  router.put('/counter/create', async ctx => {
    const data = Joi.attempt(ctx.request.body, addCounterSchema);

    const res = await counterModel.upsert(data);

    ctx.body = !!res;
  });

  const getCounterByTargetIdSchema = Joi.object().keys({
    targetId: Joi.string().required()
  });

  router.get('/counter/target/:targetId', async ctx => {
    const { targetId } = Joi.attempt({ targetId: ctx.params.targetId }, getCounterByTargetIdSchema);

    const res = await counterModel.getCounterByTarget({ targetId }, properties.counter);

    ctx.body = res;
  });

  const getCounterByIdSchema = Joi.object().keys({
    id: Joi.string().required()
  });

  router.get('/counter/id/:id', async ctx => {
    const { id } = Joi.attempt({ id: ctx.params.id }, getCounterByIdSchema);

    const res = await counterModel.getCounterById(id, properties.counter);

    ctx.body = res;
  });
};
