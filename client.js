require('dotenv').config();
const sdk = require('matrix-js-sdk');
const express = require('express');
const morgan = require('morgan');

const listenRouter = require('./routes/listen');
const teams = require('./teams');
const app = express();

const client = sdk.createClient({
  baseUrl: process.env.MATRIX_LINK_ADRESS,
  accessToken: process.env.MATRIX_USER_TOKEN,
  userId: process.env.MATRIX_USER_ID,
});

client.startClient();
//  получение состояния о чатах
client.once('sync', async function (state) {
  if (state === 'PREPARED') teams(client);
  else process.exit(1);
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//  work checkß
app.get('/', (req, res) => {
  res.send('<h1>It's work'</h1>').status(200);
});

app.use('/listen', (req, res) => {
  res.locals.client = client;
  listenRouter(req, res);
});

module.exports = app;
