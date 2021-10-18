const fs = require('fs');
const sendMessage = require('./sendMessage');

const api = require('./api');
// SEND A MESSAGE TO THE TEAMS
module.exports = async function sendToTeams(event, titleTask, user) {
  const { access_token, refresh_token } = JSON.parse(
    fs.readFileSync(`${__dirname.replace(/\\teams/, '')}\\access_token.json`, {
      encoding: 'utf-8',
    }),
  );
  try {
    const channels = await api.getListChannels(access_token);
    let chatOfTeams = channels.value.find((chat) => chat.displayName === titleTask);

    if (!chatOfTeams) {
      chatOfTeams = await api.createChannel(access_token, titleTask);
    }

    await sendMessage(event, access_token, chatOfTeams.id, user, titleTask);
  } catch (error) {
    console.error(error);
    if (error.message === 'InvalidAuthenticationToken') {
      const refresh = await api.refreshAuthCode(refresh_token);

      if (refresh.error) {
        throw new Error('error refresh token');
      }

      fs.writeFileSync(
        `${__dirname.replace(/\\teams/, '')}\\access_token.json`,
        JSON.stringify({
          access_token: refresh.access_token,
          refresh_token: refresh.refresh_token,
        }),
      );

      await sendToTeams(event, titleTask, user);
    }
  }
};
