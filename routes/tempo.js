const express = require('express');
const router = express.Router();
const TempoService = require('../services/tempoService');
const { validateLocation } = require('../middleware/validation');

const tempoService = new TempoService();

// Get TEMPO data for a location
router.get('/data', validateLocation, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const tempoData = await tempoService.getData(lat, lng);
    res.json(tempoData);
  } catch (error) {
    console.error('Error fetching TEMPO data:', error);
    res.status(500).json({ error: 'Failed to fetch TEMPO data' });
  }
});

// Get TEMPO data for a specific date
router.get('/data/:date', validateLocation, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const { date } = req.params;
    const tempoData = await tempoService.getDataForDate(lat, lng, date);
    res.json(tempoData);
  } catch (error) {
    console.error('Error fetching TEMPO data for date:', error);
    res.status(500).json({ error: 'Failed to fetch TEMPO data for date' });
  }
});

// Get TEMPO coverage information
router.get('/coverage', validateLocation, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const coverage = await tempoService.getCoverage(lat, lng);
    res.json(coverage);
  } catch (error) {
    console.error('Error fetching TEMPO coverage:', error);
    res.status(500).json({ error: 'Failed to fetch TEMPO coverage' });
  }
});

module.exports = router;
