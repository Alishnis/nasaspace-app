const TempoService = require('./tempoService');
const WeatherService = require('./weatherService');
const cacheService = require('./cacheService');

class AirQualityService {
  constructor() {
    this.tempoService = new TempoService();
    this.weatherService = new WeatherService();
    this.cache = cacheService;
  }

  async getCurrentAirQuality(lat, lng) {
    try {
      const cacheKey = `air-quality-current-${lat}-${lng}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const [tempoData, weatherData] = await Promise.all([
        this.tempoService.getData(lat, lng),
        this.weatherService.getData(lat, lng)
      ]);

      // Generate ground station data (mock for development)
      const groundData = this.generateGroundStationData(lat, lng);

      // Check if this is a known city and use exact AQI from ranking
      const knownCityAQI = this.calculateAQIForKnownCity(lat, lng, tempoData, weatherData, groundData);
      const aqi = knownCityAQI || this.calculateAQI(tempoData, weatherData, groundData);
      
      const result = {
        location: { lat, lng },
        timestamp: new Date().toISOString(),
        aqi: aqi.value,
        category: aqi.category,
        healthMessage: aqi.healthMessage,
        recommendations: aqi.recommendations,
        pollutants: {
          pm25: aqi.pm25,
          pm10: aqi.pm10,
          ozone: aqi.ozone,
          no2: aqi.no2,
          so2: aqi.so2,
          co: aqi.co
        },
        sources: {
          tempo: tempoData,
          weather: weatherData,
          ground: groundData
        }
      };

      // Cache for 15 minutes
      await this.cache.set(cacheKey, result, 900);
      
      return result;
    } catch (error) {
      console.error('Error getting current air quality:', error);
      throw error;
    }
  }

  async getAirQualityForecast(lat, lng, days = 5) {
    try {
      const cacheKey = `air-quality-forecast-${lat}-${lng}-${days}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const forecast = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        // Generate realistic forecast data with variation
        const baseVariation = Math.sin(i * 0.5) * 0.2 + 0.8; // 0.6 to 1.0
        const randomVariation = (Math.random() - 0.5) * 0.3; // -0.15 to 0.15
        const variation = Math.max(0.3, baseVariation + randomVariation);
        
        // Generate realistic pollutant values based on location and day
        const locationFactor = Math.abs(parseFloat(lat)) / 90; // 0 to 1
        const dayFactor = (i + 1) / days; // 0.2 to 1.0
        
        // More realistic pollutant ranges - much lower values
        const pollutants = {
          pm25: Math.max(2, 5 * variation * (0.4 + locationFactor * 0.6) + Math.random() * 3 * dayFactor),
          pm10: Math.max(5, 10 * variation * (0.4 + locationFactor * 0.6) + Math.random() * 5 * dayFactor),
          ozone: Math.max(10, 15 * variation * (0.5 + locationFactor * 0.5) + Math.random() * 5 * dayFactor),
          no2: Math.max(5, 10 * variation * (0.4 + locationFactor * 0.6) + Math.random() * 5 * dayFactor),
          so2: Math.max(0.5, 2 * variation * (0.3 + locationFactor * 0.7) + Math.random() * 1 * dayFactor),
          co: Math.max(0.2, 1 * variation * (0.4 + locationFactor * 0.6) + Math.random() * 0.5 * dayFactor)
        };
        
        // Calculate AQI based on pollutants
        const aqi = this.calculateAQIFromPollutants(pollutants);
        
        forecast.push({
          date: date.toISOString().split('T')[0],
          aqi: aqi.value,
          category: aqi.category,
          healthMessage: aqi.healthMessage,
          recommendations: aqi.recommendations,
          pollutants: pollutants
        });
      }

      const result = {
        location: { lat, lng },
        forecast,
        generatedAt: new Date().toISOString()
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      console.error('Error getting air quality forecast:', error);
      throw error;
    }
  }

