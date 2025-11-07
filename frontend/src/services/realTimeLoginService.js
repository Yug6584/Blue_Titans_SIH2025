class RealTimeLoginService {
  constructor() {
    this.subscribers = new Set();
    this.isPolling = false;
    this.pollInterval = null;
    this.lastLoginId = null;
    this.pollFrequency = 3000; // 3 seconds for real-time feel
  }

  /**
   * Subscribe to real-time login updates
   * @param {Function} callback - Function to call when new logins are detected
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Start polling if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      
      // Stop polling if no more subscribers
      if (this.subscribers.size === 0) {
        this.stopPolling();
      }
    };
  }

  /**
   * Start polling for new login activities
   */
  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('🔄 Starting real-time login polling...');
    
    // Initial load to get the latest login ID
    this.checkForNewLogins();
    
    // Set up interval polling
    this.pollInterval = setInterval(() => {
      this.checkForNewLogins();
    }, this.pollFrequency);
  }

  /**
   * Stop polling for login activities
   */
  stopPolling() {
    if (!this.isPolling) return;
    
    this.isPolling = false;
    console.log('⏹️ Stopping real-time login polling...');
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Check for new login activities
   */
  async checkForNewLogins() {
    try {
      const response = await fetch('http://localhost:8000/api/stats/login-activities?limit=5&offset=0');
      const data = await response.json();
      
      if (data.success && data.data.activities && data.data.activities.length > 0) {
        const latestLogin = data.data.activities[0];
        const latestLoginId = latestLogin.id;
        
        // Check if this is a new login (different from last known ID)
        if (this.lastLoginId !== null && latestLoginId !== this.lastLoginId) {
          console.log('🔔 New login detected!', latestLogin);
          
          // Notify all subscribers about the new login
          this.notifySubscribers({
            type: 'NEW_LOGIN',
            login: latestLogin,
            allLogins: data.data.activities
          });
        }
        
        // Update the last known login ID
        this.lastLoginId = latestLoginId;
        
        // Also notify subscribers with updated data (for initial load)
        this.notifySubscribers({
          type: 'LOGIN_UPDATE',
          allLogins: data.data.activities
        });
      }
    } catch (error) {
      console.error('Error checking for new logins:', error);
      
      // Notify subscribers about the error
      this.notifySubscribers({
        type: 'ERROR',
        error: error.message
      });
    }
  }

  /**
   * Notify all subscribers
   * @param {Object} data - Data to send to subscribers
   */
  notifySubscribers(data) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  /**
   * Manually trigger a check for new logins
   */
  async refresh() {
    await this.checkForNewLogins();
  }

  /**
   * Set the polling frequency
   * @param {number} frequency - Polling frequency in milliseconds
   */
  setPollFrequency(frequency) {
    this.pollFrequency = frequency;
    
    // Restart polling with new frequency if currently polling
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
  }

  /**
   * Get current polling status
   */
  getStatus() {
    return {
      isPolling: this.isPolling,
      subscriberCount: this.subscribers.size,
      pollFrequency: this.pollFrequency,
      lastLoginId: this.lastLoginId
    };
  }
}

// Create a singleton instance
const realTimeLoginService = new RealTimeLoginService();

export default realTimeLoginService;