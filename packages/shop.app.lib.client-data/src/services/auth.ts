import { User } from 'supertokens-web-js/types';

/**
 * Represents a client for the authentication service.
 */
export class AuthServiceClient {
  private authApiUrl: string;

  constructor(env: Record<string, string>) {
    const { REACT_APP_AUTH_API_URL = 'http://localhost:3003' } = env;
    this.authApiUrl = REACT_APP_AUTH_API_URL;
  }

  /**
   * Retrieves the user asynchronously.
   * @returns A Promise that resolves to the User object.
   * @throws An error if unable to get user details.
   */
  public async getUserAsync(): Promise<User> {
    console.log(`Fetching user from ${this.authApiUrl}`);

    const response = await fetch(`${this.authApiUrl}/user`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error({ status: response.status, statusText: response.statusText });
      throw new Error('Unable to get user details');
    }

    return await response.json();
  }
}
