const express = require('express');
const router = express.Router();
const WeatherService = require('../services/weatherService');
const { validateLocation } = require('../middleware/validation');

const weatherService = new WeatherService();

// Get current weather data
router.get('/current', validateLocation, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const weather = await weatherService.getData(lat, lng);
    res.json(weather);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get weather forecast
router.get('/forecast', validateLocation, async (req, res) => {
  try {
    const { lat, lng, days = 5 } = req.query;
    const forecast = await weatherService.getForecast(lat, lng, parseInt(days));
    res.json(forecast);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

// Get historical weather data
router.get('/historical', validateLocation, async (req, res) => {
  try {
    const { lat, lng, startDate, endDate } = req.query;
    const historical = await weatherService.getHistoricalData(lat, lng, startDate, endDate);
    res.json(historical);
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    res.status(500).json({ error: 'Failed to fetch historical weather data' });
  }
});

module.exports = router;
