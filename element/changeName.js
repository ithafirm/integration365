// TODO - нужно будет заменить url из настроек
const fetch = require('node-fetch');

module.exports = (displayname) => {
  return fetch(
    `https://chat.itha.ru/_matrix/client/r0/profile/${process.env.MATRIX_USER_ID}/displayname?access_token=${process.env.MATRIX_USER_TOKEN}`,
    {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayname }),
      method: 'PUT',
    },
  );
};
