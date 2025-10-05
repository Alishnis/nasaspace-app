# 📧 Test Notification System

## 🎯 Overview
Система автоматически отправляет тестовые уведомления сразу после успешной подписки на уведомления о качестве воздуха.

## ✅ **Как это работает:**

### 🔧 **Автоматическая отправка:**
1. **Пользователь подписывается** на уведомления через API
2. **Система создает подписку** и сохраняет данные
3. **Автоматически отправляется тестовое уведомление** на указанный email/SMS
4. **Пользователь получает подтверждение** о том, что тестовое уведомление отправлено

### 📧 **Содержание тестового уведомления:**
```
🎉 Welcome to NASA TEMPO Air Quality Alerts!

Thank you for subscribing to air quality alerts for location 40.7128, -74.0060. 
You will receive notifications when air quality reaches the following levels: 
unhealthy, very-unhealthy, hazardous.

This is a test notification to confirm your subscription is working
You will receive real alerts when air quality changes in your area
Check your email settings to ensure notifications are not going to spam
```

## 🧪 **Тестирование системы:**

### **1. Подписка с email:**
```bash
curl -X POST "http://localhost:3003/api/notifications/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 40.7128,
    "lng": -74.0060,
    "email": "test@example.com",
    "alertLevels": ["unhealthy", "very-unhealthy", "hazardous"]
  }'
```

**Ответ:**
```json
{
  "subscriptionId": "sub_jpb8t351h",
  "message": "Successfully subscribed to air quality alerts. Test notification sent!",
  "subscription": {
    "id": "sub_jpb8t351h",
    "location": {"lat": 40.7128, "lng": -74.006},
    "email": "test@example.com",
    "alertLevels": ["unhealthy", "very-unhealthy", "hazardous"],
    "createdAt": "2025-10-05T13:55:11.120Z",
    "isActive": true
  }
}
```

### **2. Подписка с email и SMS:**
```bash
curl -X POST "http://localhost:3003/api/notifications/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 28.7041,
    "lng": 77.1025,
    "email": "delhi-test@example.com",
    "phone": "+1234567890",
    "alertLevels": ["unhealthy", "very-unhealthy", "hazardous"]
  }'
```

## 🔧 **Техническая реализация:**

### **В `notificationService.js`:**
```javascript
async subscribeToAlerts({ lat, lng, email, phone, alertLevels }) {
  // Создание подписки
  const subscription = { /* ... */ };
  this.subscriptions.set(subscriptionId, subscription);
  
  // 🎯 АВТОМАТИЧЕСКАЯ ОТПРАВКА ТЕСТОВОГО УВЕДОМЛЕНИЯ
  await this.sendTestNotificationAfterSubscription(subscription);
  
  return {
    subscriptionId,
    message: 'Successfully subscribed to air quality alerts. Test notification sent!',
    subscription
  };
}
```

### **Метод отправки тестового уведомления:**
```javascript
async sendTestNotificationAfterSubscription(subscription) {
  const testMessage = {
    title: '🎉 Welcome to NASA TEMPO Air Quality Alerts!',
    message: `Thank you for subscribing to air quality alerts for location ${subscription.location.lat.toFixed(4)}, ${subscription.location.lng.toFixed(4)}. You will receive notifications when air quality reaches the following levels: ${subscription.alertLevels.join(', ')}.`,
    aqi: 45,
    category: 'Good',
    recommendations: [
      'This is a test notification to confirm your subscription is working',
      'You will receive real alerts when air quality changes in your area',
      'Check your email settings to ensure notifications are not going to spam'
    ],
    timestamp: new Date().toISOString()
  };

  // Отправка email если указан
  if (subscription.email) {
    await this.sendEmailNotification(subscription.email, testMessage);
    console.log(`✅ Test email sent to ${subscription.email}`);
  }

  // Отправка SMS если указан
  if (subscription.phone) {
    await this.sendSMSNotification(subscription.phone, testMessage);
    console.log(`✅ Test SMS sent to ${subscription.phone}`);
  }
}
```

## 📱 **Frontend интеграция:**

### **В веб-интерфейсе:**
1. Пользователь заполняет форму подписки
2. Нажимает "Subscribe to Alerts"
3. Система автоматически отправляет тестовое уведомление
4. Пользователь видит сообщение "Test notification sent!"

## 🎯 **Результат:**
- ✅ **Мгновенная обратная связь** - пользователь сразу знает, что подписка работает
- ✅ **Проверка email/SMS** - подтверждение, что уведомления доходят
- ✅ **Доверие пользователя** - система работает прозрачно
- ✅ **Простота использования** - никаких дополнительных действий не требуется

## 🚀 **Готово к использованию:**
Система полностью настроена и работает. Пользователи автоматически получают тестовые уведомления при подписке на уведомления о качестве воздуха.