  async getHistoricalAirQuality(lat, lng, startDate, endDate) {
    try {
      const cacheKey = `air-quality-historical-${lat}-${lng}-${startDate}-${endDate}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Implementation for historical data
      // This would typically query a database with historical measurements
      const historicalData = await this.queryHistoricalData(lat, lng, startDate, endDate);
      
      const result = {
        location: { lat, lng },
        startDate,
        endDate,
        data: historicalData,
        generatedAt: new Date().toISOString()
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      console.error('Error getting historical air quality:', error);
      throw error;
    }
  }

  async getAirQualityAlerts(lat, lng) {
    try {
      const currentAirQuality = await this.getCurrentAirQuality(lat, lng);
      const alerts = [];
      
      if (currentAirQuality.aqi >= 151) {
        alerts.push({
          type: 'unhealthy',
          level: 'high',
          message: 'Air quality is unhealthy for sensitive groups',
          recommendations: currentAirQuality.recommendations
        });
      }
      
      if (currentAirQuality.aqi >= 201) {
        alerts.push({
          type: 'very-unhealthy',
          level: 'very-high',
          message: 'Air quality is very unhealthy',
          recommendations: ['Avoid outdoor activities', 'Stay indoors with windows closed']
        });
      }
      
      if (currentAirQuality.aqi >= 301) {
        alerts.push({
          type: 'hazardous',
          level: 'extreme',
          message: 'Air quality is hazardous',
          recommendations: ['Stay indoors', 'Use air purifiers', 'Avoid all outdoor activities']
        });
      }

      return {
        location: { lat, lng },
        alerts,
        currentAQI: currentAirQuality.aqi,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting air quality alerts:', error);
      throw error;
    }
  }

  generateGroundStationData(lat, lng) {
    // Check if coordinates match known cities from ranking
    const knownCities = this.getKnownCityData(lat, lng);
    if (knownCities) {
      return knownCities.pollutants;
    }

    // Mock ground station data with more realistic values for unknown locations
    const baseVariation = Math.sin(parseFloat(lat) * 0.1) * 0.3 + 0.7;
    const randomVariation = (Math.random() - 0.5) * 0.2;
    const variation = Math.max(0.4, baseVariation + randomVariation);

    return {
      pm25: Math.max(2, 5 * variation + Math.random() * 3),
      pm10: Math.max(5, 10 * variation + Math.random() * 5),
      ozone: Math.max(10, 15 * variation + Math.random() * 5),
      no2: Math.max(5, 10 * variation + Math.random() * 5),
      so2: Math.max(0.5, 2 * variation + Math.random() * 1),
      co: Math.max(0.2, 1 * variation + Math.random() * 0.5)
    };
  }

  // Override AQI calculation for known cities
  calculateAQIForKnownCity(lat, lng, tempoData, weatherData, groundData) {
    const knownCities = this.getKnownCityData(lat, lng);
    if (knownCities) {
      // Return the exact AQI from ranking for known cities
      const category = this.getAQICategory(knownCities.aqi);
      return {
        value: knownCities.aqi,
        category: category.name,
        healthMessage: category.healthMessage,
        recommendations: category.recommendations,
        pm25: knownCities.pollutants.pm25,
        pm10: knownCities.pollutants.pm10,
        ozone: knownCities.pollutants.ozone,
        no2: knownCities.pollutants.no2,
        so2: knownCities.pollutants.so2,
        co: knownCities.pollutants.co
      };
    }
    return null;
  }

  getKnownCityData(lat, lng) {
    // Known cities with their exact coordinates and AQI data
    const knownCities = {
      // Delhi, India (28.7041°N, 77.1025°E) - AQI 298
      '28.7041,77.1025': {
        name: 'Delhi, Delhi',
        aqi: 298,
        pollutants: {
          pm25: 120, // Very high PM2.5 for Delhi
          pm10: 180, // Very high PM10
          ozone: 45,
          no2: 85,
          so2: 25,
          co: 8
        }
      },
      // Mumbai, India (19.0760°N, 72.8777°E) - AQI 187
      '19.0760,72.8777': {
        name: 'Mumbai, Maharashtra',
        aqi: 187,
        pollutants: {
          pm25: 75,
          pm10: 120,
          ozone: 35,
          no2: 65,
          so2: 18,
          co: 5
        }
      },
      // Beijing, China (39.9042°N, 116.4074°E) - AQI 234
      '39.9042,116.4074': {
        name: 'Beijing, Beijing',
        aqi: 234,
        pollutants: {
          pm25: 95,
          pm10: 150,
          ozone: 40,
          no2: 70,
          so2: 20,
          co: 6
        }
      },
      // Los Angeles, USA (34.0522°N, 118.2437°W) - AQI 167
      '34.0522,-118.2437': {
        name: 'Los Angeles, CA',
        aqi: 167,
        pollutants: {
          pm25: 60,
          pm10: 90,
          ozone: 55,
          no2: 45,
          so2: 12,
          co: 4
        }
      },
      // Moscow, Russia (55.7558°N, 37.6176°E) - AQI 145
      '55.7558,37.6176': {
        name: 'Moscow, Moscow',
        aqi: 145,
        pollutants: {
          pm25: 50,
          pm10: 75,
          ozone: 30,
          no2: 40,
          so2: 15,
          co: 3
        }
      }
    };

    // Round coordinates to 4 decimal places for matching
    const latRounded = parseFloat(lat).toFixed(4);
    const lngRounded = parseFloat(lng).toFixed(4);
    const key = `${latRounded},${lngRounded}`;
    
    return knownCities[key] || null;
  }

  calculateAQI(tempoData, weatherData, groundData) {
    // Simplified AQI calculation
    // In a real implementation, this would use EPA standards
    
    const pm25 = this.getPollutantValue(tempoData, weatherData, groundData, 'pm25');
    const pm10 = this.getPollutantValue(tempoData, weatherData, groundData, 'pm10');
    const ozone = this.getPollutantValue(tempoData, weatherData, groundData, 'ozone');
    const no2 = this.getPollutantValue(tempoData, weatherData, groundData, 'no2');
    const so2 = this.getPollutantValue(tempoData, weatherData, groundData, 'so2');
    const co = this.getPollutantValue(tempoData, weatherData, groundData, 'co');

    // Calculate AQI based on the highest pollutant
    const aqiValues = [
      this.calculatePollutantAQI(pm25, 'pm25'),
      this.calculatePollutantAQI(pm10, 'pm10'),
      this.calculatePollutantAQI(ozone, 'ozone'),
      this.calculatePollutantAQI(no2, 'no2'),
      this.calculatePollutantAQI(so2, 'so2'),
      this.calculatePollutantAQI(co, 'co')
    ];

    const maxAQI = Math.max(...aqiValues);
    const category = this.getAQICategory(maxAQI);

    return {
      value: maxAQI,
      category: category.name,
      healthMessage: category.healthMessage,
      recommendations: category.recommendations,
      pm25,
      pm10,
      ozone,
      no2,
      so2,
      co
    };
  }

  calculateAQIFromPollutants(pollutants) {
    // Calculate AQI based on pollutant concentrations
    const aqiValues = [
      this.calculatePollutantAQI(pollutants.pm25, 'pm25'),
      this.calculatePollutantAQI(pollutants.pm10, 'pm10'),
      this.calculatePollutantAQI(pollutants.ozone, 'ozone'),
      this.calculatePollutantAQI(pollutants.no2, 'no2'),
      this.calculatePollutantAQI(pollutants.so2, 'so2'),
      this.calculatePollutantAQI(pollutants.co, 'co')
    ];

    const maxAQI = Math.max(...aqiValues);
    const category = this.getAQICategory(maxAQI);

    // Debug logging
    console.log('Pollutant AQI values:', {
      pm25: aqiValues[0],
      pm10: aqiValues[1], 
      ozone: aqiValues[2],
      no2: aqiValues[3],
      so2: aqiValues[4],
      co: aqiValues[5],
      maxAQI: maxAQI
    });

    return {
      value: maxAQI,
      category: category.name,
      healthMessage: category.healthMessage,
      recommendations: category.recommendations
    };
  }

  getPollutantValue(tempoData, weatherData, groundData, pollutant) {
    // Priority: ground data > TEMPO data > weather data
    if (groundData && groundData[pollutant]) {
      return groundData[pollutant];
    }
    if (tempoData && tempoData[pollutant]) {
      return tempoData[pollutant];
    }
    if (weatherData && weatherData[pollutant]) {
      return weatherData[pollutant];
    }
    return null;
  }

  calculatePollutantAQI(concentration, pollutant) {
    if (!concentration) return 0;
    
    // Simplified AQI calculation for demonstration
    // In production, use EPA's official AQI calculation
    const thresholds = {
      pm25: [12, 35.4, 55.4, 150.4, 250.4, 350.4, 500.4],
      pm10: [54, 154, 254, 354, 424, 504, 604],
      ozone: [54, 70, 85, 105, 200, 400, 500],
      no2: [53, 100, 360, 649, 1249, 1649, 2049],
      so2: [35, 75, 185, 304, 604, 804, 1004],
      co: [4.4, 9.4, 12.4, 15.4, 30.4, 40.4, 50.4]
    };

    const aqiBreakpoints = [0, 51, 101, 151, 201, 301, 401, 501];
    const pollutantThresholds = thresholds[pollutant] || thresholds.pm25;

    for (let i = 0; i < pollutantThresholds.length; i++) {
      if (concentration <= pollutantThresholds[i]) {
        const lowBreakpoint = aqiBreakpoints[i];
        const highBreakpoint = aqiBreakpoints[i + 1];
        const lowConcentration = i === 0 ? 0 : pollutantThresholds[i - 1];
        const highConcentration = pollutantThresholds[i];

        const aqi = ((highBreakpoint - lowBreakpoint) / (highConcentration - lowConcentration)) * 
                    (concentration - lowConcentration) + lowBreakpoint;
        
        return Math.round(aqi);
      }
    }

    return 500; // Hazardous
  }

  getAQICategory(aqi) {
    if (aqi <= 50) {
      return {
        name: 'Good',
        healthMessage: 'Air quality is satisfactory, and air pollution poses little or no risk.',
        recommendations: ['Enjoy outdoor activities', 'Good day for outdoor exercise']
      };
    } else if (aqi <= 100) {
      return {
        name: 'Moderate',
        healthMessage: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
        recommendations: ['Sensitive individuals should consider reducing prolonged outdoor exertion', 'Good day for most outdoor activities']
      };
    } else if (aqi <= 150) {
      return {
        name: 'Unhealthy for Sensitive Groups',
        healthMessage: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
        recommendations: ['Sensitive individuals should avoid prolonged outdoor exertion', 'Everyone else should limit prolonged outdoor exertion']
      };
    } else if (aqi <= 200) {
      return {
        name: 'Unhealthy',
        healthMessage: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
        recommendations: ['Sensitive individuals should avoid all outdoor exertion', 'Everyone else should avoid prolonged outdoor exertion']
      };
    } else if (aqi <= 300) {
      return {
        name: 'Very Unhealthy',
        healthMessage: 'Health alert: The risk of health effects is increased for everyone.',
        recommendations: ['Everyone should avoid outdoor exertion', 'Sensitive individuals should remain indoors']
      };
    } else {
      return {
        name: 'Hazardous',
        healthMessage: 'Health warning of emergency conditions: everyone is more likely to be affected.',
        recommendations: ['Everyone should avoid all outdoor activities', 'Remain indoors with windows closed']
      };
    }
  }

  async queryHistoricalData(lat, lng, startDate, endDate) {
    // Mock historical data for development
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      data.push({
        date: d.toISOString().split('T')[0],
        aqi: Math.floor(Math.random() * 200) + 50,
        pm25: Math.random() * 50,
        pm10: Math.random() * 100,
        ozone: Math.random() * 100,
        no2: Math.random() * 80,
        so2: Math.random() * 20,
        co: Math.random() * 10
      });
    }
    
    return data;
  }

  async getCityRanking(country) {
    // Mock city ranking data with coordinates
    const cityData = {
      'US': [
        { name: 'Los Angeles, CA (34.0522°N, 118.2437°W)', aqi: 167 },
        { name: 'New York, NY (40.7128°N, 74.0060°W)', aqi: 71 },
        { name: 'Chicago, IL (41.8781°N, 87.6298°W)', aqi: 34 },
        { name: 'Houston, TX (29.7604°N, 95.3698°W)', aqi: 17 },
        { name: 'Phoenix, AZ (33.4484°N, 112.0740°W)', aqi: 13 }
      ],
      'KZ': [
        { name: 'Karaganda, Karaganda (49.8014°N, 73.1021°E)', aqi: 167 },
        { name: 'Almaty, Almaty Oblysy (43.2220°N, 76.8512°E)', aqi: 71 },
        { name: 'Oskemen, East Kazakhstan (49.9561°N, 82.6144°E)', aqi: 34 },
        { name: 'Astana, Astana (51.1694°N, 71.4491°E)', aqi: 17 },
        { name: 'Pavlodar, Pavlodar (52.2871°N, 76.9669°E)', aqi: 13 }
      ],
      'RU': [
        { name: 'Moscow, Moscow (55.7558°N, 37.6176°E)', aqi: 145 },
        { name: 'Saint Petersburg, Leningrad (59.9311°N, 30.3609°E)', aqi: 89 },
        { name: 'Novosibirsk, Novosibirsk (55.0084°N, 82.9357°E)', aqi: 42 },
        { name: 'Yekaterinburg, Sverdlovsk (56.8431°N, 60.6454°E)', aqi: 28 },
        { name: 'Kazan, Tatarstan (55.8304°N, 49.0661°E)', aqi: 19 }
      ],
      'CN': [
        { name: 'Beijing, Beijing (39.9042°N, 116.4074°E)', aqi: 234 },
        { name: 'Shanghai, Shanghai (31.2304°N, 121.4737°E)', aqi: 156 },
        { name: 'Guangzhou, Guangdong (23.1291°N, 113.2644°E)', aqi: 98 },
        { name: 'Shenzhen, Guangdong (22.5431°N, 114.0579°E)', aqi: 67 },
        { name: 'Chengdu, Sichuan (30.5728°N, 104.0668°E)', aqi: 45 }
      ],
      'IN': [
        { name: 'Delhi, Delhi (28.7041°N, 77.1025°E)', aqi: 298 },
        { name: 'Mumbai, Maharashtra (19.0760°N, 72.8777°E)', aqi: 187 },
        { name: 'Kolkata, West Bengal (22.5726°N, 88.3639°E)', aqi: 134 },
        { name: 'Chennai, Tamil Nadu (13.0827°N, 80.2707°E)', aqi: 89 },
        { name: 'Bangalore, Karnataka (12.9716°N, 77.5946°E)', aqi: 56 }
      ],
      'DE': [
        { name: 'Berlin, Berlin (52.5200°N, 13.4050°E)', aqi: 45 },
        { name: 'Munich, Bavaria (48.1351°N, 11.5820°E)', aqi: 32 },
        { name: 'Hamburg, Hamburg (53.5511°N, 9.9937°E)', aqi: 28 },
        { name: 'Cologne, North Rhine-Westphalia (50.9375°N, 6.9603°E)', aqi: 23 },
        { name: 'Frankfurt, Hesse (50.1109°N, 8.6821°E)', aqi: 19 }
      ],
      'FR': [
        { name: 'Paris, Île-de-France (48.8566°N, 2.3522°E)', aqi: 67 },
        { name: 'Lyon, Auvergne-Rhône-Alpes (45.7640°N, 4.8357°E)', aqi: 43 },
        { name: 'Marseille, Provence-Alpes-Côte d\'Azur (43.2965°N, 5.3698°E)', aqi: 38 },
        { name: 'Toulouse, Occitanie (43.6047°N, 1.4442°E)', aqi: 29 },
        { name: 'Nice, Provence-Alpes-Côte d\'Azur (43.7102°N, 7.2620°E)', aqi: 24 }
      ],
      'GB': [
        { name: 'London, England (51.5074°N, 0.1278°W)', aqi: 78 },
        { name: 'Birmingham, England (52.4862°N, 1.8904°W)', aqi: 54 },
        { name: 'Manchester, England (53.4808°N, 2.2426°W)', aqi: 41 },
        { name: 'Glasgow, Scotland (55.8642°N, 4.2518°W)', aqi: 35 },
        { name: 'Edinburgh, Scotland (55.9533°N, 3.1883°W)', aqi: 28 }
      ]
    };

    const cities = cityData[country] || cityData['US'];
    const countryNames = {
      'US': 'United States',
      'KZ': 'Kazakhstan', 
      'RU': 'Russia',
      'CN': 'China',
      'IN': 'India',
      'DE': 'Germany',
      'FR': 'France',
      'GB': 'United Kingdom'
    };

    return {
      country: countryNames[country] || 'United States',
      cities: cities.sort((a, b) => b.aqi - a.aqi), // Sort by AQI descending (worst first)
      updated: new Date().toISOString()
    };
  }
}

module.exports = AirQualityService;
