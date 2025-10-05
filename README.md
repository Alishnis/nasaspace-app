# 🌍 NASA TEMPO Air Quality Monitor

A real-time air quality monitoring application using NASA TEMPO (Tropospheric Emissions: Monitoring of Pollution) data, ground-based measurements, and weather data to provide accurate air quality forecasts and timely notifications.

## 🚀 Features

- **Real-time Air Quality Monitoring**: Get current air quality data for any location
- **5-Day Forecast**: Plan ahead with accurate air quality predictions
- **Smart Notifications**: Subscribe to alerts for poor air quality conditions
- **Multiple Data Sources**: NASA TEMPO satellite data, weather data, and ground stations
- **Interactive Maps**: Visualize air quality data on interactive maps
- **User Accounts**: Personalized experience with user accounts
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database (optional)
- **Redis** - Caching (optional)
- **JWT** - Authentication
- **Nodemailer** - Email notifications

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern features
- **JavaScript (ES6+)** - Client-side logic
- **Socket.io Client** - Real-time updates
- **Leaflet** - Interactive maps (optional)

### APIs
- **NASA TEMPO** - Satellite air quality data
- **OpenWeatherMap** - Weather data
- **Ground Stations** - Local air quality measurements

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nasa-tempo-air-quality-monitor.git
   cd nasa-tempo-air-quality-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start the application**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3001
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# API Keys (Optional for development)
TEMPO_API_KEY=your-nasa-tempo-api-key
WEATHER_API_KEY=your-openweathermap-api-key

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Database (Optional)
MONGODB_URI=mongodb://localhost:27017/nasa-tempo-air-quality
REDIS_HOST=localhost
REDIS_PORT=6379
```

### API Keys

For production use, you'll need:

1. **NASA TEMPO API Key**
   - Visit [NASA API Portal](https://api.nasa.gov/)
   - Register for a free API key
   - Add to `TEMPO_API_KEY` in `.env`

2. **OpenWeatherMap API Key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Register for a free API key
   - Add to `WEATHER_API_KEY` in `.env`

## 🚀 Usage

### Web Interface

1. **Monitor**: Enter coordinates to get current air quality
2. **Forecast**: Get 5-day air quality predictions
3. **Alerts**: Subscribe to notifications for poor air quality
4. **Login**: Create an account for personalized features

### API Endpoints

#### Air Quality
- `GET /api/air-quality/current?lat=40.7128&lng=-74.0060` - Current air quality
- `GET /api/air-quality/forecast?lat=40.7128&lng=-74.0060&days=5` - Forecast
- `GET /api/air-quality/historical?lat=40.7128&lng=-74.0060&startDate=2024-01-01&endDate=2024-01-31` - Historical data

#### TEMPO Data
- `GET /api/tempo/data?lat=40.7128&lng=-74.0060` - TEMPO satellite data
- `GET /api/tempo/coverage?lat=40.7128&lng=-74.0060` - Coverage information

#### Weather
- `GET /api/weather/current?lat=40.7128&lng=-74.0060` - Current weather
- `GET /api/weather/forecast?lat=40.7128&lng=-74.0060&days=5` - Weather forecast

#### Notifications
- `POST /api/notifications/subscribe` - Subscribe to alerts
- `DELETE /api/notifications/unsubscribe/:id` - Unsubscribe from alerts

#### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile

## 🧪 Development

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Docker Support
```bash
# Build Docker image
docker build -t nasa-tempo-air-quality .

# Run with Docker Compose
docker-compose up
```

## 📊 Data Sources

### NASA TEMPO
- **NO2** (Nitrogen Dioxide)
- **O3** (Ozone)
- **HCHO** (Formaldehyde)
- **AOD** (Aerosol Optical Depth)

### Weather Data
- Temperature, humidity, pressure
- Wind speed and direction
- Precipitation
- UV index

### Ground Stations
- PM2.5, PM10
- Ozone, NO2, SO2, CO
- Real-time measurements

## 🔔 Notifications

### Alert Levels
- **Unhealthy** (AQI 151-200)
- **Very Unhealthy** (AQI 201-300)
- **Hazardous** (AQI 301+)

### Notification Types
- **Email**: HTML formatted notifications
- **SMS**: Text message alerts (requires Twilio)
- **Push**: Browser notifications
- **Real-time**: WebSocket updates

## 🌐 Deployment

### Production Deployment

1. **Set up environment variables**
2. **Configure database connections**
3. **Set up email service**
4. **Configure reverse proxy (nginx)**
5. **Set up SSL certificates**
6. **Configure monitoring and logging**

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment
- **Heroku**: Easy deployment with git
- **AWS**: EC2, ECS, or Lambda
- **Google Cloud**: App Engine or Cloud Run
- **Azure**: App Service or Container Instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for providing TEMPO satellite data
- **OpenWeatherMap** for weather data
- **OpenStreetMap** for map tiles
- **NASA Space Apps Challenge** for the inspiration

## 📞 Support

For support, email support@nasatempo-airquality.com or create an issue on GitHub.

## 🔮 Future Enhancements

- [ ] Machine learning predictions
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with more data sources
- [ ] Offline support
- [ ] Multi-language support
- [ ] Advanced mapping features
- [ ] Social sharing
- [ ] Historical trend analysis

---

**Built for NASA Space Apps Challenge 2024** 🚀

*Real-time air quality monitoring for a healthier planet.*
