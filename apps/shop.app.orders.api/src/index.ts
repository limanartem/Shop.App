import { start } from './express/express-server';
import { startWsServer } from './express/graphql-ws-server';
import { userInfo } from 'os';

const { WEB_SERVER_PORT } = process.env;

const server = start().listen(WEB_SERVER_PORT, () => {
  console.log(
    `🚀  Server is running on port ${WEB_SERVER_PORT} under "${userInfo().username}" user context`,
  );
  startWsServer(server);
});

const closeGracefully = async (signal: string) => {
  console.log(`🚪 Received signal to terminate: ${signal}.`);
  console.log('Closing server...');

  server.close();
  process.exit();
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);
