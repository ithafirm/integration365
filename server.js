require('dotenv').config();

const graphAppClient = require('./graphClientApp');
const app = require('./client');

const port = process.env.PORT;
const host = 'localhost';

app.listen(port, host, () => {
  console.log(`App running on port ${port}...`);
  graphAppClient.subscribe();
});
