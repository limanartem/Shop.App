/**
 * Page object for the Orders page in the admin application
 */
import { $, $$, browser } from '@wdio/globals';
import BasePage from '../base.page';

/**
 * Page object for the Orders page in the admin application
 */
export class OrdersPage extends BasePage {
  /**
   * Constructor for the OrdersPage
   */
  constructor() {
    super('/orders');
  }

  /**
   * Get the orders grid
   */
  public get ordersGrid() {
    return $('[data-testid="orders-grid"], .MuiDataGrid-root');
  }

  /**
   * Get the orders title
   */
  public get title() {
    return $('[data-testid="orders-title"], h1');
  }

  /**
   * Get the search input field
   */
  public get searchInput() {
    return $('[data-testid="orders-search-input"], input[placeholder*="Search"]');
  }

  /**
   * Get the search button
   */
  public get searchButton() {
    return $('[data-testid="orders-search-button"], button[aria-label*="Search"]');
  }

  /**
   * Get the refresh button
   */
  public get refreshButton() {
    return $('[data-testid="orders-refresh-button"], button[aria-label*="Refresh"]');
  }

  /**
   * Get the filter button
   */
  public get filterButton() {
    return $('[data-testid="orders-filter-button"], button[aria-label*="Filter"]');
  }

  /**
   * Get the export button
   */
  public get exportButton() {
    return $('[data-testid="orders-export-button"], button[aria-label*="Export"]');
  }

  /**
   * Get the update order dialog
   */
  public get updateOrderDialog() {
    return $('[data-testid="update-order-dialog"], .MuiDialog-root');
  }

  /**
   * Get the order status select dropdown
   */
  public get orderStatusSelect() {
    return $('[data-testid="order-status-select"], select');
  }

  /**
   * Get the cancel status update button
   */
  public get cancelStatusUpdateButton() {
    return $('[data-testid="cancel-status-update-button"], button:contains("Cancel")');
  }

  /**
   * Get the confirm status update button
   */
  public get confirmStatusUpdateButton() {
    return $('[data-testid="confirm-status-update-button"], button:contains("Confirm")');
  }

  /**
   * Get the view order button for a specific order
   * @param orderId - The ID of the order
   */
  public getViewOrderButton(orderId: string) {
    return $(`[data-testid="view-order-${orderId}"], button[aria-label*="View"]`);
  }

  /**
   * Get the update order button for a specific order
   * @param orderId - The ID of the order
   */
  public getUpdateOrderButton(orderId: string) {
    return $(`[data-testid="update-order-${orderId}"], button:contains("Update Status")`);
  }

  /**
   * Get the status chip for a specific order
   * @param orderId - The ID of the order
   */
  public getOrderStatusChip(orderId: string) {
    return $(`[data-testid="order-status-${orderId}"], .MuiChip-root`);
  }

  /**
   * Get a status option from the dropdown
   * @param status - The status option to get
   */
  public getStatusOption(status: string) {
    return $(`[data-testid="status-option-${status}"], li[data-value="${status}"]`);
  }

  /**
   * Open the Orders page
   */
  public async open(): Promise<void> {
    await browser.url('http://localhost:3006/orders');
    await this.waitForPageToLoad();
  }

  /**
   * Wait for the page to load
   */
  public async waitForPageToLoad(): Promise<void> {
    await this.ordersGrid.waitForDisplayed({ timeout: 10000 });
  }

  /**
   * Search for orders
   * @param searchTerm - The search term to use
   */
  public async searchOrders(searchTerm: string): Promise<void> {
    await this.searchInput.setValue(searchTerm);
    await this.searchButton.click();
    await browser.pause(500); // Wait for search results
  }

  /**
   * Refresh the orders list
   */
  public async refreshOrders(): Promise<void> {
    await this.refreshButton.click();
    await browser.pause(500); // Wait for refresh
  }

  /**
   * Open the update status dialog for an order
   * @param orderId - The ID of the order to update
   */
  public async openUpdateStatusDialog(orderId: string): Promise<void> {
    await this.getUpdateOrderButton(orderId).click();
    await this.updateOrderDialog.waitForDisplayed({ timeout: 5000 });
  }

  /**
   * Update the status of an order
   * @param orderId - The ID of the order to update
   * @param newStatus - The new status to set
   */
  public async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    await this.openUpdateStatusDialog(orderId);
    await this.orderStatusSelect.click();
    await this.getStatusOption(newStatus).click();
    await this.confirmStatusUpdateButton.click();
    await this.updateOrderDialog.waitForDisplayed({ timeout: 5000, reverse: true });
  }

  /**
   * Cancel updating the status of an order
   * @param orderId - The ID of the order
   */
  public async cancelUpdateOrderStatus(orderId: string): Promise<void> {
    await this.openUpdateStatusDialog(orderId);
    await this.cancelStatusUpdateButton.click();
    await this.updateOrderDialog.waitForDisplayed({ timeout: 5000, reverse: true });
  }

  /**
   * Get the status of an order
   * @param orderId - The ID of the order
   * @returns The status text
   */
  public async getOrderStatus(orderId: string): Promise<string> {
    const statusElement = await this.getOrderStatusChip(orderId);
    return statusElement.getText();
  }
}
