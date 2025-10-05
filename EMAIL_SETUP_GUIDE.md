# 📧 Настройка реальной отправки Email

## 🎯 Как настроить отправку email на реальную почту

### ✅ **Шаг 1: Настройка Gmail (рекомендуется)**

1. **Включите двухфакторную аутентификацию** в вашем Google аккаунте
2. **Создайте пароль приложения**:
   - Перейдите в [Google Account Settings](https://myaccount.google.com/)
   - Безопасность → Пароли приложений
   - Создайте новый пароль для "NASA TEMPO App"
   - Скопируйте сгенерированный пароль

3. **Обновите файл `email-config.env`**:
   ```env
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### ✅ **Шаг 2: Альтернативные email сервисы**

#### **Outlook/Hotmail:**
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### **Yahoo:**
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### **Custom SMTP:**
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

### ✅ **Шаг 3: Запуск с реальной отправкой**

1. **Скопируйте настройки**:
   ```bash
   cp email-config.env .env
   ```

2. **Отредактируйте `.env`** с вашими реальными данными

3. **Запустите сервер**:
   ```bash
   PORT=3003 node server.js
   ```

### 🧪 **Тестирование**

После настройки, когда пользователь подписывается на уведомления:

1. **Введите реальный email** в форму подписки
2. **Нажмите "Subscribe to Alerts"**
3. **Проверьте почту** - должно прийти реальное письмо!

### 📧 **Что будет в письме:**

```
🎉 Welcome to NASA TEMPO Air Quality Alerts!

Thank you for subscribing to air quality alerts for location 40.7128, -74.0060. 
You will receive notifications when air quality reaches the following levels: 
unhealthy, very-unhealthy, hazardous.

This is a test notification to confirm your subscription is working
You will receive real alerts when air quality changes in your area
Check your email settings to ensure notifications are not going to spam

Current AQI: 45 (Good)
Timestamp: 2024-01-15T10:30:00.000Z
```

### ⚠️ **Важные замечания:**

1. **Gmail App Password** - НЕ используйте обычный пароль от Gmail
2. **Проверьте спам** - письма могут попадать в папку спам
3. **Ограничения** - Gmail имеет лимиты на отправку (500 писем/день)
4. **Безопасность** - Никогда не коммитьте `.env` файл в Git!

### 🔧 **Отладка:**

Если письма не приходят:

1. **Проверьте логи сервера** - должны быть сообщения об отправке
2. **Проверьте настройки Gmail** - включена ли двухфакторная аутентификация
3. **Проверьте пароль приложения** - правильный ли 16-символьный пароль
4. **Проверьте спам** - письма могут попадать туда

### 📱 **SMS уведомления:**

Для SMS нужны дополнительные сервисы:
- **Twilio** (рекомендуется)
- **SendGrid**
- **AWS SNS**

Настройка SMS требует API ключей и дополнительной конфигурации.
