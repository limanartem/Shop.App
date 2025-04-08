const API_URL = process.env.REACT_APP_AUTH_API_URL;

export const authService = {
  async login(email: string, password: string) {
    // Using the correct SuperTokens.io endpoint for signin
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        formFields: [
          { id: 'email', value: email },
          { id: 'password', value: password },
        ]
      }),
    });

    const data = await response.json();
    
    // Handle different response statuses from SuperTokens
    if (data.status === 'WRONG_CREDENTIALS_ERROR') {
      throw new Error('Invalid email or password');
    } else if (data.status !== 'OK') {
      throw new Error(data.status || 'Login failed');
    }
    
    // For the admin app, check if the authenticated user is the admin user we defined
    // This is a simplified approach for the prototype
    try {
      // Check if the user email matches the admin email from environment
      // Since we're working with a prototype, we can use this as a simplified admin check
      const isAdmin = data.user.emails && 
                     data.user.emails.length > 0 && 
                     data.user.emails[0].toLowerCase() === 'admin@shop.app';
      
      if (!isAdmin) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Add admin flag to response
      return {
        ...data,
        isAdmin: true
      };
    } catch (error: any) {
      // If there was an error checking admin status
      if (error.message === 'Access denied. Admin privileges required.') {
        throw error;
      }
      
      console.error('Error checking admin status:', error);
      throw new Error('Failed to verify admin privileges');
    }
  },

  async logout() {
    // Using the correct SuperTokens.io endpoint for signout
    const response = await fetch(`${API_URL}/auth/signout`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },
};
