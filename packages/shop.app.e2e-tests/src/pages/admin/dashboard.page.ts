import { $ } from '@wdio/globals';
import BasePage from '../base.page';

/**
 * Dashboard page object for admin application
 */
class DashboardPage extends BasePage {
  /**
   * Constructor for the DashboardPage
   */
  constructor() {
    super('/dashboard');
  }

  // Selectors
  /**
   * Welcome message element
   */
  get welcomeMessage() {
    return $('h4');
  }

  /**
   * Logout button
   */
  get logoutButton() {
    return $('button[aria-label="logout"]');
  }

  /**
   * Products navigation link
   */
  get productsLink() {
    return $('a[href*="/products"]');
  }

  /**
   * Orders navigation link
   */
  get ordersLink() {
    return $('a[href*="/orders"]');
  }

  /**
   * Performs logout action
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /**
   * Navigates to the products page
   */
  async navigateToProducts(): Promise<void> {
    await this.productsLink.click();
  }

  /**
   * Navigates to the orders page
   */
  async navigateToOrders(): Promise<void> {
    await this.ordersLink.click();
  }

  /**
   * Checks if user is logged in by verifying dashboard elements
   * @returns True if user is logged in, false otherwise
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.welcomeMessage.waitForDisplayed({ timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new DashboardPage();
