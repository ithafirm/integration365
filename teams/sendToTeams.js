require('isomorphic-fetch');
const fs = require('fs');
const { Client } = require('@microsoft/microsoft-graph-client');
const {
  TokenCredentialAuthenticationProvider,
} = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { ClientSecretCredential } = require('@azure/identity');
const api = require('./api');

// SEND A MESSAGE TO THE TEAMS
module.exports = async (
  timeMessage,
  message,
  title,
  avatarUrl,
  displayName,
  chatId,
  urlAttachments,
) => {
  const credential = new ClientSecretCredential(
    process.env.AZURE_APP_ID_TENANT,
    process.env.AZURE_APP_ID,
    process.env.AZURE_APP_SECRET,
  );

  const scopes = ['https://graph.microsoft.com/.default'];
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes,
  });

  const client = Client.initWithMiddleware({
    debugLogging: true,
    authProvider,
  });

  const { value } = await api.getListChannels(client);
  let channelOfTeams = value.find((e) => e.displayName === title);

  if (!channelOfTeams) {
    channelOfTeams = await api.createChannel(client, title);
  }

  const { access_token, refresh_token } = JSON.parse(
    fs.readFileSync(`${__dirname.replace(/\\teams/, '')}\\access_token.json`, {
      encoding: 'utf-8',
    }),
  );

  const resultSendMessage = await api.sendMessage(
    timeMessage,
    access_token,
    channelOfTeams.id,
    displayName,
    message,
    avatarUrl,
    urlAttachments
  );

  if (resultSendMessage.error?.code === 'InvalidAuthenticationToken') {
    const refresh = await api.refreshAuthCode(
      process.env.AZURE_APP_ID,
      refresh_token,
      process.env.AZURE_APP_SECRET,
      process.env.TEAMS_SCOPE_USER,
    );

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
    await api.sendMessage(
      timeMessage,
      refresh.access_token,
      channelOfTeams.id,
      displayName,
      message,
      avatarUrl,
      urlAttachments
    );
  }
};
