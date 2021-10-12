require('isomorphic-fetch');
const { Client } = require('@microsoft/microsoft-graph-client');
const {
  TokenCredentialAuthenticationProvider,
} = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { ClientSecretCredential } = require('@azure/identity');

const createChannel = async (client) => {
  const options = {
    displayName: 'Architecture Discussion',
    description:
      'This channel is where we debate all future architecture plans',
    membershipType: 'standard',
  };

  return client
    .api(`/teams/${process.env.TEAMS_ID_GROUP}/channels`)
    .post(options);
};

const getListChannel = async (client) => {
  return client.api(`/teams/${process.env.TEAMS_ID_GROUP}/channels`).get();
};

// SEND A MESSAGE TO THE TEAMS
module.exports = (
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

  const listOfChannels = getListChannel(client);
};
