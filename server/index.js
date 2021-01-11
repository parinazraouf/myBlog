const Koa = require('koa');
const koaBody = require('koa-body');
const routers = require('./routes');

const app = new Koa();
app.use(koaBody());

app
  .use(routers.middleware());

exports.app = app;
