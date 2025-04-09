/**
 * Type declarations for WebdriverIO global variables
 */

declare namespace WebdriverIO {
  interface Element {
    waitForDisplayed(options?: { timeout?: number; reverse?: boolean; timeoutMsg?: string; interval?: number }): Promise<boolean>;
    waitForClickable(options?: { timeout?: number; reverse?: boolean; timeoutMsg?: string; interval?: number }): Promise<boolean>;
    isDisplayed(): Promise<boolean>;
    isClickable(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    click(): Promise<void>;
    setValue(value: string): Promise<void>;
    getText(): Promise<string>;
  }
}

/**
 * Global browser object from WebdriverIO
 */
declare namespace WebdriverIO {
  interface Browser {
    url(url: string): Promise<void>;
    waitUntil(
      condition: () => Promise<boolean>,
      options?: { timeout?: number; timeoutMsg?: string; interval?: number }
    ): Promise<boolean>;
    execute<T>(script: string | ((...args: any[]) => T), ...args: any[]): Promise<T>;
    getUrl(): Promise<string>;
    pause(ms: number): Promise<void>;
    saveScreenshot(filepath: string): Promise<void>;
    $: typeof $;
    $$: typeof $$;
  }
  
  interface Element {
    waitForDisplayed(options?: { timeout?: number; reverse?: boolean; timeoutMsg?: string; interval?: number }): Promise<boolean>;
    waitForClickable(options?: { timeout?: number; reverse?: boolean; timeoutMsg?: string; interval?: number }): Promise<boolean>;
    isDisplayed(): Promise<boolean>;
    isClickable(): Promise<boolean>;
    isSelected(): Promise<boolean>;
    click(): Promise<void>;
    setValue(value: string): Promise<void>;
    getText(): Promise<string>;
    getAttribute(name: string): Promise<string | null>;
    $: typeof $;
    $$: typeof $$;
    selectByAttribute(attribute: string, value: string): Promise<void>;
  }
}

declare const browser: WebdriverIO.Browser;

/**
 * Global selector function from WebdriverIO
 */
declare function $(selector: string): WebdriverIO.Element;

/**
 * Global multi-selector function from WebdriverIO
 */
declare function $$(selector: string): Promise<WebdriverIO.Element[]>;

/**
 * Global test hooks and functions from Mocha
 */
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => Promise<void>): void;
declare function before(fn: () => Promise<void>): void;
declare function beforeEach(fn: () => Promise<void>): void;
declare function after(fn: () => Promise<void>): void;
declare function afterEach(fn: () => Promise<void>): void;
