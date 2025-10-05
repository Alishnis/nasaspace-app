# 🧪 Test Notification Feature

## 📋 Overview
Реализована функциональность автоматической отправки тестовых уведомлений сразу после успешной подписки на alerts о качестве воздуха.

## ✨ Features

### 🎯 **Автоматические тестовые уведомления**
- **Мгновенная отправка** тестового уведомления после подписки
- **Персонализированное сообщение** с информацией о подписке
- **Подтверждение работы** системы уведомлений

### 📧 **Email уведомления**
- Красивое HTML-письмо с логотипом NASA TEMPO
- Информация о местоположении и уровнях предупреждений
- Рекомендации по настройке уведомлений

### 📱 **SMS уведомления**
- Краткое текстовое сообщение
- Подтверждение подписки
- Информация о настройках

## 🔧 Technical Implementation

### **Modified Files:**
- `services/notificationService.js` - добавлен метод `sendTestNotificationAfterSubscription()`
- `test-notification.js` - создан тестовый скрипт

### **New Method:**
```javascript
async sendTestNotificationAfterSubscription(subscription) {
  // Отправляет приветственное уведомление с:
  // - Информацией о подписке
  // - Местоположением
  // - Уровнями предупреждений
  // - Рекомендациями
}
```

## 🚀 Usage

### **API Endpoint:**
```bash
POST /api/notifications/subscribe
```

### **Request Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "email": "user@example.com",
  "phone": "+1234567890",
  "alertLevels": ["unhealthy", "very-unhealthy", "hazardous"]
}
```

### **Response:**
```json
{
  "subscriptionId": "sub_abc123",
  "message": "Successfully subscribed to air quality alerts. Test notification sent!",
  "subscription": {
    "id": "sub_abc123",
    "location": { "lat": 40.7128, "lng": -74.0060 },
    "email": "user@example.com",
    "phone": "+1234567890",
    "alertLevels": ["unhealthy", "very-unhealthy", "hazardous"],
    "createdAt": "2025-10-05T13:14:19.125Z",
    "isActive": true
  }
}
```

## 🧪 Testing

### **Run Test Script:**
```bash
node test-notification.js
```

### **Manual Testing:**
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

## 📝 Test Notification Content

### **Email Subject:**
🎉 Welcome to NASA TEMPO Air Quality Alerts!

### **Email Content:**
- Приветственное сообщение
- Информация о местоположении
- Уровни предупреждений
- Рекомендации по настройке

### **SMS Content:**
```
NASA TEMPO Alert: Welcome! You're subscribed to air quality alerts for location 40.7128, -74.0060. You'll receive notifications for: unhealthy, very-unhealthy, hazardous levels.
```

## 🎨 Benefits

1. **User Experience** - Пользователи сразу получают подтверждение работы системы
2. **Trust Building** - Демонстрирует, что уведомления работают
3. **Onboarding** - Помогает пользователям понять, как работает система
4. **Debugging** - Помогает выявить проблемы с доставкой уведомлений

## 🔍 Development Mode

В режиме разработки:
- Email уведомления логируются в консоль
- SMS уведомления логируются в консоль
- Push уведомления логируются в консоль
- Реальные уведомления не отправляются

## 🚀 Production Ready

Для продакшена необходимо:
1. Настроить реальный SMTP сервер
2. Интегрировать SMS сервис (Twilio, etc.)
3. Настроить push уведомления
4. Добавить базу данных для хранения подписок

---

**Status:** ✅ **COMPLETED**  
**Date:** 2025-10-05  
**Author:** NASA TEMPO Air Quality Monitor Team
