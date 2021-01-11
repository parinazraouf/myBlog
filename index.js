require('module-alias/register');

const { app } = require('./server');

const PORT = 8080;
const HOST = '127.0.0.1';

app.listen(PORT);

console.log(`Running on http://${HOST}:${PORT}`);
