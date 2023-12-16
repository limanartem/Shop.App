import { User } from 'supertokens-web-js/types';
import env from '../config/environment';

const { REACT_APP_AUTH_API_URL = 'http://localhost:3003' } = env;

export const getUserAsync = async (): Promise<User> => {
  console.log(`Fetching user from ${REACT_APP_AUTH_API_URL}`);
  
  const response = await fetch(`${REACT_APP_AUTH_API_URL}/user`, {
    method: 'GET',
  });

  if (!response.ok) {
    console.error({ status: response.status, statusText: response.statusText });
    throw new Error('Unable to get user details');
  }

  return await response.json();
};
