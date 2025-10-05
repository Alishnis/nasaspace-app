const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');
const { validateLocation } = require('../middleware/validation');

// Subscribe to air quality notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { lat, lng, email, phone, alertLevels } = req.body;
    
    // Validate coordinates
    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ 
        error: 'Latitude and longitude must be valid numbers' 
      });
    }
    const subscription = await NotificationService.subscribeToAlerts({
      lat: latitude, lng: longitude, email, phone, alertLevels
    });
    res.json(subscription);
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    res.status(500).json({ error: 'Failed to subscribe to notifications' });
  }
});

// Unsubscribe from notifications
router.delete('/unsubscribe/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    await NotificationService.unsubscribeFromAlerts(subscriptionId);
    res.json({ message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from notifications' });
  }
});

// Get notification preferences
router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = await NotificationService.getNotificationPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update notification preferences
router.put('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    const updated = await NotificationService.updateNotificationPreferences(userId, preferences);
    res.json(updated);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Send test notification
router.post('/test', async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    const result = await NotificationService.sendTestNotification(userId, type, message);
    res.json(result);
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

module.exports = router;
