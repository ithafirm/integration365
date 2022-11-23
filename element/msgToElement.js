// TODO Задокументировать код
const fetch = require('node-fetch');
const fs = require('fs');

const changeName = require('./changeName');
const setDefaultName = require('./setDefaultName');

const text = async (chatId, message, userName, client) => {
  await changeName(`${userName}`);
  let text = `${message}\n\n${'-'.repeat(20)}`;
  text += `\nСообщение было отправлено из Planfix`;

  const content = { body: text, msgtype: 'm.text' };
  await client.sendMessage(chatId, content, '', (err) => {
    if (err) console.error(err);
  });
  await setDefaultName();
};

const getMatrixUri = async (url, client) => {
  const imageRes = await fetch(url);
  const buffer = await imageRes.buffer();
  const imageType = imageRes.headers.get('Content-Type');
  const uploadResponse = await client.uploadContent(buffer, {
    rawResponse: false,
    type: imageType,
  });
  return uploadResponse.content_uri;
};

const getMessageType = (url) => {
  let msgtype;
  switch (true) {
    case /jpeg|jpg|png/.test(url):
      msgtype = 'm.image';
      break;

    case /ogx/.test(url):
      msgtype = 'm.audio';
      break;

    default:
      msgtype = 'm.file';
      break;
  }
  return msgtype;
};

const attachmentsSend = async (
  chatId,
  message,
  userName,
  attachments,
  client,
) => {
  await changeName(`${userName}`);

  if (message) {
    const content = { body: message, msgtype: 'm.text' };
    await client.sendMessage(chatId, content, '', (err) => {
      if (err) console.error(err);
    });
  }

  if (Array.isArray(attachments.url)) {
    for (let i = 0; i < attachments.url.length; i++) {
      const url = attachments.url[i];
      const uri = await getMatrixUri(url, client);
      const msgtype = getMessageType(url);

      const content = {
        msgtype,
        body: 'Planfix file',
        filename: attachments.name[i],
        url: uri,
      };

      await client.sendEvent(chatId, 'm.room.message', content, '', (err) => {
        if (err) console.error(err);
      });
    }
    await setDefaultName();
    return;
  }

  const uri = await getMatrixUri(attachments.url, client);
  const msgtype = getMessageType(attachments.url);

  const content = {
    msgtype,
    body: 'Planfix file',
    filename: attachments.name,
    url: uri,
  };
  console.log(content);
  await client.sendEvent(chatId, 'm.room.message', content, '', (err) => {
    if (err) console.error(err);
  });
  await setDefaultName();
};

module.exports = async (eventTeams, client) => {
  const { body, from, channelIdentity, messageType } = eventTeams;
  //  если есть прикрепленный файлы, то вызывает функцию
  //  для отправки с аттачментом
  if (body.contentType === 'text') {
    return text(
      chatId,
      body.content,
      from.user.DisplayName,
      client,
    );
  }
  if (/img/.test(decryptedPayload.body.content)) {
    const { access_token, refresh_token } = JSON.parse(
      fs.readFileSync(
        `${__dirname.replace(/\\routes/, '')}\\access_token.json`,
        {
          encoding: 'utf-8',
        },
      ),
    );

    const auth = `Bearer ${access_token}`;
    const url = decryptedPayload.body.content.match(/src="(.+?)"/)[1];
    const img = await fetch(url, {
      headers: { Authorization: auth },
    }).then((res) => res.buffer());
    fs.writeFileSync('./test.jpg', img);
    console.log(decryptedPayload.body.content);
  }
  if (attachments?.url) {
    return attachmentsSend(
      chatId,
      message,
      userName,
      userLastName,
      attachments,
      client,
    );
  }
};
