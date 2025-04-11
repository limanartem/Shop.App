/**
 * Authentication utilities for the admin application
 */

/**
 * Gets the current access token from the session storage or local storage
 * @returns Promise resolving to the access token
 */
export const getAccessToken = async (): Promise<string> => {
  // Try to get the token from session storage first
  let token = sessionStorage.getItem('accessToken');
  
  // If not found in session storage, try local storage
  if (!token) {
    token = localStorage.getItem('accessToken');
  }
  
  // If still not found, check if we're in development mode and return a default token
  if (!token && process.env.NODE_ENV === 'development') {
    // For development purposes only - in production, this would redirect to login
    console.warn('No access token found, using development token');
    return 'dev-token';
  }
  
  if (!token) {
    // In a real application, this would redirect to the login page
    throw new Error('No access token found');
  }
  
  return token;
};

/**
 * Saves the access token to session storage and optionally to local storage for "remember me"
 * @param token The access token to save
 * @param rememberMe Whether to save the token to local storage for persistence
 */
export const saveAccessToken = (token: string, rememberMe = false): void => {
  // Always save to session storage
  sessionStorage.setItem('accessToken', token);
  
  // If remember me is enabled, also save to local storage
  if (rememberMe) {
    localStorage.setItem('accessToken', token);
  }
};

/**
 * Clears the access token from both session storage and local storage
 */
export const clearAccessToken = (): void => {
  sessionStorage.removeItem('accessToken');
  localStorage.removeItem('accessToken');
};
