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

exports.refreshAuthCode = async (
  client_id,
  refresh_token,
  client_secret,
  scope,
) => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
  return fetch(url, {
    headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      scope,
      refresh_token,
      grant_type: 'refresh_token',
      client_secret,
    }),
    method: 'POST',
  }).then(async (res) => res.json());
};

const createMessage = (timestamp, autor, textMessage, urlAvatar, imageUrl) => {
  return {
    type: 'AdaptiveCard',
    body: [
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            width: 'auto',
            items: [
              {
                type: 'Image',
                style: 'Person',
                url: urlAvatar,
                size: 'Small',
              },
            ],
          },
          {
            type: 'Column',
            items: [
              {
                type: 'TextBlock',
                weight: 'Bolder',
                text: autor,
                wrap: true,
              },
              {
                type: 'TextBlock',
                spacing: 'None',
                text: `Created ${timestamp}`,
                isSubtle: true,
                wrap: true,
              },
            ],
            width: 'stretch',
          },
        ],
      },
      {
        type: 'TextBlock',
        text: textMessage,
        wrap: true,
      },
      {
        type: 'Image',
        url: imageUrl,
      },
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.2',
  };
};

const createMessageWithImage = (timestamp, autor, textMessage, urlAvatar) => {
  return {
    type: 'AdaptiveCard',
    body: [
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            width: 'auto',
            items: [
              {
                type: 'Image',
                style: 'Person',
                url: 'https://pbs.twimg.com/profile_images/3647943215/d7f12830b3c17a5a9e4afcc370e3a37e_400x400.jpeg',
                size: 'Small',
              },
            ],
          },
          {
            type: 'Column',
            items: [
              {
                type: 'TextBlock',
                weight: 'Bolder',
                text: 'Matt Hidinger',
                wrap: true,
              },
              {
                type: 'TextBlock',
                spacing: 'None',
                text: 'Created {{DATE(2017-02-14T06:08:39Z,SHORT)}}',
                isSubtle: true,
                wrap: true,
              },
            ],
            width: 'stretch',
          },
        ],
      },
      {
        type: 'Image',
        url: imageUrl,
      },
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.2',
  };
};

exports.sendMessage = (
  timestamp,
  access_token,
  channelOfTeams,
  displayName,
  message,
  avatarUrl,
  urlAttachments,
) => {
  const bearer = `Bearer ${access_token}`;
  const msgUrl = `/teams/${process.env.TEAMS_ID_GROUP}/channels/${channelOfTeams}/messages`;
  const defaultAvatar = process.env.TEAMS_DEFAULT_AVATAR_BOT;
  let fullDownloadLink;
  if (urlAttachments) {
    fullDownloadLink = `https://chat.itha.ru/_matrix/media/r0/download/`;
    fullDownloadLink += urlAttachments.replace('mxc://', '');
  }
  const attachment = createMessage(
    timestamp,
    displayName,
    message,
    avatarUrl || defaultAvatar,
    fullDownloadLink,
  );
  return fetch(`https://graph.microsoft.com/v1.0${msgUrl}`, {
    headers: { Authorization: bearer, 'Content-type': 'application/json' },
    body: JSON.stringify({
      body: {
        contentType: 'html',
        content: "<attachment id='04b151bb-2f88-4f5b-9615-30b2a59d9adf'>",
      },
      attachments: [
        {
          id: '04b151bb-2f88-4f5b-9615-30b2a59d9adf',
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: JSON.stringify(attachment),
        },
      ],
    }),
    method: 'POST',
  }).then((res) => res.json());
};

exports.get = (access_token, link) => {
  const auth = `Bearer ${access_token}`;
  return fetch(`https://graph.microsoft.com/v1.0${link}`, {
    headers: { Authorization: auth },
  }).then((res) => res.json());
};

exports.createChannel = async (client, nameOfChannel) => {
  const options = {
    displayName: nameOfChannel,
    membershipType: 'private',
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
  };

  return client
    .api(`/teams/${process.env.TEAMS_ID_GROUP}/channels`)
    .post(options);
};

exports.getListChannels = async (client) => {
  return client.api(`/teams/${process.env.TEAMS_ID_GROUP}/channels`).get();
};

exports.getListUsersTeam = async (client) => {
  return client.api(`/teams/${process.env.TEAMS_ID_GROUP}/members`).get();
};
