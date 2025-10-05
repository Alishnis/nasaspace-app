# 🌍 NASA TEMPO Air Quality Monitoring App

A comprehensive real-time air quality monitoring application using NASA TEMPO satellite data, ground-based measurements, and weather data integration.

## 🚀 Features

### Core Functionality
- **Real-time Air Quality Monitoring** - Current AQI data with detailed pollutant breakdown
- **NASA TEMPO Integration** - Satellite-based pollution monitoring
- **Weather Integration** - OpenWeatherMap API for comprehensive weather data
- **City Ranking System** - Global air quality rankings with coordinates
- **Historical Data Visualization** - Interactive charts and trends
- **Location Widget** - Compact floating widget with auto-update

### Notification System
- **Email Alerts** - Gmail SMTP integration with HTML templates
- **Test Notifications** - Immediate confirmation emails after subscription
- **Real-time Updates** - WebSocket-based live notifications
- **Multi-level Alerts** - Configurable alert thresholds

### User Experience
- **Responsive Design** - Modern UI with mobile-first approach
- **Geolocation Support** - Automatic location detection with fallback options
- **Interactive Maps** - Visual representation of air quality data
- **Health Recommendations** - WHO guidelines and health advice

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **Redis** - Caching and session management
- **Nodemailer** - Email service integration

### Frontend
- **HTML5/CSS3** - Modern web standards
- **JavaScript ES6+** - Interactive functionality
- **Canvas API** - Data visualization
- **Geolocation API** - Location services

### APIs & Services
- **NASA TEMPO API** - Satellite air quality data
- **OpenWeatherMap API** - Weather information
- **Gmail SMTP** - Email notifications

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- Redis (optional, falls back to in-memory cache)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alishnis/nasaspace-app.git
   cd nasaspace-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Start the application**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:3003
   - Start monitoring air quality!

## 🔧 Configuration

### Environment Variables

The application includes all necessary API keys for immediate use:

```env
# Server Configuration
PORT=3003
NODE_ENV=development

# NASA TEMPO API (Included)
NASA_TEMPO_API_KEY=rpDFc3APJjZmiaAjRtRND9vFo3xF0MFWAPxQOxBC
NASA_TEMPO_BASE_URL=https://api.nasa.gov/insight_weather

# Weather API (Included)
WEATHER_API_KEY=45715ae2f073ea19d11f2a1e434236fe
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# Email Configuration (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=romankulalisher@gmail.com
EMAIL_PASS=oszy mfrw goyl prag

# Database (Optional)
MONGODB_URI=mongodb://localhost:27017/air-quality-monitor
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=56e82a4b97abf742543f7c8c98ec2b15b1db4e2a3e1be0b10fa1a650e4b78950
ENCRYPTION_KEY=6f7c40e96f58b7d29551098d7bda4c2f869ad88fe1d2be556ae9b0d4986cb389
```

## 🌟 Key Features Explained

### 1. Real-time Air Quality Monitoring
- **Current AQI Display** - Live air quality index with color-coded categories
- **Pollutant Breakdown** - PM2.5, PM10, Ozone, NO2, SO2, CO concentrations
- **Health Recommendations** - WHO guidelines and safety advice
- **Location-based Data** - Accurate readings for specific coordinates

### 2. City Ranking System
- **Global Rankings** - Air quality comparison across cities
- **Coordinate Display** - Precise location coordinates for each city
- **Country Filtering** - Filter rankings by country
- **Real-time Updates** - Live ranking updates

### 3. Historical Data Visualization
- **Interactive Charts** - Canvas-based data visualization
- **Date Range Selection** - Custom time period analysis
- **Trend Analysis** - Air quality patterns over time
- **Export Capabilities** - Data export functionality

### 4. Notification System
- **Email Alerts** - HTML-formatted email notifications
- **Test Notifications** - Immediate confirmation after subscription
- **Real-time Updates** - WebSocket-based live alerts
- **Multi-channel Support** - Email and SMS notifications

### 5. Location Widget
- **Floating Widget** - Compact air quality display
- **Auto-update** - Automatic data refresh every 5 minutes
- **Weather Integration** - Temperature, humidity, wind speed
- **Responsive Design** - Mobile-optimized interface

## 🚀 Deployment

### Docker Deployment
```bash
# Build the container
docker build -t nasa-air-quality .

# Run the container
docker run -p 3003:3003 nasa-air-quality
```

### Docker Compose
```bash
# Start all services
docker-compose up -d
```

### Production Deployment
1. **Set environment variables** on your server
2. **Configure email service** for notifications
3. **Set up Redis** for caching (optional)
4. **Deploy using PM2** for process management

## 📊 API Endpoints

### Air Quality
- `GET /api/air-quality/current` - Current air quality data
- `GET /api/air-quality/forecast` - Air quality forecast
- `GET /api/air-quality/historical` - Historical data
- `GET /api/air-quality/ranking` - City rankings

### Weather
- `GET /api/weather/current` - Current weather data
- `GET /api/weather/forecast` - Weather forecast

### Notifications
- `POST /api/notifications/subscribe` - Subscribe to alerts
- `GET /api/notifications/subscriptions` - Get subscriptions

## 🎯 Usage Examples

### 1. Monitor Current Air Quality
```javascript
// Get air quality for specific coordinates
const response = await fetch('/api/air-quality/current?lat=40.7128&lng=-74.0060');
const data = await response.json();
console.log(`AQI: ${data.aqi} - ${data.category}`);
```

### 2. Subscribe to Alerts
```javascript
// Subscribe to air quality alerts
const subscription = await fetch('/api/notifications/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lat: 40.7128,
    lng: -74.0060,
    email: 'user@example.com',
    alertLevels: ['unhealthy', 'very-unhealthy', 'hazardous']
  })
});
```

### 3. Get City Rankings
```javascript
// Get city rankings for specific country
const rankings = await fetch('/api/air-quality/ranking?country=US');
const data = await rankings.json();
console.log(data.cities);
```

## 🔒 Security Features

- **Rate Limiting** - API request throttling
- **Input Validation** - Comprehensive data validation
- **CORS Protection** - Cross-origin request security
- **Helmet.js** - Security headers
- **JWT Authentication** - Secure user sessions

## 📱 Mobile Support

- **Responsive Design** - Mobile-first approach
- **Touch-friendly Interface** - Optimized for touch devices
- **Geolocation Support** - GPS integration
- **Offline Capabilities** - Cached data support

## 🧪 Testing

### Test Notifications
```bash
# Run notification tests
node test-notification.js
```

### API Testing
```bash
# Test API endpoints
curl http://localhost:3003/api/air-quality/current?lat=40.7128&lng=-74.0060
```

## 📈 Performance

- **Redis Caching** - Fast data retrieval
- **In-memory Fallback** - No Redis required
- **Optimized Queries** - Efficient data processing
- **CDN Ready** - Static asset optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🌟 Acknowledgments

- **NASA** - For TEMPO satellite data
- **OpenWeatherMap** - For weather data
- **WHO** - For air quality guidelines
- **Community** - For feedback and contributions

---

**Ready to monitor air quality? Start the app and breathe easier! 🌍✨**