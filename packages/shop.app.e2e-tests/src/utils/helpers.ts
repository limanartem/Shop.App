import { $, browser } from '@wdio/globals';

/**
 * Helper functions for e2e tests
 */

/**
 * Waits for an element to be displayed and clickable
 * @param selector - Element selector
 * @param timeout - Timeout in milliseconds
 * @returns The WebdriverIO element
 */
export const waitForClickable = async (selector: string, timeout = 10000): Promise<WebdriverIO.Element> => {
  const element = await $(selector);
  await element.waitForDisplayed({ timeout });
  await element.waitForClickable({ timeout });
  return element;
};

/**
 * Gets environment variable with fallback
 * @param name - Environment variable name
 * @param fallback - Fallback value if not found
 * @returns The environment variable value or fallback
 */
export const getEnv = (name: string, fallback = ''): string => {
  return process.env[name] || fallback;
};

/**
 * Pauses execution for the specified time
 * @param ms - Time in milliseconds
 * @returns Promise that resolves after the specified time
 */
export const pause = async (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Takes a screenshot and saves it with a timestamp
 * @param name - Base name for the screenshot
 * @returns The path to the saved screenshot
 */
export const takeScreenshot = async (name: string): Promise<string> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  await browser.saveScreenshot(`./screenshots/${filename}`);
  return filename;
};
