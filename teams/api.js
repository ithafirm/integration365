const fetch = require('node-fetch');
const fs = require('fs');

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

exports.refreshAuthCode = async (refresh_token) => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
  return fetch(url, {
    headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token,
      client_id: process.env.AZURE_APP_ID,
      grant_type: 'refresh_token',
      client_secret: process.env.AZURE_APP_SECRET,
      scope: process.env.TEAMS_SCOPE_USER.replace(/,/g, ' '),
      redirect_uri: process.env.TEAMS_REDIRECT_URI,
    }),
    method: 'POST',
  }).then(async (res) => res.json());
};

exports.createChannel = (access_token, topic) => {
  const auth = `Bearer ${access_token}`;
  const url = `https://graph.microsoft.com/v1.0/chats`;
  return fetch(url, {
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      chatType: 'group',
      members: [
        {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          'user@odata.bind': `https://graph.microsoft.com/v1.0/users(\'${process.env.TEAMS_ID_USER_DELEGATE}\')`,
          roles: ['owner'],
        },
        {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          'user@odata.bind': `https://graph.microsoft.com/v1.0/users(\'${process.env.TEAMS_ID_USER_ADMIN}\')`,
          roles: ['owner'],
        },
      ],
    }),
    method: 'POST',
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) throw new Error(json.error.code);
      return json;
    });
};

exports.getListChannels = (access_token) => {
  const auth = `Bearer ${access_token}`;
  const url = `https://graph.microsoft.com/v1.0/users/${process.env.TEAMS_ID_USER_DELEGATE}/chats`;
  return fetch(url, {
    headers: { Authorization: auth },
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) throw new Error(json.error.code);
      return json;
    });
};

exports.getListUsersTeam = async (client) => {
  return client.api(`/teams/${process.env.TEAMS_ID_GROUP}/members`).get();
};
