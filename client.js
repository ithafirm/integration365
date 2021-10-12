const sdk = require('matrix-js-sdk');

require('dotenv').config();

const teams = require('./teams');

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

module.exports = client;
