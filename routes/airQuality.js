const express = require('express');
const router = express.Router();
const AirQualityService = require('../services/airQualityService');
const { validateLocation } = require('../middleware/validation');

const airQualityService = new AirQualityService();

// Get current air quality for a location
router.get('/current', validateLocation, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const airQuality = await airQualityService.getCurrentAirQuality(lat, lng);
    res.json(airQuality);
  } catch (error) {
    console.error('Error fetching current air quality:', error);
    res.status(500).json({ error: 'Failed to fetch air quality data' });
  }
});

// Get air quality forecast
router.get('/forecast', validateLocation, async (req, res) => {
  try {
    const { lat, lng, days = 5 } = req.query;
    const forecast = await airQualityService.getAirQualityForecast(lat, lng, parseInt(days));
    res.json(forecast);
  } catch (error) {
    console.error('Error fetching air quality forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Get historical air quality data
router.get('/historical', validateLocation, async (req, res) => {
  try {
    const { lat, lng, startDate, endDate } = req.query;
    const historical = await airQualityService.getHistoricalAirQuality(lat, lng, startDate, endDate);
    res.json(historical);
  } catch (error) {
    console.error('Error fetching historical air quality:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get air quality alerts for a location
router.get('/alerts', validateLocation, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const alerts = await airQualityService.getAirQualityAlerts(lat, lng);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching air quality alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alert data' });
  }
});

// Get city ranking
router.get('/ranking', async (req, res) => {
  try {
    const { country } = req.query;
    const data = await airQualityService.getCityRanking(country || 'US');
    res.json(data);
  } catch (error) {
    console.error('Error fetching city ranking:', error);
    res.status(500).json({ error: 'Failed to fetch city ranking' });
  }
});

module.exports = router;
