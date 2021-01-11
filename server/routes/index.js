const Router = require('koa-router');
const compose = require('koa-compose');

const apiRouter = new Router({
  prefix: '/api'
});

const userApi = require('~/server/routes/api/user');
const postApi = require('~/server/routes/api/post');
const commentApi = require('~/server/routes/api/comment');
const counterApi = require('~/server/routes/api/counter');

userApi(apiRouter);
postApi(apiRouter);
commentApi(apiRouter);
counterApi(apiRouter);

// export route middleware
exports.middleware = () => compose([
  apiRouter.routes(),
  apiRouter.allowedMethods()
]);
