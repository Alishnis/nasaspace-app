const axios = require('axios');
const cacheService = require('./cacheService');

class WeatherService {
  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.apiKey = process.env.WEATHER_API_KEY || 'your-api-key';
    this.cache = cacheService;
  }

  async getData(lat, lng) {
    try {
      const cacheKey = `weather-data-${lat}-${lng}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // For development, always use mock data
      console.log('Using mock weather data for development');
      const mockData = this.getMockWeatherData(lat, lng);
      
      // Cache for 30 minutes
      await this.cache.set(cacheKey, mockData, 1800);
      
      return mockData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  async getForecast(lat, lng, days = 5) {
    try {
      const cacheKey = `weather-forecast-${lat}-${lng}-${days}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // For development, always use mock data
      console.log('Using mock weather forecast for development');
      const mockData = this.getMockWeatherForecast(lat, lng, days);
      
      // Cache for 1 hour
      await this.cache.set(cacheKey, mockData, 3600);
      
      return mockData;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw error;
    }
  }

  async getHistoricalData(lat, lng, startDate, endDate) {
    try {
      const cacheKey = `weather-historical-${lat}-${lng}-${startDate}-${endDate}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Mock historical weather data
      const historicalData = this.getMockHistoricalWeather(lat, lng, startDate, endDate);
      
      // Cache for 1 hour
      await this.cache.set(cacheKey, historicalData, 3600);
      
      return historicalData;
    } catch (error) {
      console.error('Error fetching historical weather:', error);
      throw error;
    }
  }

  getMockWeatherData(lat, lng) {
    const locationFactor = Math.abs(parseFloat(lat)) / 90;
    const randomVariation = (Math.random() - 0.5) * 0.3;
    const variation = Math.max(0.1, locationFactor + randomVariation);

    return {
      location: { lat, lng },
      timestamp: new Date().toISOString(),
      temperature: 20 + (variation - 0.5) * 30 + Math.random() * 10,
      feelsLike: 18 + (variation - 0.5) * 25 + Math.random() * 8,
      humidity: 40 + variation * 40 + Math.random() * 20,
      pressure: 1013 + (variation - 0.5) * 20 + Math.random() * 10,
      windSpeed: 5 + variation * 15 + Math.random() * 10,
      windDirection: Math.random() * 360,
      visibility: 10000 + variation * 5000 + Math.random() * 5000,
      uvIndex: Math.random() * 10,
      weather: {
        main: this.getRandomWeatherCondition(),
        description: this.getRandomWeatherDescription(),
        icon: '01d'
      },
      clouds: Math.random() * 100,
      rain: Math.random() * 5,
      snow: Math.random() * 2,
      airQuality: 50 + variation * 100 + Math.random() * 50
    };
  }

  getMockWeatherForecast(lat, lng, days) {
    const forecast = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayVariation = Math.sin(i * 0.5) * 0.3 + 0.7;
      const randomVariation = (Math.random() - 0.5) * 0.4;
      const variation = Math.max(0.1, dayVariation + randomVariation);

      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: 15 + variation * 10 + Math.random() * 5,
          max: 25 + variation * 15 + Math.random() * 10
        },
        humidity: 40 + variation * 40 + Math.random() * 20,
        windSpeed: 5 + variation * 15 + Math.random() * 10,
        weather: {
          main: this.getRandomWeatherCondition(),
          description: this.getRandomWeatherDescription(),
          icon: '01d'
        },
        precipitation: Math.random() * 10,
        uvIndex: Math.random() * 10
      });
    }

    return {
      location: { lat, lng },
      forecast,
      generatedAt: new Date().toISOString()
    };
  }

  getMockHistoricalWeather(lat, lng, startDate, endDate) {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      data.push({
        date: d.toISOString().split('T')[0],
        temperature: 20 + Math.random() * 20,
        humidity: 40 + Math.random() * 40,
        windSpeed: 5 + Math.random() * 15,
        precipitation: Math.random() * 10,
        weather: this.getRandomWeatherCondition()
      });
    }
    
    return {
      location: { lat, lng },
      startDate,
      endDate,
      data,
      generatedAt: new Date().toISOString()
    };
  }

  getRandomWeatherCondition() {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm', 'Drizzle', 'Mist', 'Fog'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  getRandomWeatherDescription() {
    const descriptions = [
      'clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'overcast clouds',
      'light rain', 'moderate rain', 'heavy rain', 'thunderstorm', 'snow',
      'mist', 'fog', 'haze', 'dust', 'smoke'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
}

module.exports = WeatherService;
