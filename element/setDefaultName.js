// TODO Change url from settings
const fetch = require('node-fetch');

module.exports = () => {
  return fetch(
    `https://chat.itha.ru/_matrix/client/r0/profile/${process.env.MATRIX_USER_ID}/displayname?access_token=${process.env.MATRIX_USER_TOKEN}`,
    {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayname: 'manager' }),
      method: 'PUT',
    },
  );
};
