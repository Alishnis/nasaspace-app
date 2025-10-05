# 🚀 Deployment Guide - NASA TEMPO Air Quality Monitor

## 📋 **Для деплоя на сервер:**

### ✅ **1. Переменные окружения на сервере**

**НЕ создавайте `.env` файл на сервере!** Вместо этого настройте переменные окружения:

#### **Для Heroku:**
```bash
heroku config:set EMAIL_SERVICE=gmail
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set PORT=3000
```

#### **Для Vercel:**
```bash
vercel env add EMAIL_SERVICE
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

#### **Для DigitalOcean/AWS:**
```bash
export EMAIL_SERVICE=gmail
export EMAIL_USER=your-email@gmail.com
export EMAIL_PASS=your-app-password
export PORT=3000
```

### ✅ **2. Рекомендуемые настройки для продакшена:**

#### **Gmail (самый простой):**
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=3000
```

#### **Outlook/Hotmail:**
```bash
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-outlook-app-password
PORT=3000
```

#### **Yahoo:**
```bash
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-yahoo-app-password
PORT=3000
```

#### **Custom SMTP Server:**
```bash
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
PORT=3000
```

### ✅ **3. Пошаговая инструкция деплоя:**

#### **Шаг 1: Подготовка**
1. **Создайте production email** (отдельный от личного)
2. **Настройте двухфакторную аутентификацию**
3. **Создайте пароль приложения**

#### **Шаг 2: Настройка переменных окружения**
```bash
# Для Heroku
heroku config:set EMAIL_SERVICE=gmail
heroku config:set EMAIL_USER=your-production-email@gmail.com
heroku config:set EMAIL_PASS=your-16-character-app-password

# Для Vercel
vercel env add EMAIL_SERVICE production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
```

#### **Шаг 3: Деплой**
```bash
# Heroku
git push heroku main

# Vercel
vercel --prod

# DigitalOcean/AWS
npm start
```

### ✅ **4. Проверка после деплоя:**

1. **Откройте ваше приложение** на продакшене
2. **Перейдите в раздел "Alerts"**
3. **Введите тестовый email**
4. **Нажмите "Subscribe to Alerts"**
5. **Проверьте почту** - должно прийти реальное письмо!

### ⚠️ **Важные замечания для продакшена:**

1. **НЕ коммитьте `.env` файлы** в Git
2. **Используйте отдельный email** для продакшена
3. **Настройте мониторинг** отправки писем
4. **Ограничьте количество писем** в день
5. **Проверьте спам-фильтры** получателей

### 🔧 **Отладка на продакшене:**

```bash
# Проверьте логи
heroku logs --tail

# Проверьте переменные окружения
heroku config

# Тестируйте отправку
curl -X POST "https://your-app.herokuapp.com/api/notifications/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7128, "lng": -74.0060, "email": "test@example.com"}'
```

### 📧 **Альтернативы для больших объемов:**

#### **SendGrid (рекомендуется):**
- Бесплатно до 100 писем/день
- Простая настройка
- Хорошая доставляемость

#### **AWS SES:**
- Очень дешево ($0.10 за 1000 писем)
- Высокая надежность
- Сложнее в настройке

#### **Mailgun:**
- Бесплатно до 10,000 писем/месяц
- Хорошие API
- Простая интеграция
