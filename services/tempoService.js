const axios = require('axios');
const cacheService = require('./cacheService');

class TempoService {
  constructor() {
    this.baseURL = process.env.TEMPO_API_URL || 'https://api.nasa.gov/tempo';
    this.apiKey = process.env.TEMPO_API_KEY || 'DEMO_KEY';
    this.cache = cacheService;
  }

  async getData(lat, lng) {
    try {
      const cacheKey = `tempo-data-${lat}-${lng}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // For development, use mock data
      const mockData = this.getMockTempoData(lat, lng);
      
      // Cache for 1 hour
      await this.cache.set(cacheKey, mockData, 3600);
      
      return mockData;
    } catch (error) {
      console.error('Error fetching TEMPO data:', error);
      throw error;
    }
  }

  async getDataForDate(lat, lng, date) {
    try {
      const cacheKey = `tempo-data-${lat}-${lng}-${date}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // For development, use mock data
      const mockData = this.getMockTempoData(lat, lng, date);
      
      // Cache for 1 hour
      await this.cache.set(cacheKey, mockData, 3600);
      
      return mockData;
    } catch (error) {
      console.error('Error fetching TEMPO data for date:', error);
      throw error;
    }
  }

  async getCoverage(lat, lng) {
    try {
      const cacheKey = `tempo-coverage-${lat}-${lng}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Mock coverage data
      const coverage = {
        location: { lat, lng },
        coverage: 'excellent',
        dataQuality: 'high',
        spatialResolution: '2.5km x 2.5km',
        temporalResolution: '1 hour',
        lastUpdated: new Date().toISOString()
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, coverage, 3600);
      
      return coverage;
    } catch (error) {
      console.error('Error fetching TEMPO coverage:', error);
      throw error;
    }
  }

  getMockTempoData(lat, lng, date = null) {
    // Generate realistic mock data based on location
    const locationFactor = Math.abs(parseFloat(lat)) / 90;
    const timeFactor = date ? new Date(date).getTime() / Date.now() : 1;
    
    const baseVariation = Math.sin(locationFactor * Math.PI) * 0.3 + 0.7;
    const randomVariation = (Math.random() - 0.5) * 0.4;
    const variation = Math.max(0.1, baseVariation + randomVariation);

    return {
      location: { lat, lng },
      timestamp: new Date().toISOString(),
      source: 'NASA TEMPO',
      coverage: 'excellent',
      dataQuality: 'high',
      measurements: {
        no2: {
          value: 20 * variation + Math.random() * 15,
          unit: 'ppb',
          confidence: 0.85
        },
        ozone: {
          value: 30 * variation + Math.random() * 20,
          unit: 'ppb',
          confidence: 0.82
        },
        hcho: {
          value: 8 * variation + Math.random() * 5,
          unit: 'ppb',
          confidence: 0.78
        },
        aod: {
          value: 0.3 * variation + Math.random() * 0.4,
          unit: 'dimensionless',
          confidence: 0.90
        }
      },
      derivedPollutants: {
        pm25: {
          value: 15 * variation + Math.random() * 10,
          unit: 'μg/m³',
          confidence: 0.72
        },
        pm10: {
          value: 25 * variation + Math.random() * 15,
          unit: 'μg/m³',
          confidence: 0.72
        }
      },
      spatialResolution: '2.5km x 2.5km',
      temporalResolution: '1 hour',
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = TempoService;
