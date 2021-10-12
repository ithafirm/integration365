const fetch = require('node-fetch');

exports.getMarker = (client_id, code, client_secret, scope) => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
  return fetch(url, {
    headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id,
      grant_type: 'authorization_code',
      client_secret,
      scope,
    }),
    method: 'POST',
  }).then((res) => res.json());
};

exports.refreshAuthCode = async (client_id, code, client_secret, scope) => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
  return fetch(url, {
    headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id,
      grant_type: 'authorization_code',
      client_secret,
      scope,
    }),
    method: 'POST',
  }).then((res) => res.json());
};

exports.post = (access_token, link) => {
  const auth = `Bearer ${access_token}`;
  return fetch(`https://graph.microsoft.com/v1.0${link}`, {
    headers: {
      Authorization: auth,
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      body: {
        content: 'Hello World',
      },
    }),
    method: 'POST',
  }).then((res) => res.json());
};

exports.get = (access_token, link) => {
  const auth = `Bearer ${access_token}`;
  return fetch(`https://graph.microsoft.com/v1.0${link}`, {
    headers: {
      Authorization: auth,
    },
  }).then((res) => res.json());
};

exports.createChannel = async (client) => {
  const options = {
    displayName: 'Architecture Discussion',
    description:
      'This channel is where we debate all future architecture plans',
    membershipType: 'private',
  };

  return client
    .api(`/teams/${process.env.TEAMS_ID_GROUP}/channels`)
    .post(options);
};

exports.getListChannel = async (client) => {
  return client.api(`/teams/${process.env.TEAMS_ID_GROUP}/channels`).get();
};
