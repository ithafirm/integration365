const restify = require('restify');
const botbuilder = require('botbuilder');
const messageController = require('./messageControllers');
// Create bot adapter, which defines how the bot sends and receives messages.
const adapter = new botbuilder.BotFrameworkAdapter({
  appId: process.env.AZURE_APP_ID,
  appPassword: process.env.AZURE_APP_SECRET,
});

// Create HTTP server.
let server = restify.createServer();
server.listen(3978, function () {
  console.log(`\n${server.name} listening to ${server.url}`);
  console.log(
    `\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`,
  );
});

// Listen for incoming requests at /api/messages.
server.post('/api/messages', (req, res) => {
  adapter.sendActivities();
  // Use the adapter to process the incoming web request into a TurnContext object.
  adapter.processActivity(req, res, async (ctx) => {
    // Do something with this incoming activity!
    if (ctx.activity.type === 'message') {
      await messageController.conversationBot(ctx);
    }
  });
});
