import { start } from './express/server';
import { startWsServer } from './express/graphql-ws-server';

const { WEB_SERVER_PORT } = process.env;

const server = start().listen(WEB_SERVER_PORT, () => {
  console.log(`Server is running on port ${WEB_SERVER_PORT}`);
  startWsServer(server);
});
