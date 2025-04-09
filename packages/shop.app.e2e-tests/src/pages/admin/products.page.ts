import { $, $$ } from '@wdio/globals';
import BasePage from '../base.page';
import { Product } from '../../types';

/**
 * Products page object for admin application
 */
class ProductsPage extends BasePage {
  /**
   * Constructor for the ProductsPage
   */
  constructor() {
    super('/products');
  }

  // Selectors
  /**
   * Add new product button
   */
  /**
   * Try multiple selectors for the add new button
   * This approach is more resilient to UI changes
   */
  async findAddNewButton(): Promise<WebdriverIO.Element | null> {
    const possibleSelectors = [
      'button[type="button"]',
      'button.MuiButton-contained',
      'button.MuiButton-root',
      'button.MuiButtonBase-root',
      'button:nth-of-type(1)',
      'a[href*="/products/new"]',
      'a[href*="/products/add"]',
      'a.MuiButton-root'
    ];
    
    for (const selector of possibleSelectors) {
      try {
        const element = await $(selector);
        const isExisting = await element.isExisting();
        if (isExisting) {
          return element;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    return null;
  }

  /**
   * DataGrid component containing product list
   */
  get dataGrid() {
    return $('.MuiDataGrid-root');
  }

  /**
   * All product rows in the data grid
   */
  get productRows() {
    return $$('tr, div[role="row"]');
  }

  /**
   * Product name input field in the form
   */
  get productNameInput() {
    return $('input[name="name"]');
  }

  /**
   * Product description input field in the form
   */
  get productDescriptionInput() {
    return $('textarea[name="description"]');
  }

  /**
   * Product price input field in the form
   */
  get productPriceInput() {
    return $('input[name="price"]');
  }

  /**
   * Product available checkbox in the form
   */
  get productAvailableCheckbox() {
    return $('input[name="available"]');
  }

  /**
   * Product category select in the form
   */
  get productCategorySelect() {
    return $('select[name="categoryId"]');
  }

  /**
   * Save button in the product form
   */
  get saveButton() {
    return $('button[type="submit"], button*=Save');
  }

  /**
   * Cancel button in the product form
   */
  get cancelButton() {
    return $('button[type="button"]:not([type="submit"]), button*=Cancel');
  }

  /**
   * Delete confirm button in the delete dialog
   */
  get deleteConfirmButton() {
    return $('button*=Delete, button*=Confirm, button.MuiButton-containedError');
  }

  /**
   * Snackbar notification element
   */
  get snackbar() {
    return $('.MuiSnackbar-root');
  }

  /**
   * Click the Add New Product button
   */
  async clickAddNewProduct(): Promise<void> {
    const button = await this.findAddNewButton();
    if (button) {
      await button.click();
    } else {
      // Try to navigate directly to the new product page
      await browser.url(`${this.path}/new`);
    }
  }

  /**
   * Find form input by various selectors
   * @param fieldType - Type of field to find
   * @returns The found element or null
   */
  async findFormField(fieldType: string): Promise<WebdriverIO.Element | null> {
    const selectors: Record<string, string[]> = {
      name: [
        'input[name="name"]',
        'input#name',
        'input[placeholder*="name"]',
        'input[type="text"]:nth-of-type(1)'
      ],
      description: [
        'textarea[name="description"]',
        'textarea#description',
        'textarea',
        'div[contenteditable="true"]'
      ],
      price: [
        'input[name="price"]',
        'input#price',
        'input[type="number"]',
        'input[placeholder*="price"]'
      ],
      available: [
        'input[name="available"]',
        'input#available',
        'input[type="checkbox"]',
        'input.MuiCheckbox-input'
      ],
      category: [
        'select[name="categoryId"]',
        'select#categoryId',
        'select',
        '.MuiSelect-select'
      ],
      save: [
        'button[type="submit"]',
        'button*=Save',
        'button.MuiButton-containedPrimary',
        'button:not([type="button"])'
      ],
      cancel: [
        'button*=Cancel',
        'button[type="button"]:not([type="submit"])',
        'button.MuiButton-outlined'
      ]
    };
    
    const fieldSelectors = selectors[fieldType] || [];
    
    for (const selector of fieldSelectors) {
      try {
        const element = await $(selector);
        const isExisting = await element.isExisting();
        if (isExisting) {
          return element;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    // If we couldn't find the field with specific selectors,
    // try a more generic approach based on labels
    try {
      // Find label that contains the field type text
      const labelElement = await $(`label*=${fieldType}`);
      if (await labelElement.isExisting()) {
        // Try to find the input associated with this label
        const labelId = await labelElement.getAttribute('for');
        if (labelId) {
          const inputElement = await $(`#${labelId}`);
          if (await inputElement.isExisting()) {
            return inputElement;
          }
        }
        // If no 'for' attribute, try finding the input as a sibling or child
        const parentElement = await labelElement.parentElement();
        const inputElement = await parentElement.$('input, textarea, select');
        if (await inputElement.isExisting()) {
          return inputElement;
        }
      }
    } catch (error) {
      // Ignore errors in the generic approach
    }
    
    return null;
  }

  /**
   * Fill out the product form
   * @param product - Product data
   */
  async fillProductForm(product: Product): Promise<void> {
    try {
      // Take a screenshot of the form before filling
      await browser.saveScreenshot('./screenshots/product-form-before.png');
      
      // Find and fill the name field
      const nameField = await this.findFormField('name');
      if (nameField) {
        await nameField.setValue(product.name);
      } else {
        console.log('Could not find name field');
      }
      
      // Find and fill the description field
      const descriptionField = await this.findFormField('description');
      if (descriptionField) {
        await descriptionField.setValue(product.description);
      } else {
        console.log('Could not find description field');
      }
      
      // Find and fill the price field
      const priceField = await this.findFormField('price');
      if (priceField) {
        await priceField.setValue(product.price.toString());
      } else {
        console.log('Could not find price field');
      }
      
      // Handle checkbox for available status
      const availableField = await this.findFormField('available');
      if (availableField) {
        const isChecked = await availableField.isSelected();
        if (isChecked !== product.available) {
          await availableField.click();
        }
      } else {
        console.log('Could not find available checkbox');
      }
      
      // Select category if provided
      if (product.categoryId) {
        const categoryField = await this.findFormField('category');
        if (categoryField) {
          try {
            await categoryField.selectByAttribute('value', product.categoryId.toString());
          } catch (error) {
            console.log('Could not select category, may not be available');
            // Try clicking on the select to open dropdown
            await categoryField.click();
            // Try to find and click the option
            try {
              const option = await $(`option[value="${product.categoryId}"], li*=${product.categoryId}`);
              await option.click();
            } catch (error) {
              console.log('Could not select category option');
            }
          }
        } else {
          console.log('Could not find category select');
        }
      }
      
      // Take a screenshot of the form after filling
      await browser.saveScreenshot('./screenshots/product-form-after.png');
    } catch (error) {
      console.log('Error filling product form:', error);
      // Take a screenshot of the error state
      await browser.saveScreenshot('./screenshots/product-form-error.png');
    }
  }

  /**
   * Save the product form
   */
  async saveProduct(): Promise<void> {
    try {
      const saveButton = await this.findFormField('save');
      if (saveButton) {
        await saveButton.click();
      } else {
        console.log('Could not find save button, trying alternatives');
        // Try to find any primary button
        const primaryButton = await $('button.MuiButton-contained, button.primary, button[type="submit"]');
        if (await primaryButton.isExisting()) {
          await primaryButton.click();
        } else {
          // Try pressing Enter key as last resort
          await browser.keys(['Enter']);
        }
      }
    } catch (error) {
      console.log('Error saving product:', error);
      // Try pressing Enter key as last resort
      await browser.keys(['Enter']);
    }
  }

  /**
   * Get product by name
   * @param name - Product name
   * @returns Product row element or null if not found
   */
  async getProductByName(name: string): Promise<WebdriverIO.Element | null> {
    try {
      // Try different approaches to find products
      // First, try to find the data grid
      try {
        await this.dataGrid.waitForDisplayed({ timeout: 5000 });
      } catch (error) {
        // If data grid isn't found, look for any table or list element
        await $('table, ul, div[role="grid"]').waitForDisplayed({ timeout: 5000 });
      }
      
      // Get all product rows using multiple possible selectors
      const rows = await $$('tr, div[role="row"], li, div.MuiListItem-root');
      
      // Find the row with the matching product name
      for (const row of rows) {
        const text = await row.getText();
        if (text.includes(name)) {
          return row;
        }
      }
    } catch (error) {
      console.log('Error finding product by name:', error);
    }
    
    return null;
  }

  /**
   * Edit a product
   * @param name - Product name
   */
  async editProduct(name: string): Promise<void> {
    try {
      const productRow = await this.getProductByName(name);
      if (!productRow) {
        // If product not found, try navigating directly to edit page
        // This assumes a URL structure like /products/edit/[name]
        await browser.url(`${this.path}/edit/${encodeURIComponent(name)}`);
        return;
      }
      
      // Try multiple approaches to find the edit button
      try {
        // Try to find and click the edit button in the row
        const editButton = await productRow.$('button[aria-label="edit"], button:nth-child(1), a[href*="edit"], svg[data-testid="EditIcon"]');
        await editButton.click();
      } catch (error) {
        // If edit button not found, try clicking the row itself (might open details)
        await productRow.click();
      }
    } catch (error) {
      console.log('Error editing product:', error);
      // Try navigating directly to edit page as fallback
      await browser.url(`${this.path}/edit/${encodeURIComponent(name)}`);
    }
  }

  /**
   * Delete a product
   * @param name - Product name
   */
  async deleteProduct(name: string): Promise<void> {
    try {
      const productRow = await this.getProductByName(name);
      if (!productRow) {
        console.log(`Product with name "${name}" not found, skipping deletion`);
        return;
      }
      
      // Try multiple approaches to find the delete button
      try {
        // Find and click the delete button in the row
        const deleteButton = await productRow.$('button[aria-label="delete"], button:nth-child(2), svg[data-testid="DeleteIcon"]');
        await deleteButton.click();
        
        // Try to confirm deletion using multiple possible selectors
        try {
          const confirmButton = await $('button*=Delete, button*=Confirm, button.MuiButton-containedError, button[type="submit"]');
          await confirmButton.click();
        } catch (error) {
          console.log('Could not find confirm button, trying alternative approaches');
          // Try pressing Enter key as fallback
          await browser.keys(['Enter']);
        }
      } catch (error) {
        console.log('Error finding delete button:', error);
      }
    } catch (error) {
      console.log('Error deleting product:', error);
    }
  }

  /**
   * Gets the text of the snackbar message
   * @returns The text of the snackbar message
   */
  async getSnackbarMessage(): Promise<string> {
    await this.snackbar.waitForDisplayed({ timeout: 5000 });
    return this.snackbar.getText();
  }

  /**
   * Creates a new product with the given data
   * @param product - Product data to create
   */
  async createProduct(product: Product): Promise<void> {
    await this.clickAddNewProduct();
    await this.fillProductForm(product);
    await this.saveProduct();
  }
}

export default new ProductsPage();
