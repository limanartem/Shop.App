import { start } from './express/server';

start().listen(3001, () => {
  console.log('Server is running on port 3001');
});
