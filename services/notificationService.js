const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
    this.subscriptions = new Map(); // In production, use a database
  }

  createEmailTransporter() {
    // For development, use mock transporter
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Using mock email transporter for development');
      return {
        sendMail: async (options) => {
          console.log('Mock email sent:', options);
          return { messageId: 'mock-' + Date.now() };
        }
      };
    }
    
    // Production email configuration
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT || 587;
    
    let transporterConfig;
    
    if (emailHost) {
      // Custom SMTP server
      transporterConfig = {
        host: emailHost,
        port: parseInt(emailPort),
        secure: emailPort === '465', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    } else {
      // Use predefined service (gmail, outlook, yahoo, etc.)
      transporterConfig = {
        service: emailService,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    }
    
    console.log(`Using ${emailService} email service for production`);
    return nodemailer.createTransport(transporterConfig);
  }

  async subscribeToAlerts({ lat, lng, email, phone, alertLevels = ['unhealthy', 'very-unhealthy', 'hazardous'] }) {
    try {
      const subscriptionId = this.generateSubscriptionId();
      
      const subscription = {
        id: subscriptionId,
        location: { lat, lng },
        email,
        phone,
        alertLevels,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      this.subscriptions.set(subscriptionId, subscription);
      
      // Send test notification immediately after subscription
      await this.sendTestNotificationAfterSubscription(subscription);
      
      return {
        subscriptionId,
        message: 'Successfully subscribed to air quality alerts. Test notification sent!',
        subscription
      };
    } catch (error) {
      console.error('Error subscribing to alerts:', error);
      throw error;
    }
  }

  async unsubscribeFromAlerts(subscriptionId) {
    try {
      if (this.subscriptions.has(subscriptionId)) {
        this.subscriptions.delete(subscriptionId);
        return { message: 'Successfully unsubscribed from alerts' };
      } else {
        throw new Error('Subscription not found');
      }
    } catch (error) {
      console.error('Error unsubscribing from alerts:', error);
      throw error;
    }
  }

  async getNotificationPreferences(userId) {
    try {
      // Mock implementation - in production, query database
      return {
        userId,
        email: true,
        sms: false,
        push: true,
        alertLevels: ['unhealthy', 'very-unhealthy', 'hazardous'],
        frequency: 'immediate'
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  async updateNotificationPreferences(userId, preferences) {
    try {
      // Mock implementation - in production, update database
      return {
        userId,
        ...preferences,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  async sendTestNotification(userId, type, message) {
    try {
      const testMessage = {
        title: 'Test Notification',
        message: message || 'This is a test notification from NASA TEMPO Air Quality Monitor',
        timestamp: new Date().toISOString()
      };

      switch (type) {
        case 'email':
          await this.sendEmailNotification(userId, testMessage);
          break;
        case 'sms':
          await this.sendSMSNotification(userId, testMessage);
          break;
        case 'push':
          await this.sendPushNotification(userId, testMessage);
          break;
        default:
          throw new Error('Invalid notification type');
      }

      return { message: 'Test notification sent successfully' };
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  async sendTestNotificationAfterSubscription(subscription) {
    try {
      // Get real air quality data for the subscription location
      const airQualityService = require('./airQualityService');
      let realAirQuality;
      
      try {
        realAirQuality = await airQualityService.getCurrentAirQuality(
          subscription.location.lat, 
          subscription.location.lng
        );
      } catch (error) {
        console.log('Could not fetch real air quality data, using mock data');
        // Fallback to mock data if real data is not available
        realAirQuality = {
          aqi: 45,
          category: 'Good'
        };
      }

      const testMessage = {
        title: '🎉 Welcome to NASA TEMPO Air Quality Alerts!',
        message: `Thank you for subscribing to air quality alerts for location ${subscription.location.lat.toFixed(4)}, ${subscription.location.lng.toFixed(4)}. You will receive notifications when air quality reaches the following levels: ${subscription.alertLevels.join(', ')}.`,
        aqi: realAirQuality.aqi,
        category: realAirQuality.category,
        recommendations: [
          'This is a test notification to confirm your subscription is working',
          'You will receive real alerts when air quality changes in your area',
          'Check your email settings to ensure notifications are not going to spam'
        ],
        timestamp: new Date().toISOString()
      };

      // Send email test notification if email is provided
      if (subscription.email) {
        await this.sendEmailNotification(subscription.email, testMessage);
        console.log(`✅ Test email sent to ${subscription.email}`);
      }

      // Send SMS test notification if phone is provided
      if (subscription.phone) {
        await this.sendSMSNotification(subscription.phone, testMessage);
        console.log(`✅ Test SMS sent to ${subscription.phone}`);
      }

      return { message: 'Test notification sent successfully' };
    } catch (error) {
      console.error('Error sending test notification after subscription:', error);
      // Don't throw error to avoid breaking the subscription process
      console.log('Test notification failed, but subscription was successful');
    }
  }

  async checkAndSendAlerts(location, airQualityData) {
    try {
      const { lat, lng } = location;
      
      // Find subscriptions for this location
      const relevantSubscriptions = Array.from(this.subscriptions.values())
        .filter(sub => 
          sub.isActive && 
          Math.abs(sub.location.lat - lat) < 0.1 && 
          Math.abs(sub.location.lng - lng) < 0.1
        );

      for (const subscription of relevantSubscriptions) {
        const shouldAlert = this.shouldSendAlert(subscription, airQualityData);
        
        if (shouldAlert) {
          await this.sendAirQualityAlert(subscription, airQualityData);
        }
      }

      // Send real-time updates via WebSocket
      this.sendRealtimeUpdate(location, airQualityData);

    } catch (error) {
      console.error('Error checking and sending alerts:', error);
    }
  }

  async sendAirQualityAlert(subscription, airQualityData) {
    try {
      const alertMessage = {
        title: `Air Quality Alert: ${airQualityData.category}`,
        message: this.generateAlertMessage(airQualityData),
        aqi: airQualityData.aqi,
        category: airQualityData.category,
        recommendations: airQualityData.recommendations,
        timestamp: new Date().toISOString()
      };

      // Send email notification
      if (subscription.email) {
        await this.sendEmailNotification(subscription.email, alertMessage);
      }

      // Send SMS notification
      if (subscription.phone) {
        await this.sendSMSNotification(subscription.phone, alertMessage);
      }

    } catch (error) {
      console.error('Error sending air quality alert:', error);
    }
  }

  async sendEmailNotification(email, message) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@nasatempo.com',
        to: email,
        subject: message.title,
        html: this.generateEmailHTML(message)
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Email notification sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't throw error in development, just log it
      console.log('Mock email notification logged for development');
      return { messageId: 'mock-' + Date.now() };
    }
  }

  async sendSMSNotification(phone, message) {
    try {
      // In production, integrate with SMS service like Twilio
      console.log(`SMS to ${phone}: ${message.title} - ${message.message}`);
      return { messageId: 'mock-sms-' + Date.now() };
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      console.log('Mock SMS notification logged for development');
      return { messageId: 'mock-sms-' + Date.now() };
    }
  }

  async sendPushNotification(userId, message) {
    try {
      // In production, integrate with push notification service
      console.log(`Push notification to ${userId}: ${message.title} - ${message.message}`);
      return { messageId: 'mock-push-' + Date.now() };
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  sendRealtimeUpdate(location, airQualityData) {
    // This would be called from the main server with io instance
    // For now, just log the update
    console.log(`Real-time update for ${location.lat}, ${location.lng}: AQI ${airQualityData.aqi}`);
  }

  shouldSendAlert(subscription, airQualityData) {
    const { alertLevels } = subscription;
    const { category } = airQualityData;
    
    return alertLevels.includes(category.toLowerCase().replace(/\s+/g, '-'));
  }

  generateAlertMessage(airQualityData) {
    return `
      Air Quality Alert: ${airQualityData.category}
      AQI: ${airQualityData.aqi}
      
      ${airQualityData.healthMessage}
      
      Recommendations:
      ${airQualityData.recommendations.map(rec => `• ${rec}`).join('\n')}
      
      Stay safe and check air quality regularly!
    `.trim();
  }

  generateEmailHTML(message) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; }
          .coordinates { background: #e8f4fd; border: 1px solid #b8daff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .recommendations { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌍 NASA TEMPO Air Quality Alert</h1>
          </div>
          <div class="content">
            <div class="alert">
              <h2>${message.title}</h2>
              <p><strong>AQI:</strong> ${message.aqi}</p>
              <p><strong>Category:</strong> ${message.category}</p>
            </div>
            ${message.message ? `
            <div class="coordinates">
              <h3>📍 Location Details:</h3>
              <p>${message.message}</p>
            </div>
            ` : ''}
            <div class="recommendations">
              <h3>Recommendations:</h3>
              <ul>
                ${message.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
            <p><em>Generated at: ${message.timestamp}</em></p>
          </div>
          <div class="footer">
            <p>NASA TEMPO Air Quality Monitor</p>
            <p>Stay informed about air quality in your area</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateSubscriptionId() {
    return 'sub_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new NotificationService();
