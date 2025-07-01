/**
 * Simple authentication module for demo purposes
 */
const AuthService = (() => {
    // In a real application, this would be handled securely on a server
    const DEMO_USERS = {
        'demo': {
            password: 'password123',
            id: '1234567890',
            displayName: 'Demo User'
        }
    };

    let currentUser = null;

    /**
     * Simulates a login request
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<Object>} User object if successful
     */
    const login = (username, password) => {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                const user = DEMO_USERS[username];
                
                if (user && user.password === password) {
                    // Clone the user object without the password
                    const authenticatedUser = {
                        username,
                        id: user.id,
                        displayName: user.displayName
                    };
                    
                    currentUser = authenticatedUser;
                    resolve(authenticatedUser);
                } else {
                    reject(new Error('Invalid username or password'));
                }
            }, 500);
        });
    };

    /**
     * Logs out the current user
     */
    const logout = () => {
        currentUser = null;
    };

    /**
     * Gets the current authenticated user
     * @returns {Object|null} Current user or null if not authenticated
     */
    const getCurrentUser = () => {
        return currentUser;
    };

    /**
     * Checks if a user is authenticated
     * @returns {boolean}
     */
    const isAuthenticated = () => {
        return currentUser !== null;
    };

    return {
        login,
        logout,
        getCurrentUser,
        isAuthenticated
    };
})();
