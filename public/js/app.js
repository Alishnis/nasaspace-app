// Main application logic
class AirQualityApp {
    constructor() {
        this.api = new APIService();
        this.map = new MapService();
        this.currentSection = 'monitor';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupLocationServices();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // Monitor section
        document.getElementById('getAirQuality').addEventListener('click', () => {
            this.getCurrentAirQuality();
        });

        document.getElementById('getCurrentLocation').addEventListener('click', () => {
            this.getCurrentLocation();
        });
        
        document.getElementById('cancelLocation').addEventListener('click', () => {
            this.cancelLocationRequest();
        });

        // Forecast section
        document.getElementById('getForecast').addEventListener('click', () => {
            this.getForecast();
        });

        // Ranking section
        document.getElementById('getRanking').addEventListener('click', () => {
            this.getCityRanking();
        });

        // History section
        document.getElementById('getHistory').addEventListener('click', () => {
            this.getHistoricalData();
        });

        // Location Widget
        document.getElementById('showLocationWidget').addEventListener('click', () => {
            this.showLocationWidget();
        });

        document.getElementById('closeWidget').addEventListener('click', () => {
            this.hideLocationWidget();
        });

        // Alerts section
        document.getElementById('subscribeAlerts').addEventListener('click', () => {
            this.subscribeToAlerts();
        });
        
        document.getElementById('useCurrentLocationAlert').addEventListener('click', () => {
            this.getCurrentLocationForAlert();
        });

        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
    }

    setupNavigation() {
        // Set initial active section
        this.showSection('monitor');
    }

    setupLocationServices() {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by this browser.');
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser.');
            return;
        }

        this.showLoading('Getting your location...');
        
        // Show cancel button
        document.getElementById('cancelLocation').style.display = 'inline-block';

