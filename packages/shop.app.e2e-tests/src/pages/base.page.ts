import { browser } from '@wdio/globals';

/**
 * Base page object that all page objects inherit from
 */
export default class BasePage {
  /**
   * Constructor for the BasePage
   * @param path - The path to the page
   */
  constructor(public readonly path: string) {}

  /**
   * Opens the page
   * @returns Promise that resolves when the page is opened
   */
  async open(): Promise<void> {
    await browser.url(this.path);
  }

  /**
   * Waits for the page to be fully loaded
   * @returns Promise that resolves when the page is fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await browser.waitUntil(
      async () => await browser.execute(() => document.readyState === 'complete'),
      { 
        timeout: 10000, 
        timeoutMsg: 'Page did not load completely' 
      }
    );
  }
}
