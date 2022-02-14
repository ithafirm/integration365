require('isomorphic-fetch');
require('dotenv').config();
const { Client } = require('@microsoft/microsoft-graph-client');
const {
  TokenCredentialAuthenticationProvider,
} = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { ClientSecretCredential } = require('@azure/identity');
const certHelper = require('./helpers/certHelper');
const fs = require('fs');

const scopes = ['https://graph.microsoft.com/.default'];

exports.subscribe = async () => {
  const { AZURE_APP_ID_TENANT, AZURE_APP_ID, AZURE_APP_SECRET } = process.env;

  const credential = new ClientSecretCredential(
    AZURE_APP_ID_TENANT,
    AZURE_APP_ID,
    AZURE_APP_SECRET,
  );

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes,
  });

  const client = Client.initWithMiddleware({
    debugLogging: true,
    authProvider,
  });

  const notificationHost = process.env.PROXY_NGROK || 'localhost';
  const subscriptions = await client.api('/subscriptions?model=B').get();

  //  если нет действующих подписок на события, то создаётся новая
  if (subscriptions.value.length === 0) {
    subscriptions.value[0] = await client.api('/subscriptions?model=B').create({
      changeType: 'created',
      notificationUrl: `${notificationHost}/listen`,
      resource: '/teams/getAllMessages',
      clientState: process.env.SUBSCRIPTION_CLIENT_STATE,
      includeResourceData: true,
      // To get resource data, we must provide a public key that
      // Microsoft Graph will use to encrypt their key
      // See https://docs.microsoft.com/graph/webhooks-with-resource-data#creating-a-subscription
      encryptionCertificate: certHelper.getSerializedCertificate(
        process.env.CERTIFICATE_PATH,
      ),
      encryptionCertificateId: process.env.CERTIFICATE_ID,
      expirationDateTime: new Date(Date.now() + 3600000).toISOString(),
    });
  } else {
    //  вычисляется через сколько заканчивается существующая
    //  подписка и обновляет её по интервалу
    console.log(
      'Подписка кончится через',
      (+new Date(subscriptions.value[0].expirationDateTime) - Date.now()) /
        1000,
      'секунд(ы)',
    );
    setTimeout(() => {
      setInterval(async () => {
        const subscription = {
          expirationDateTime: new Date(Date.now() + 1000 * 60 * 60),
        };
        await client
          .api(`/subscriptions/${subscriptions.value[0].id}?model=B`)
          .update(subscription);
      }, 1000 * 60 * 60);
    }, +new Date(subscriptions.value[0].expirationDateTime) - Date.now());
  }
  return client;
};