        try {
            const position = await new Promise((resolve, reject) => {
                // Add timeout to prevent infinite loading
                const timeoutId = setTimeout(() => {
                    reject(new Error('Location request timed out'));
                }, 10000); // 10 second timeout

                // Store timeout ID for potential cancellation
                this.currentLocationTimeout = timeoutId;

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        clearTimeout(timeoutId);
                        this.currentLocationTimeout = null;
                        resolve(pos);
                    },
                    (error) => {
                        clearTimeout(timeoutId);
                        this.currentLocationTimeout = null;
                        reject(error);
                    },
                    {
                        enableHighAccuracy: false, // Try with lower accuracy first
                        timeout: 15000, // Increased timeout
                        maximumAge: 600000 // 10 minutes cache
                    }
                );
            });

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Validate coordinates
            if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                throw new Error('Invalid coordinates received');
            }

            document.getElementById('lat').value = lat.toFixed(6);
            document.getElementById('lng').value = lng.toFixed(6);

            this.hideLoading();
            document.getElementById('cancelLocation').style.display = 'none';
            this.showSuccess(`Location detected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } catch (error) {
            this.hideLoading();
            document.getElementById('cancelLocation').style.display = 'none';
            
            let errorMessage = 'Unable to get your location. ';
            let suggestion = '';
            
            if (error.message === 'Location request timed out') {
                errorMessage += 'Location request timed out. ';
                suggestion = 'Try moving to a location with better GPS signal or enter coordinates manually.';
            } else if (error.code === 1) {
                errorMessage += 'Location access denied. ';
                suggestion = 'Please allow location access in your browser settings or enter coordinates manually.';
            } else if (error.code === 2) {
                errorMessage += 'Location unavailable. ';
                suggestion = 'Your device may not have GPS or location services may be disabled. Please enter coordinates manually.';
            } else if (error.message === 'Invalid coordinates received') {
                errorMessage += 'Invalid location data received. ';
                suggestion = 'Please try again or enter coordinates manually.';
            } else {
                suggestion = 'Please enter coordinates manually or try again later.';
            }
            
            errorMessage += suggestion;
            
            this.showError(errorMessage);
            console.error('Geolocation error:', error);
            
            // Show helpful suggestions
            this.showLocationSuggestions();
        }
    }

    cancelLocationRequest() {
        if (this.currentLocationTimeout) {
            clearTimeout(this.currentLocationTimeout);
            this.currentLocationTimeout = null;
            this.hideLoading();
            document.getElementById('cancelLocation').style.display = 'none';
            this.showError('Location request cancelled.');
        }
    }

    showLocationSuggestions() {
        // Show helpful suggestions for getting coordinates
        const suggestions = `
            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #007bff;">
                <strong>💡 Alternative ways to get coordinates:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    <li>Use Google Maps: Right-click on a location → "What's here?" → Copy coordinates</li>
                    <li>Use your phone's GPS app to get coordinates</li>
                    <li>Try refreshing the page and allowing location access</li>
                    <li>Check if location services are enabled on your device</li>
                </ul>
            </div>
        `;
        
        // Add suggestions to the error message area
        const errorDiv = document.querySelector('.alert-danger');
        if (errorDiv) {
            errorDiv.innerHTML += suggestions;
        }
    }

    async getCurrentLocationForAlert() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser.');
            return;
        }

        this.showLoading('Getting your location...');

        try {
            const position = await new Promise((resolve, reject) => {
                // Add timeout to prevent infinite loading
                const timeoutId = setTimeout(() => {
                    reject(new Error('Location request timed out'));
                }, 10000); // 10 second timeout

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        clearTimeout(timeoutId);
                        resolve(pos);
                    },
                    (error) => {
                        clearTimeout(timeoutId);
                        reject(error);
                    },
                    {
                        enableHighAccuracy: false, // Try with lower accuracy first
                        timeout: 15000, // Increased timeout
                        maximumAge: 600000 // 10 minutes cache
                    }
                );
            });

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Validate coordinates
            if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                throw new Error('Invalid coordinates received');
            }

            document.getElementById('alertLat').value = lat.toFixed(6);
            document.getElementById('alertLng').value = lng.toFixed(6);

            this.hideLoading();
            this.showSuccess(`Location detected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } catch (error) {
            this.hideLoading();
            document.getElementById('cancelLocation').style.display = 'none';
            
            let errorMessage = 'Unable to get your location. ';
            let suggestion = '';
            
            if (error.message === 'Location request timed out') {
                errorMessage += 'Location request timed out. ';
                suggestion = 'Try moving to a location with better GPS signal or enter coordinates manually.';
            } else if (error.code === 1) {
                errorMessage += 'Location access denied. ';
                suggestion = 'Please allow location access in your browser settings or enter coordinates manually.';
            } else if (error.code === 2) {
                errorMessage += 'Location unavailable. ';
                suggestion = 'Your device may not have GPS or location services may be disabled. Please enter coordinates manually.';
            } else if (error.message === 'Invalid coordinates received') {
                errorMessage += 'Invalid location data received. ';
                suggestion = 'Please try again or enter coordinates manually.';
            } else {
                suggestion = 'Please enter coordinates manually or try again later.';
            }
            
            errorMessage += suggestion;
            
            this.showError(errorMessage);
            console.error('Geolocation error:', error);
            
            // Show helpful suggestions
            this.showLocationSuggestions();
        }
    }

    async getCurrentAirQuality() {
        const lat = document.getElementById('lat').value;
        const lng = document.getElementById('lng').value;

        if (!lat || !lng) {
            this.showError('Please enter latitude and longitude coordinates.');
            return;
        }

        this.showLoading('Fetching air quality data...');

        try {
            const data = await this.api.getCurrentAirQuality(lat, lng);
            this.displayCurrentAirQuality(data);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to fetch air quality data. Please try again.');
            console.error('Error fetching air quality:', error);
        }
    }

    async getForecast() {
        const lat = document.getElementById('forecastLat').value;
        const lng = document.getElementById('forecastLng').value;
        const days = document.getElementById('forecastDays').value;

        if (!lat || !lng) {
            this.showError('Please enter latitude and longitude coordinates.');
            return;
        }

        this.showLoading('Fetching forecast data...');

        try {
            const data = await this.api.getAirQualityForecast(lat, lng, days);
            this.displayForecast(data);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to fetch forecast data. Please try again.');
            console.error('Error fetching forecast:', error);
        }
    }

    async subscribeToAlerts() {
        let lat = document.getElementById('alertLat').value;
        let lng = document.getElementById('alertLng').value;
        const email = document.getElementById('alertEmail').value;
        const phone = document.getElementById('alertPhone').value;

        // If coordinates are not provided, try to use current location or last used coordinates
        if (!lat || !lng) {
            // Try to get coordinates from current location input fields
            const currentLat = document.getElementById('lat').value;
            const currentLng = document.getElementById('lng').value;
            
            if (currentLat && currentLng) {
                lat = currentLat;
                lng = currentLng;
                // Auto-fill the alert form
                document.getElementById('alertLat').value = lat;
                document.getElementById('alertLng').value = lng;
            } else {
                this.showError('Please enter latitude and longitude coordinates.');
                return;
            }
        }

        if (!email && !phone) {
            this.showError('Please provide either an email address or phone number.');
            return;
        }

        const alertLevels = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        if (alertLevels.length === 0) {
            this.showError('Please select at least one alert level.');
            return;
        }

        this.showLoading('Subscribing to alerts...');

        try {
            const result = await this.api.subscribeToAlerts({
                lat, lng, email, phone, alertLevels
            });
            
            this.hideLoading();
            this.showSuccess(`Successfully subscribed to alerts! Subscription ID: ${result.subscriptionId}`);
            
            // Clear form
            document.getElementById('alertLat').value = '';
            document.getElementById('alertLng').value = '';
            document.getElementById('alertEmail').value = '';
            document.getElementById('alertPhone').value = '';
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to subscribe to alerts. Please try again.');
            console.error('Error subscribing to alerts:', error);
        }
    }

    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        this.showLoading('Logging in...');

        try {
            const result = await this.api.login(email, password);
            
            this.hideLoading();
            this.showSuccess('Login successful!');
            
            // Store token
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Clear form
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        } catch (error) {
            this.hideLoading();
            this.showError('Login failed. Please check your credentials.');
            console.error('Login error:', error);
        }
    }

    async register() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        this.showLoading('Creating account...');

        try {
            const result = await this.api.register({ name, email, password });
            
            this.hideLoading();
            this.showSuccess('Account created successfully!');
            
            // Store token
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Clear form
            document.getElementById('registerName').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
        } catch (error) {
            this.hideLoading();
            this.showError('Registration failed. Please try again.');
            console.error('Registration error:', error);
        }
    }

    displayCurrentAirQuality(data) {
        const resultsDiv = document.getElementById('currentResults');
        
        const aqiClass = this.getAQIClass(data.aqi);
        
        resultsDiv.innerHTML = `
            <div class="air-quality-card">
                <div class="aqi-display">
                    <div class="aqi-value ${aqiClass}">${data.aqi}</div>
                    <div class="aqi-category ${aqiClass}">${data.category}</div>
                    <div class="health-message">${data.healthMessage}</div>
                </div>
                
                <div class="recommendations">
                    <h4>Recommendations:</h4>
                    <ul>
                        ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="pollutants-grid">
                    ${Object.entries(data.pollutants).map(([name, value]) => `
                        <div class="pollutant-card">
                            <div class="pollutant-name">${name.toUpperCase()}</div>
                            <div class="pollutant-value">${value ? parseFloat(value).toFixed(1) : 'N/A'}</div>
                            <div class="pollutant-unit">${this.getPollutantUnit(name)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="data-sources">
                    <h3>Data Sources</h3>
                    <p><strong>Location:</strong> ${parseFloat(data.location.lat).toFixed(4)}, ${parseFloat(data.location.lng).toFixed(4)}</p>
                    <p><strong>Last Updated:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                    <p><strong>Sources:</strong> NASA TEMPO, Weather Data, Ground Stations</p>
                </div>
            </div>
        `;
    }

    displayForecast(data) {
        const resultsDiv = document.getElementById('forecastResults');
        
        resultsDiv.innerHTML = `
            <div class="forecast-info">
                <h3>5-Day Air Quality Forecast</h3>
                <p><strong>Location:</strong> ${parseFloat(data.location.lat).toFixed(4)}, ${parseFloat(data.location.lng).toFixed(4)}</p>
                <p><strong>Generated:</strong> ${new Date(data.generatedAt).toLocaleString()}</p>
            </div>
            
            <div class="forecast-grid">
                ${data.forecast.map(day => {
                    const aqiClass = this.getAQIClass(day.aqi);
                    return `
                        <div class="forecast-card">
                            <div class="forecast-date">${new Date(day.date).toLocaleDateString()}</div>
                            <div class="forecast-aqi ${aqiClass}">${day.aqi}</div>
                            <div class="forecast-category ${aqiClass}">${day.category}</div>
                            <div class="forecast-pollutants">
                                <div>PM2.5: ${day.pollutants.pm25 ? parseFloat(day.pollutants.pm25).toFixed(1) : 'N/A'}</div>
                                <div>PM10: ${day.pollutants.pm10 ? parseFloat(day.pollutants.pm10).toFixed(1) : 'N/A'}</div>
                                <div>O3: ${day.pollutants.ozone ? parseFloat(day.pollutants.ozone).toFixed(1) : 'N/A'}</div>
                                <div>NO2: ${day.pollutants.no2 ? parseFloat(day.pollutants.no2).toFixed(1) : 'N/A'}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getAQIClass(aqi) {
        if (aqi <= 50) return 'good';
        if (aqi <= 100) return 'moderate';
        if (aqi <= 150) return 'unhealthy';
        if (aqi <= 200) return 'very-unhealthy';
        return 'hazardous';
    }

    getPollutantUnit(pollutant) {
        const units = {
            pm25: 'μg/m³',
            pm10: 'μg/m³',
            ozone: 'ppb',
            no2: 'ppb',
            so2: 'ppb',
            co: 'ppm'
        };
        return units[pollutant] || '';
    }

    showLoading(message) {
        const resultsDiv = this.getCurrentResultsDiv();
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>${message}</span>
            </div>
        `;
    }

    hideLoading() {
        // Loading will be replaced by results
    }

    showError(message) {
        const resultsDiv = this.getCurrentResultsDiv();
        resultsDiv.innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }

    showSuccess(message) {
        const resultsDiv = this.getCurrentResultsDiv();
        resultsDiv.innerHTML = `
            <div class="success">
                <strong>Success:</strong> ${message}
            </div>
        `;
    }

    async getCityRanking() {
        const country = document.getElementById('countrySelect').value;
        
        this.showLoading('Getting city ranking...');

        try {
            const data = await this.api.getCityRanking(country);
            this.displayCityRanking(data);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to fetch city ranking. Please try again.');
            console.error('Error fetching city ranking:', error);
        }
    }

    displayCityRanking(data) {
        const container = document.getElementById('rankingResults');
        
        let html = `
            <div class="ranking-header">
                <h3>Real-time ${data.country} AQI+ city ranking</h3>
                <p>Updated: ${new Date().toLocaleString()}</p>
            </div>
            <div class="ranking-table">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cities</th>
                            <th>AQI+ US</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.cities.forEach((city, index) => {
            const aqiColor = this.getAQIColor(city.aqi);
            const aqiCategory = this.getAQICategory(city.aqi);
            
            html += `
                <tr class="ranking-row ${index === 0 ? 'top-city' : ''}">
                    <td class="rank">${index + 1}</td>
                    <td class="city-name">
                        <span class="flag">🏳️</span>
                        ${city.name}
                    </td>
                    <td class="aqi-value">
                        <span class="aqi-badge ${aqiColor}">${city.aqi}</span>
                        <span class="aqi-category">${aqiCategory}</span>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    getAQIColor(aqi) {
        if (aqi <= 50) return 'good';
        if (aqi <= 100) return 'moderate';
        if (aqi <= 150) return 'unhealthy-sensitive';
        if (aqi <= 200) return 'unhealthy';
        if (aqi <= 300) return 'very-unhealthy';
        return 'hazardous';
    }

    getAQICategory(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    }

    async getHistoricalData() {
        const lat = document.getElementById('historyLat').value;
        const lng = document.getElementById('historyLng').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!lat || !lng) {
            this.showError('Please enter latitude and longitude coordinates.');
            return;
        }

        if (!startDate || !endDate) {
            this.showError('Please select start and end dates.');
            return;
        }

        this.showLoading('Fetching historical data...');

        try {
            const data = await this.api.getHistoricalAirQuality(lat, lng, startDate, endDate);
            this.displayHistoricalData(data);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to fetch historical data. Please try again.');
            console.error('Error fetching historical data:', error);
        }
    }

    displayHistoricalData(data) {
        const container = document.getElementById('historyResults');
        
        let html = `
            <div class="historical-header">
                <h3>Historical Air Quality Data</h3>
                <p><strong>Location:</strong> ${parseFloat(data.location.lat).toFixed(4)}, ${parseFloat(data.location.lng).toFixed(4)}</p>
                <p><strong>Period:</strong> ${data.startDate} to ${data.endDate}</p>
            </div>
            <div class="historical-chart">
                <canvas id="aqiChart" width="800" height="400"></canvas>
            </div>
            <div class="historical-stats">
                <div class="stat-card">
                    <h4>Average AQI</h4>
                    <div class="stat-value">${data.averageAQI.toFixed(1)}</div>
                </div>
                <div class="stat-card">
                    <h4>Highest AQI</h4>
                    <div class="stat-value">${data.highestAQI}</div>
                </div>
                <div class="stat-card">
                    <h4>Lowest AQI</h4>
                    <div class="stat-value">${data.lowestAQI}</div>
                </div>
                <div class="stat-card">
                    <h4>Good Days</h4>
                    <div class="stat-value">${data.goodDays}</div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        
        // Create chart
        this.createAQIChart(data.historicalData);
    }

    createAQIChart(data) {
        const canvas = document.getElementById('aqiChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set up chart
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Draw axes
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // Draw AQI line
        if (data.length > 0) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const stepX = chartWidth / (data.length - 1);
            const maxAQI = Math.max(...data.map(d => d.aqi));
            const minAQI = Math.min(...data.map(d => d.aqi));
            const aqiRange = maxAQI - minAQI || 1;
            
            data.forEach((point, index) => {
                const x = padding + index * stepX;
                const y = height - padding - ((point.aqi - minAQI) / aqiRange) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = '#3b82f6';
            data.forEach((point, index) => {
                const x = padding + index * stepX;
                const y = height - padding - ((point.aqi - minAQI) / aqiRange) * chartHeight;
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
        
        // Draw labels
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const value = minAQI + (aqiRange * i / 5);
            const y = height - padding - (i / 5) * chartHeight;
            ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
        }
        
        // X-axis labels (dates)
        const labelStep = Math.max(1, Math.floor(data.length / 5));
        for (let i = 0; i < data.length; i += labelStep) {
            const x = padding + i * stepX;
            const date = new Date(data[i].date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            ctx.fillText(dateStr, x, height - padding + 20);
        }
    }

    async showLocationWidget() {
        const lat = document.getElementById('lat').value;
        const lng = document.getElementById('lng').value;

        if (!lat || !lng) {
            this.showError('Please enter coordinates first or use "Get Air Quality" to load data.');
            return;
        }

        try {
            // Get air quality data
            const airQualityData = await this.api.getCurrentAirQuality(lat, lng);
            
            // Get weather data
            const weatherData = await this.api.getCurrentWeather(lat, lng);
            
            // Update widget with data
            this.updateLocationWidget(airQualityData, weatherData);
            
            // Show widget
            const widget = document.getElementById('locationWidget');
            widget.style.display = 'block';
            
            // Start auto-update
            this.startWidgetAutoUpdate();
            
            this.showSuccess('Location widget updated!');
        } catch (error) {
            this.showError('Failed to load data for widget. Please try again.');
            console.error('Error loading widget data:', error);
        }
    }

    updateLocationWidget(airQualityData, weatherData) {
        const aqi = airQualityData.aqi;
        const category = airQualityData.category;
        
        // Update AQI
        document.getElementById('widgetAQI').textContent = aqi;
        document.getElementById('widgetCategory').textContent = category;
        
        // Update AQI badge color
        const aqiBadge = document.querySelector('.aqi-badge');
        aqiBadge.className = `aqi-badge ${this.getAQIColor(aqi)}`;
        
        // Update widget background color
        const widget = document.getElementById('locationWidget');
        widget.className = `location-widget ${this.getAQIColor(aqi)}`;
        
        // Update main pollutant
        if (airQualityData.pollutants) {
            const pollutants = airQualityData.pollutants;
            const mainPollutant = this.getMainPollutant(pollutants);
            
            document.getElementById('widgetMainPollutant').textContent = mainPollutant.name;
            document.getElementById('widgetConcentration').textContent = `${mainPollutant.value} ${mainPollutant.unit}`;
        }
        
        // Update weather data
        if (weatherData) {
            document.getElementById('widgetTemperature').textContent = `${Math.round(weatherData.temperature)}°`;
            document.getElementById('widgetWind').textContent = `${Math.round(weatherData.windSpeed)} km/h`;
            document.getElementById('widgetHumidity').textContent = `${Math.round(weatherData.humidity)}%`;
        }
        
        // Update last updated time
        const now = new Date();
        document.getElementById('widgetLastUpdated').textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }

    getMainPollutant(pollutants) {
        // Find the pollutant with the highest concentration
        const pollutantEntries = Object.entries(pollutants);
        let mainPollutant = { name: 'PM2.5', value: pollutants.pm25 || 0, unit: 'μg/m³' };
        
        // Simple logic to determine main pollutant based on concentration
        if (pollutants.pm25 && pollutants.pm25 > 0) {
            mainPollutant = { name: 'PM2.5', value: parseFloat(pollutants.pm25).toFixed(1), unit: 'μg/m³' };
        } else if (pollutants.pm10 && pollutants.pm10 > 0) {
            mainPollutant = { name: 'PM10', value: parseFloat(pollutants.pm10).toFixed(1), unit: 'μg/m³' };
        } else if (pollutants.ozone && pollutants.ozone > 0) {
            mainPollutant = { name: 'O₃', value: parseFloat(pollutants.ozone).toFixed(1), unit: 'ppb' };
        } else if (pollutants.no2 && pollutants.no2 > 0) {
            mainPollutant = { name: 'NO₂', value: parseFloat(pollutants.no2).toFixed(1), unit: 'ppb' };
        }
        
        return mainPollutant;
    }

    hideLocationWidget() {
        const widget = document.getElementById('locationWidget');
        widget.style.display = 'none';
        
        // Clear any existing auto-update interval
        if (this.widgetUpdateInterval) {
            clearInterval(this.widgetUpdateInterval);
            this.widgetUpdateInterval = null;
        }
    }

    startWidgetAutoUpdate() {
        // Update widget every 5 minutes
        this.widgetUpdateInterval = setInterval(async () => {
            const lat = document.getElementById('lat').value;
            const lng = document.getElementById('lng').value;
            
            if (lat && lng) {
                try {
                    // Show updating indicator
                    const indicator = document.getElementById('widgetUpdateIndicator');
                    indicator.style.display = 'inline';
                    indicator.style.animation = 'spin 1s linear infinite';
                    
                    const airQualityData = await this.api.getCurrentAirQuality(lat, lng);
                    const weatherData = await this.api.getCurrentWeather(lat, lng);
                    this.updateLocationWidget(airQualityData, weatherData);
                    
                    // Hide updating indicator
                    setTimeout(() => {
                        indicator.style.display = 'none';
                        indicator.style.animation = 'none';
                    }, 1000);
                } catch (error) {
                    console.error('Auto-update failed:', error);
                    const indicator = document.getElementById('widgetUpdateIndicator');
                    indicator.style.display = 'none';
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    getCurrentResultsDiv() {
        switch (this.currentSection) {
            case 'monitor':
                return document.getElementById('currentResults');
            case 'forecast':
                return document.getElementById('forecastResults');
            case 'ranking':
                return document.getElementById('rankingResults');
            case 'history':
                return document.getElementById('historyResults');
            case 'alerts':
                return document.getElementById('alertResults');
            case 'login':
                return document.getElementById('authResults');
            default:
                return document.getElementById('currentResults');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AirQualityApp();
});
