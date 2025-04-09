import { expect } from 'chai';
import { browser } from '@wdio/globals';
import LoginPage from '../../../src/pages/admin/login.page';
import DashboardPage from '../../../src/pages/admin/dashboard.page';
import { testConfig } from '../../../src/utils/test-data';
import { takeScreenshot } from '../../../src/utils/helpers';

/**
 * Admin login test suite
 */
/**
 * Tests for successful login to the admin application
 */
describe('Admin Login', () => {
  /**
   * Before each test, open the login page
   */
  beforeEach(async () => {
    await LoginPage.open();
    await LoginPage.waitForPageLoad();
  });

  /**
   * Test successful login with valid credentials
   */
  it('should login with valid credentials', async () => {
    // Perform login with admin credentials from config
    await LoginPage.login(
      testConfig.adminCredentials.email, 
      testConfig.adminCredentials.password
    );
    
    // Wait for dashboard page to load
    await DashboardPage.waitForPageLoad();
    
    // Wait for login to complete (may need to adjust timeout)
    await browser.pause(1000);
    
    // Get current URL after login attempt
    const currentUrl = await browser.getUrl();
    
    // If login was successful, we should be redirected away from login page
    expect(currentUrl).to.not.include('/login');
  });
});
