import { User } from 'supertokens-web-js/types';

type FormField = {
  id: 'email' | 'password' | 'name';
  value: string;
};

type SignInPayload = {
  formFields: FormField[];
};

type SignUpPayload = SignInPayload;

type SignInResponse = {
  status:
    | 'OK'
    | 'WRONG_CREDENTIALS_ERROR'
    | 'FIELD_ERROR'
    | 'GENERAL_ERROR'
    | 'SIGN_IN_NOT_ALLOWED';
  user?: User;
};

type SignUpResponse = {
  status: 'OK' | 'FIELD_ERROR' | 'GENERAL_ERROR' | 'SIGN_UP_NOT_ALLOWED';
  user?: User;
};

type EmailExistsResponse = {
  status: 'OK' | 'GENERAL_ERROR';
  exists: boolean;
};

const buildSignInPayload = (email: string, password: string): SignInPayload => ({
  formFields: [
    {
      id: 'email',
      value: email,
    },
    {
      id: 'password',
      value: password,
    },
  ],
});

const buildSignUpPayload = (email: string, password: string, name?: string): SignUpPayload => {
  const signInPayload = buildSignInPayload(email, password);
  // TODO: Uncomment this when the API supports it.
  /* if (name) {
    signInPayload.formFields.push({
      id: 'name',
      value: name,
    });
  } */
  return signInPayload;
};

/**
 * Represents a client for the authentication service.
 */
export class AuthServiceClient {
  private authApiUrl: string;

  constructor(env: Record<string, string>) {
    const { REACT_APP_AUTH_API_URL = 'http://localhost:3003' } = env;
    console.log(`AuthServiceClient: ${REACT_APP_AUTH_API_URL}`);
    this.authApiUrl = REACT_APP_AUTH_API_URL;
  }

  /**
   * Retrieves the user asynchronously.
   * @returns A Promise that resolves to the User object.
   * @throws An error if unable to get user details.
   */
  public async getUserAsync(): Promise<User> {
    console.log(`Fetching user from ${this.authApiUrl}/user`);

    const response = await fetch(`${this.authApiUrl}/user`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error({ status: response.status, statusText: response.statusText });
      throw new Error('Unable to get user details');
    }

    return await response.json();
  }

  /**
   * Signs in a user with the specified email and password.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves to a SignInResponse object.
   * @throws An error if unable to sign in.
   */
  public async signInAsync(email: string, password: string): Promise<SignInResponse> {
    console.log(`Signing in user ${email} using "${this.authApiUrl}/auth/signin"`);

    const response = await fetch(`${this.authApiUrl}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildSignInPayload(email, password)),
    });

    if (!response.ok) {
      console.error({ status: response.status, statusText: response.statusText });
      throw new Error('Unable to sign in');
    }

    return await response.json();
  }

  /**
   * Signs up a user with the provided email, password, and optional name.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @param name - The optional name of the user.
   * @returns A promise that resolves to a SignUnResponse object.
   * @throws An error if unable to sign up.
   */
  public async signUpAsync(
    email: string,
    password: string,
    name?: string,
  ): Promise<SignUpResponse> {
    console.log(`Signing in user ${email} using "${this.authApiUrl}/auth/signup"`);

    const response = await fetch(`${this.authApiUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildSignUpPayload(email, password, name)),
    });

    if (!response.ok) {
      console.error({ status: response.status, statusText: response.statusText });
      throw new Error('Unable to sign up');
    }

    return await response.json();
  }

  /**
   * Checks if an email exists.
   * @param email - The email to check.
   * @returns A promise that resolves to an EmailExistsResponse object.
   * @throws An error if unable to check email exists.
   */
  public async emailExistsAsync(email: string): Promise<EmailExistsResponse> {
    console.log(`Signing in user ${email}`);

    const response = await fetch(`${this.authApiUrl}/auth/signup/email/exists?email=${email}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error({ status: response.status, statusText: response.statusText });
      throw new Error('Unable to check email exists');
    }

    return await response.json();
  }
}
