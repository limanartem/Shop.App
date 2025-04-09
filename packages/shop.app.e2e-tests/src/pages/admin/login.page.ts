import { $ } from '@wdio/globals';
import BasePage from '../base.page';

/**
 * Login page object for admin application
 */
class LoginPage extends BasePage {
  /**
   * Constructor for the LoginPage
   */
  constructor() {
    super('/login');
  }

  // Selectors
  /**
   * Email input field
   */
  get emailInput() {
    return $('[data-testid="login-email-input"]');
  }

  /**
   * Password input field
   */
  get passwordInput() {
    return $('[data-testid="login-password-input"]');
  }

  /**
   * Sign in button
   */
  get signInButton() {
    return $('[data-testid="login-submit-button"]');
  }

  /**
   * Error alert message
   */
  get errorAlert() {
    return $('[data-testid="login-error-alert"]');
  }

  /**
   * Performs login with the given credentials
   * @param email - Email address
   * @param password - Password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.setValue(email);
    await this.passwordInput.setValue(password);
    await this.signInButton.click();
  }

  /**
   * Gets the error message text
   * @returns The error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.errorAlert.waitForDisplayed({ timeout: 5000 });
    return this.errorAlert.getText();
  }
}

export default new LoginPage();
