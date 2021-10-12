const path = require('path');
const {
  ConnectorClient,
  MicrosoftAppCredentials,
} = require('botframework-connector');
var AdaptiveCards = require('adaptivecards');

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const serviceUrl = 'https://smba.trafficmanager.net/emea/';

const card = [
  {
    contentType: 'application/vnd.microsoft.card.adaptive',
    content: {
      type: 'AdaptiveCard',
      body: [
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              items: [
                {
                  type: 'Image',
                  style: 'Person',
                  url: 'https://pbs.twimg.com/profile_images/3647943215/d7f12830b3c17a5a9e4afcc370e3a37e_400x400.jpeg',
                  size: 'Small',
                },
              ],
              width: 'auto',
            },
            {
              type: 'Column',
              items: [
                {
                  type: 'TextBlock',
                  weight: 'Bolder',
                  text: '${creator.name}',
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  spacing: 'None',
                  text: 'Created {{DATE(${createdUtc},SHORT)}}',
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
          text: 'Now that we have defined the main rules and features of the format, we need to produce a schema and publish it to GitHub. The schema will be the starting point of our reference documentation.',
          wrap: true,
        },
      ],
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.3',
    },
  },
];

async function sendToChannel() {
  MicrosoftAppCredentials.trustServiceUrl(serviceUrl);

  const credentials = new MicrosoftAppCredentials(
    process.env.AZURE_APP_ID,
    process.env.AZURE_APP_SECRET,
  );
  const client = new ConnectorClient(credentials, { baseUri: serviceUrl });

  const conversationResponse = await client.conversations.createConversation({
    bot: {
      id: process.env.AZURE_APP_ID,
      name: process.env.TEAMS_BOT_NAME,
    },
    isGroup: true,
    conversationType: 'channel',
    channelData: {
      channel: { id: '19:test@thread.tacv2' },
    },
    activity: { type: 'message', attachments: card },
  });
  console.log();
}

sendToChannel();
