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
  
  /**
   * Opens the products page directly
   */
  async open(): Promise<void> {
    // Navigate directly to the products page with the full URL
    await browser.url('http://localhost:3006/products');
    console.log('Navigated to products page, current URL:', await browser.getUrl());
  }

  // Selectors
  /**
   * Add new product button
   */
  /**
   * Get the add new product button using data-testid
   */
  get addNewButton() {
    return $('[data-testid="add-product-button"]');
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
    // Wait for the button to be visible before clicking
    await this.addNewButton.waitForDisplayed({ timeout: 10000 });
    await this.addNewButton.click();
  }

  /**
   * Get form field by type using data-testid
   * @param fieldType - Type of field to get
   * @returns The form field element
   */
  getFormField(fieldType: string) {
    const testIdMap: Record<string, string> = {
      name: 'product-name-input',
      description: 'product-description-input',
      price: 'product-price-input',
      available: 'product-available-checkbox',
      category: 'product-category-select',
      save: 'product-form-save-button',
      cancel: 'product-form-cancel-button'
    };
    
    const testId = testIdMap[fieldType];
    if (!testId) {
      throw new Error(`Unknown form field type: ${fieldType}`);
    }
    
    return $(`[data-testid="${testId}"]`);
  }

  /**
   * Fill out the product form
   * @param product - Product data
   */
  async fillProductForm(product: Product): Promise<void> {
    console.log('Filling product form with data:', JSON.stringify(product));
    
    // Wait for the form dialog to be visible
    const formDialog = await $('[data-testid="product-form-dialog"]');
    await formDialog.waitForDisplayed({ timeout: 10000 });
    
    // Fill in the name field
    const nameField = await $('[data-testid="product-name-input"]');
    await nameField.waitForDisplayed({ timeout: 5000 });
    await nameField.setValue(product.name);
    
    // Fill in the description field
    const descField = await $('[data-testid="product-description-input"]');
    await descField.waitForDisplayed({ timeout: 5000 });
    await descField.setValue(product.description);
    
    // Fill in the price field
    const priceField = await $('[data-testid="product-price-input"]');
    await priceField.waitForDisplayed({ timeout: 5000 });
    await priceField.setValue(product.price.toString());
    
    // Handle checkbox for available status
    const availableLabel = await $('[data-testid="product-available-label"]');
    await availableLabel.waitForDisplayed({ timeout: 5000 });
    
    // Click the label to toggle the checkbox
    if (product.available !== undefined) {
      const checkbox = await availableLabel.$('input');
      const isChecked = await checkbox.isSelected();
      if (isChecked !== product.available) {
        await availableLabel.click();
      }
    }
    
    // Select category if provided
    if (product.categoryId) {
      const categoryField = await $('[data-testid="product-category-select"]');
      await categoryField.waitForDisplayed({ timeout: 5000 });
      await categoryField.selectByAttribute('value', product.categoryId.toString());
    }
  }

  /**
   * Save the product form
   */
  async saveProduct(): Promise<void> {
    console.log('Saving product form');
    
    // Find and click the save button using data-testid
    const saveButton = await $('[data-testid="product-form-save-button"]');
    await saveButton.waitForClickable({ timeout: 5000 });
    await saveButton.click();
  }

  /**
   * Cancel the product form
   */
  async cancelProduct(): Promise<void> {
    await this.getFormField('cancel').click();
  }

  /**
   * Get product by name
   * @param name - Product name
   * @returns Product row element or null if not found
   */
  async getProductByName(name: string): Promise<WebdriverIO.Element | null> {
    try {
      // Try different approaches to find products
      // First, try to find the data grid using data-testid
      try {
        await $('[data-testid="products-grid"]').waitForDisplayed({ timeout: 5000 });
      } catch (error) {
        // If data grid with testid isn't found, try the old selector
        try {
          await this.dataGrid.waitForDisplayed({ timeout: 5000 });
        } catch (error) {
          // If data grid isn't found, look for any table or list element
          await $('table, ul, div[role="grid"]').waitForDisplayed({ timeout: 5000 });
        }
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
    console.log(`Finding and editing product: ${name}`);
    
    // Find the product row
    const productRow = await this.getProductByName(name);
    if (!productRow) {
      throw new Error(`Product with name "${name}" not found`);
    }
    
    // Get the product ID from the row
    const rowText = await productRow.getText();
    const idMatch = rowText.match(/^([a-zA-Z0-9-]+)\s/);
    if (!idMatch || !idMatch[1]) {
      throw new Error(`Could not extract product ID from row text: ${rowText}`);
    }
    
    const productId = idMatch[1];
    console.log(`Product ID: ${productId}`);
    
    // Click the edit button using data-testid
    const editButton = await $(`[data-testid="edit-product-${productId}"]`);
    await editButton.waitForClickable({ timeout: 5000 });
    await editButton.click();
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
      
      // Get the product ID from the row if possible
      let productId = '';
      try {
        // Try to extract ID from the row
        const rowText = await productRow.getText();
        const idMatch = rowText.match(/^([a-zA-Z0-9-]+)\s/);
        if (idMatch && idMatch[1]) {
          productId = idMatch[1];
        }
      } catch (error) {
        // Ignore errors in ID extraction
      }
      
      // Try multiple approaches to find the delete button
      try {
        // First try using data-testid if we have the product ID
        if (productId) {
          try {
            const deleteButton = await $(`[data-testid="delete-product-${productId}"]`);
            if (await deleteButton.isExisting()) {
              await deleteButton.click();
              
              // Try to confirm deletion using data-testid
              try {
                const confirmButton = await $('[data-testid="delete-confirm-button"]');
                await confirmButton.click();
                return;
              } catch (error) {
                // Continue with other approaches
              }
            }
          } catch (error) {
            // Continue with other approaches
          }
        }
        
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
