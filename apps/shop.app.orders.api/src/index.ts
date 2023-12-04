import { start } from './express/server';

const { WEB_SERVER_PORT } = process.env;

start().listen(WEB_SERVER_PORT, () => {
  console.log(`Server is running on port ${WEB_SERVER_PORT}`);
});
