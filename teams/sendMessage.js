const fetch = require('node-fetch');

const createMessage = (event, user) => {
  const defaultAvatar = process.env.TEAMS_DEFAULT_AVATAR_BOT;
  let fullDownloadLink;
  if (event.event.content.url) {
    fullDownloadLink = `https://chat.itha.ru/_matrix/media/r0/download/`;
    fullDownloadLink += event.event.content.url.replace('mxc://', '');
  }

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
                url: user.avatarUrl || defaultAvatar,
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
                text: user.displayName,
                wrap: true,
              },
              {
                type: 'TextBlock',
                spacing: 'None',
                text: `Created ${event.getDate().toLocaleString()}`,
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
        text: event.event.content.body,
        wrap: true,
      },
      {
        type: 'Image',
        url: fullDownloadLink,
      },
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.2',
  };
};

const sendMessage = (event, access_token, channelOfTeams, user, file) => {
  const bearer = `Bearer ${access_token}`;
  const msgUrl = `/teams/${process.env.TEAMS_ID_GROUP}/channels/${channelOfTeams}/messages`;
  let body;

  if (file) {
    body = {
      body: {
        contentType: 'html',
        content: `Пользователь "<b>${user.displayName}</b>" отправил файл. <attachment id="153fa47d-18c9-4179-be08-9879815a9f90"></attachment>`,
      },
      attachments: [
        {
          id: '153fa47d-18c9-4179-be08-9879815a9f90',
          contentType: 'reference',
          contentUrl: file.webUrl,
          name: file.name,
        },
      ],
    };
  } else {
    body = {
      body: {
        contentType: 'html',
        content: "<attachment id='04b151bb-2f88-4f5b-9615-30b2a59d9adf'>",
      },
      attachments: [
        {
          id: '04b151bb-2f88-4f5b-9615-30b2a59d9adf',
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: JSON.stringify(createMessage(event, user, file)),
        },
      ],
    };
  }

  return fetch(`https://graph.microsoft.com/v1.0${msgUrl}`, {
    headers: { Authorization: bearer, 'Content-type': 'application/json' },
    body: JSON.stringify(body),
    method: 'POST',
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) throw new Error(json.error.code);
      return json;
    });
};

const openSession = async (access_token, fileName, FolderName) => {
  const bearer = `Bearer ${access_token}`;
  const msgUrl = `/me/drive/root:/${FolderName}/${fileName}:/createUploadSession`;
  const body = {
    item: { '@microsoft.graph.conflictBehavior': 'rename' },
    deferCommit: false,
  };

  return fetch(`https://graph.microsoft.com/v1.0${msgUrl}`, {
    headers: { Authorization: bearer, 'Content-type': 'application/json' },
    body: JSON.stringify(body),
    method: 'POST',
  }).then((res) => res.json());
};

const sendChunk = async (access_token, url, chunk, range) => {
  const bearer = `Bearer ${access_token}`;

  return fetch(url, {
    headers: {
      Authorization: bearer,
      'Content-Length': chunk.byteLength,
      'Content-Range': `bytes ${range}`,
    },
    method: 'PUT',
    body: chunk,
  }).then((res) => res.json());
};

const uploadLargeFile = async (
  access_token,
  FolderName,
  fileName,
  fileArray,
) => {
  let { uploadUrl } = await openSession(access_token, fileName, FolderName);

  let start = 0;
  let end = 4194304;
  let chunk = fileArray.slice(start, end);
  let fileDownload = true;
  while (fileDownload) {
    const response = await sendChunk(
      access_token,
      uploadUrl,
      chunk,
      `${start}-${end - 1}/${fileArray.byteLength}`,
    );

    if (response.name) return response;
    start = response.nextExpectedRanges[0].split('-')[0];
    end = response.nextExpectedRanges[0].split('-')[1];
    if (start === end) {
      end = +end + 1;
    }
    chunk = fileArray.slice(start, end);
  }
};

const uploadLittleFile = async (access_token, FolderName, fileName, file) => {
  const bearer = `Bearer ${access_token}`;
  const msgUrl = `/me/drive/root:/${FolderName}/${fileName}:/content`;

  return fetch(`https://graph.microsoft.com/v1.0${msgUrl}`, {
    headers: { Authorization: bearer },
    body: file,
    method: 'put',
  }).then((res) => res.json());
};

module.exports = async (
  event,
  access_token,
  channelOfTeams,
  user,
  FolderName,
) => {
  const { msgtype } = event.event.content;
  if (msgtype === 'm.text' || msgtype === 'm.image') {
    return sendMessage(event, access_token, channelOfTeams, user);
  }

  let url = `${process.env.MATRIX_LINK_ADRESS}/_matrix/media/r0/download`;
  url += event.event.content.url.replace('mxc:/', '');
  const file = await fetch(url).then((res) => res.buffer());

  const fileName = event.event.content.body.replace(
    /(.+)(\..+)/,
    `$1-${+new Date()}$2`,
  );

  let uploadFile;
  if (file.byteLength < 4194304) {
    uploadFile = await uploadLittleFile(
      access_token,
      FolderName,
      fileName,
      file,
    );
  } else {
    uploadFile = await uploadLargeFile(
      access_token,
      FolderName,
      fileName,
      file,
    );
  }
  return sendMessage(event, access_token, channelOfTeams, user, uploadFile);
};
