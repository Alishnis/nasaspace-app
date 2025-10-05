// API service for communicating with the backend
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:3003';
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/api${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Air Quality API
    async getCurrentAirQuality(lat, lng) {
        return this.request(`/air-quality/current?lat=${lat}&lng=${lng}`);
    }

    async getAirQualityForecast(lat, lng, days = 5) {
        return this.request(`/air-quality/forecast?lat=${lat}&lng=${lng}&days=${days}`);
    }

    async getHistoricalAirQuality(lat, lng, startDate, endDate) {
        return this.request(`/air-quality/historical?lat=${lat}&lng=${lng}&startDate=${startDate}&endDate=${endDate}`);
    }

    async getAirQualityAlerts(lat, lng) {
        return this.request(`/air-quality/alerts?lat=${lat}&lng=${lng}`);
    }

    // TEMPO API
    async getTempoData(lat, lng) {
        return this.request(`/tempo/data?lat=${lat}&lng=${lng}`);
    }

    async getTempoDataForDate(lat, lng, date) {
        return this.request(`/tempo/data/${date}?lat=${lat}&lng=${lng}`);
    }

    async getTempoCoverage(lat, lng) {
        return this.request(`/tempo/coverage?lat=${lat}&lng=${lng}`);
    }

    // Weather API
    async getWeatherData(lat, lng) {
        return this.request(`/weather/current?lat=${lat}&lng=${lng}`);
    }

    async getWeatherForecast(lat, lng, days = 5) {
        return this.request(`/weather/forecast?lat=${lat}&lng=${lng}&days=${days}`);
    }

    async getHistoricalWeather(lat, lng, startDate, endDate) {
        return this.request(`/weather/historical?lat=${lat}&lng=${lng}&startDate=${startDate}&endDate=${endDate}`);
    }

    // City Ranking API
    async getCityRanking(country) {
        return this.request(`/air-quality/ranking?country=${country}`);
    }

    // Historical Data API
    async getHistoricalAirQuality(lat, lng, startDate, endDate) {
        return this.request(`/air-quality/historical?lat=${lat}&lng=${lng}&startDate=${startDate}&endDate=${endDate}`);
    }

    // Current Weather API
    async getCurrentWeather(lat, lng) {
        return this.request(`/weather/current?lat=${lat}&lng=${lng}`);
    }

    // Notifications API
    async subscribeToAlerts({ lat, lng, email, phone, alertLevels }) {
        return this.request('/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify({ lat, lng, email, phone, alertLevels })
        });
    }

    async unsubscribeFromAlerts(subscriptionId) {
        return this.request(`/notifications/unsubscribe/${subscriptionId}`, {
            method: 'DELETE'
        });
    }

    async getNotificationPreferences(userId) {
        return this.request(`/notifications/preferences/${userId}`);
    }

    async updateNotificationPreferences(userId, preferences) {
        return this.request(`/notifications/preferences/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(preferences)
        });
    }

    async sendTestNotification(userId, type, message) {
        return this.request('/notifications/test', {
            method: 'POST',
            body: JSON.stringify({ userId, type, message })
        });
    }

    // User API
    async register({ name, email, password }) {
        return this.request('/users/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }

    async login(email, password) {
        return this.request('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async getUserProfile() {
        return this.request('/users/profile');
    }

    async updateUserProfile(updates) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async deleteUser() {
        return this.request('/users/account', {
            method: 'DELETE'
        });
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    // Update token
    updateToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    // Clear authentication
    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

// WebSocket service for real-time updates
class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect() {
        try {
            this.socket = io('http://localhost:3003');
            
            this.socket.on('connect', () => {
                console.log('Connected to server');
                this.reconnectAttempts = 0;
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from server');
                this.attemptReconnect();
            });

            this.socket.on('air-quality-update', (data) => {
                this.handleAirQualityUpdate(data);
            });

            this.socket.on('alert', (data) => {
                this.handleAlert(data);
            });

        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.attemptReconnect();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    subscribeToLocation(lat, lng) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('subscribe-location', { lat, lng });
        }
    }

    unsubscribeFromLocation(lat, lng) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('unsubscribe-location', { lat, lng });
        }
    }

    handleAirQualityUpdate(data) {
        console.log('Air quality update received:', data);
        // Emit custom event for the app to handle
        window.dispatchEvent(new CustomEvent('airQualityUpdate', { detail: data }));
    }

    handleAlert(data) {
        console.log('Alert received:', data);
        // Show notification to user
        this.showNotification(data);
    }

    showNotification(data) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(data.title, {
                body: data.message,
                icon: '/images/icon.png'
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Initialize WebSocket connection
const wsService = new WebSocketService();
wsService.connect();

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
