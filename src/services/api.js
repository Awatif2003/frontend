import AsyncStorage from '@react-native-async-storage/async-storage';

// Updated API URLs to match the backend
const API_URLS = [
  'http://192.168.43.143:3000', // User's backend IP
];

let API_BASE_URL = API_URLS[0]; // Default to first URL

class ApiService {
  // Get stored auth token
  static async getToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Set auth token
  static async setToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);
      console.log('✅ Token saved successfully');
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  // Remove auth token
  static async removeToken() {
    try {
      await AsyncStorage.removeItem('authToken');
      console.log('✅ Token removed successfully');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Make authenticated API request with better error handling
  static async makeAuthenticatedRequest(endpoint, options = {}) {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
        try {
            const token = await this.getToken();
            const defaultHeaders = {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            };

            console.log(`📡 Making ${options.method || 'GET'} request to: ${API_BASE_URL}${endpoint}`);
            console.log(`🔑 Using token: ${token ? 'present' : 'none'}`);

            const response = await this.fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: { ...defaultHeaders, ...options.headers }
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
                }

                // Only treat as auth error if we actually have a token
                if (response.status === 401 && token) {
                    console.log('🔐 Authentication failed, removing token');
                    await this.removeToken();
                    throw new Error('Authentication required');
                } else if (response.status === 401 && !token) {
                    console.warn('⚠️ No token available for authenticated request, proceeding anyway for development...');
                    // For development: Don't fail on 401 if no token available
                    // This should be removed in production
                    return await response.json();
                }
                
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            attempt++;
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
  }

  // Improved fetch with timeout
  static async fetchWithTimeout(resource, options = {}) {
    const { timeout = 20000 } = options; // Increased default timeout to 20 seconds
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(resource, { 
        ...options, 
        signal: controller.signal 
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Login method
  static async login(username, password) {
    try {
      console.log(`🚀 Attempting login to: ${API_BASE_URL}/login`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        timeout: 30000, // Increased timeout for login to 30 seconds
      });

      const data = await response.json();
      console.log('🔍 Raw backend response:', data);
      console.log('🔍 Response has token:', !!data.token);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token) {
        console.log('✅ Token found in response, storing...');
        await this.setToken(data.token);
      } else {
        console.log('ℹ️ Backend using session-based authentication (no JWT token provided)');
      }
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  // Create a new user
  static async createUser() {
    try {
      return await this.makeAuthenticatedRequest('/create-user', {
        method: 'POST',
      });
    } catch (error) {
      console.error('❌ Create user error:', error);
      throw error;
    }
  }

  // Weather data - Modified for development without tokens
  static async getWeatherData() {
    try {
      console.log('🌦️ Fetching weather data...');
      // For development: Try without authentication first
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/weather`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || data;
      } else {
        console.warn('⚠️ Weather endpoint returned non-200 status:', response.status);
        // Return mock data for development - format as array as expected by the component
        console.log('📝 Returning mock weather data for development');
        return [
          {
            id: 1,
            temperature: 25,
            humidity: 60,
            windSpeed: 2.5, // m/s as expected by the component
            condition: 'Partly Cloudy',
            location: 'Development Mode',
            pressure: 1013,
            visibility: 10,
            timestamp: new Date().toISOString()
          }
        ];
      }
    } catch (error) {
      console.error('❌ Weather data error:', error);
      // Return mock data for development - format as array
      console.log('📝 Returning mock weather data for development');
      return [
        {
          id: 1,
          temperature: 25,
          humidity: 60,
          windSpeed: 2.5, // m/s as expected by the component
          condition: 'Partly Cloudy',
          location: 'Development Mode',
          pressure: 1013,
          visibility: 10,
          timestamp: new Date().toISOString()
        }
      ];
    }
  }

  // Location data - Modified for development without tokens
  static async getLocationData() {
    try {
      console.log('📍 Fetching location data...');
      // For development: Try without authentication first
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/locations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || data;
      } else {
        console.warn('⚠️ Location endpoint returned non-200 status:', response.status);
        // Return mock data for development - format as expected by the component
        console.log('📝 Returning mock location data for development');
        return [
          {
            id: 1,
            Latitude: -6.2088,
            Longitude: 106.8456,
            Timestamp: new Date().toISOString(),
            BoatID: 'DEV-BOAT-001',
            address: 'Development Mode - Jakarta, Indonesia',
            accuracy: 10
          }
        ];
      }
    } catch (error) {
      console.error('❌ Location data error:', error);
      // Return mock data for development
      console.log('📝 Returning mock location data for development');
      return [
        {
          id: 1,
          Latitude: -6.2088,
          Longitude: 106.8456,
          Timestamp: new Date().toISOString(),
          BoatID: 'DEV-BOAT-001',
          address: 'Development Mode - Jakarta, Indonesia',
          accuracy: 10
        }
      ];
    }
  }

  // Alerts data - Modified for development without tokens
  static async getAlerts() {
    try {
      console.log('🚨 Fetching alerts data...');
      // For development: Try without authentication first
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || data;
      } else {
        console.warn('⚠️ Alerts endpoint returned non-200 status:', response.status);
        // Return mock data for development - format as expected by the component
        console.log('📝 Returning mock alerts data for development');
        return [
          {
            AlertID: 1,
            Message: 'High winds expected - Development Mode',
            AlertTime: new Date().toISOString(),
            BoatID: 'DEV-BOAT-001',
            LCDStatus: 'Active'
          },
          {
            AlertID: 2,
            Message: 'Shallow waters ahead - Development Mode',
            AlertTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            BoatID: 'DEV-BOAT-001',
            LCDStatus: 'Acknowledged'
          }
        ];
      }
    } catch (error) {
      console.error('❌ Alerts data error:', error);
      // Return mock data for development
      console.log('📝 Returning mock alerts data for development');
      return [
        {
          AlertID: 1,
          Message: 'High winds expected - Development Mode',
          AlertTime: new Date().toISOString(),
          BoatID: 'DEV-BOAT-001',
          LCDStatus: 'Active'
        },
        {
          AlertID: 2,
          Message: 'Shallow waters ahead - Development Mode',
          AlertTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          BoatID: 'DEV-BOAT-001',
          LCDStatus: 'Acknowledged'
        }
      ];
    }
  }

  // Create new alert
  static async createAlert(alertData) {
    try {
      return await this.makeAuthenticatedRequest('/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });
    } catch (error) {
      console.error('❌ Create alert error:', error);
      throw error;
    }
  }

  // Get alert by ID
  static async getAlertById(alertId) {
    try {
      const response = await this.makeAuthenticatedRequest(`/alerts/${alertId}`);
      return response.alert || response;
    } catch (error) {
      console.error('❌ Get alert error:', error);
      throw error;
    }
  }

  // Acknowledge alert
  static async acknowledgeAlert(alertId, responseMessage = '') {
    try {
      return await this.makeAuthenticatedRequest(`/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseMessage }),
      });
    } catch (error) {
      console.error('❌ Alert acknowledgment error:', error);
      throw error;
    }
  }

  // Health check with automatic URL switching
  static async healthCheck() {
    let lastError;
    
    for (const url of API_URLS) {
        try {
            console.log(`🔍 Testing connectivity to: ${url}/health`);
            
            const response = await this.fetchWithTimeout(`${url}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                timeout: 15000, // Increased timeout to 15 seconds
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Health check successful for ${url}:`, data);
                
                // Switch to working URL if different from current
                if (API_BASE_URL !== url) {
                    console.log(`🔄 Switching to working API URL: ${url}`);
                    this.setBaseUrl(url);
                }
                
                return data;
            } else {
                throw new Error(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Health check failed for ${url}:`, error.message);
            lastError = error;
        }
    }
    
    throw new Error(`All API endpoints unreachable. Last error: ${lastError?.message}`);
  }

  // Initialize API service with better error handling and retry mechanism
  static async initialize() {
    try {
        console.log('🚀 Initializing API service...');
        
        // Try to get stored URL
        let storedUrl = null;
        try {
            storedUrl = await AsyncStorage.getItem('apiBaseUrl');
            if (storedUrl) {
                console.log(`📱 Found stored API URL: ${storedUrl}`);
            }
        } catch (storageError) {
            console.error('❌ Error accessing AsyncStorage:', storageError);
        }
        
        // Set base URL
        if (storedUrl && API_URLS.includes(storedUrl)) {
            API_BASE_URL = storedUrl;
            console.log(`📱 Using stored API URL: ${API_BASE_URL}`);
        } else {
            API_BASE_URL = API_URLS[0];
            console.log(`📱 Using default API URL: ${API_BASE_URL}`);
        }
        
        // Test connectivity with retries
        const MAX_RETRIES = 3;
        let attempts = 0;
        let success = false;
        
        while (attempts < MAX_RETRIES && !success) {
            try {
                attempts++;
                console.log(`🔍 Health check attempt ${attempts}/${MAX_RETRIES}...`);
                await this.healthCheck();
                success = true;
                console.log('✅ Health check successful');
            } catch (healthError) {
                console.warn(`⚠️ Health check attempt ${attempts} failed:`, healthError.message);
                
                // If we've tried all URLs and still failed, don't retry
        if (attempts < MAX_RETRIES) {
            // Wait before retry (increasing delay)
            const delay = 1000 * attempts;
            console.log(`⏱️ Waiting ${delay}ms before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        // If all attempts fail, API_BASE_URL remains the last tried URL or default
            }
        }
        
        if (!success) {
            console.error('❌ All API initialization attempts failed');
            // Continue with default URL even if health check fails
        }
    } catch (error) {
        console.error('❌ API initialization critical error:', error);
        // Continue with default URL even if health check fails
    } finally {
        console.log(`🏁 API initialization completed. Using: ${API_BASE_URL}`);
    }
  }

  // Set the base URL for API requests
  static async setBaseUrl(url) {
    if (API_URLS.includes(url)) {
        console.log(`🔄 Changing API base URL to: ${url}`);
        API_BASE_URL = url;
        try {
            await AsyncStorage.setItem('apiBaseUrl', url);
        } catch (error) {
            console.error('Error saving API URL:', error);
        }
    } else {
        console.error(`❌ Invalid API URL: ${url}`);
    }
  }

  // Get current API base URL
  static getBaseUrl() {
    return API_BASE_URL;
  }

  // Test connectivity to all API URLs
  static async testAllConnections() {
    const results = [];
    for (const url of API_URLS) {
      try {
        const startTime = Date.now();
        const response = await this.fetchWithTimeout(`${url}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          timeout: 3000,
        });
        const endTime = Date.now();
        if (response.ok) {
          const data = await response.json();
          results.push({ url, status: 'success', responseTime: endTime - startTime, data });
        } else {
          results.push({ url, status: 'error', error: `HTTP ${response.status}` });
        }
      } catch (error) {
        results.push({ url, status: 'error', error: error.message });
      }
    }
    return results;
  }

  // Check API status
  static async checkApiStatus() {
    try {
      return await this.fetchWithTimeout(`${API_BASE_URL}/`);
    } catch (error) {
      console.error('❌ API status error:', error);
      throw error;
    }
  }

  // Submit IoT data
  static async submitIotData(iotData) {
    try {
      return await this.makeAuthenticatedRequest('/iot/data', {
        method: 'POST',
        body: JSON.stringify(iotData),
      });
    } catch (error) {
      console.error('❌ Submit IoT data error:', error);
      throw error;
    }
  }

  // Check IoT endpoint status
  static async checkIotHealth() {
    try {
      return await this.fetchWithTimeout(`${API_BASE_URL}/iot/health`);
    } catch (error) {
      console.error('❌ IoT health error:', error);
      throw error;
    }
  }

  /**
   * Get alerts data from backend
   * @returns {Promise<Array>} Alerts data
   */
  async getAlertsData() {
    console.log('🚨 Fetching alerts data...');
    
    try {
      // Try to get alerts from backend first
      const response = await fetch(`${this.baseURL}/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real alerts data loaded:', data);
        return data;
      } else {
        console.warn('⚠️ Alerts endpoint returned non-200 status:', response.status);
        console.log('📝 Returning mock alerts data for development');
        return this.getMockAlertsData();
      }
    } catch (error) {
      console.warn('⚠️ Alerts endpoint failed:', error.message);
      console.log('📝 Returning mock alerts data for development');
      return this.getMockAlertsData();
    }
  }

  /**
   * Get mock alerts data for development
   * @returns {Array} Mock alerts data
   */
  getMockAlertsData() {
    return [
      {
        AlertID: 'high_001',
        AlertType: 'Weather',
        Message: '🌪️ SEVERE STORM WARNING: Wind speeds exceeding 25 m/s detected. Seek immediate shelter!',
        Timestamp: new Date().toISOString(),
        Severity: 'High'
      },
      {
        AlertID: 'med_002', 
        AlertType: 'Navigation',
        Message: '⚠️ Shallow water detected ahead. Reduce speed and navigate carefully.',
        Timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        Severity: 'Medium'
      },
      {
        AlertID: 'low_003',
        AlertType: 'Weather', 
        Message: 'ℹ️ Tide change expected in next 30 minutes. Plan accordingly.',
        Timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        Severity: 'Low'
      },
      {
        AlertID: 'high_004',
        AlertType: 'Safety',
        Message: '🚨 EMERGENCY: Engine temperature critical! Reduce speed immediately!',
        Timestamp: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
        Severity: 'High'
      },
      {
        AlertID: 'med_005',
        AlertType: 'Equipment',
        Message: '⚠️ GPS signal weak. Switch to backup navigation system.',
        Timestamp: new Date(Date.now() - 450000).toISOString(), // 7.5 minutes ago
        Severity: 'Medium'
      }
    ];
  }
}

export default ApiService;
