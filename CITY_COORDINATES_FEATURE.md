# 🌍 City Coordinates Feature

## 📋 Overview
Добавлены точные географические координаты к названиям городов в рейтинге качества воздуха для более точной идентификации местоположения.

## ✨ Features

### 🎯 **Географические координаты**
- **Точные координаты** для всех городов в рейтинге
- **Формат координат** в градусах с указанием направления (N/S/E/W)
- **Международный стандарт** для отображения координат

### 📍 **Поддерживаемые страны**
- **США** - Los Angeles, New York, Chicago, Houston, Phoenix
- **Россия** - Moscow, Saint Petersburg, Novosibirsk, Yekaterinburg, Kazan
- **Индия** - Delhi, Mumbai, Kolkata, Chennai, Bangalore
- **Китай** - Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu
- **Германия** - Berlin, Munich, Hamburg, Cologne, Frankfurt
- **Франция** - Paris, Lyon, Marseille, Toulouse, Nice
- **Великобритания** - London, Birmingham, Manchester, Glasgow, Edinburgh
- **Казахстан** - Karaganda, Almaty, Oskemen, Astana, Pavlodar

## 🔧 Technical Implementation

### **Modified Files:**
- `services/airQualityService.js` - обновлен метод `getCityRanking()`

### **Format Example:**
```javascript
{ name: 'Moscow, Moscow (55.7558°N, 37.6176°E)', aqi: 145 }
```

## 🚀 Usage

### **API Endpoint:**
```bash
GET /api/air-quality/ranking?country={COUNTRY_CODE}
```

### **Supported Country Codes:**
- `US` - United States
- `RU` - Russia  
- `IN` - India
- `CN` - China
- `DE` - Germany
- `FR` - France
- `GB` - United Kingdom
- `KZ` - Kazakhstan

### **Response Example:**
```json
{
  "country": "United States",
  "cities": [
    {
      "name": "Los Angeles, CA (34.0522°N, 118.2437°W)",
      "aqi": 167
    },
    {
      "name": "New York, NY (40.7128°N, 74.0060°W)",
      "aqi": 71
    }
  ],
  "updated": "2025-10-05T13:17:41.384Z"
}
```

## 🧪 Testing

### **Test Different Countries:**
```bash
# United States
curl "http://localhost:3003/api/air-quality/ranking?country=US"

# Russia
curl "http://localhost:3003/api/air-quality/ranking?country=RU"

# India
curl "http://localhost:3003/api/air-quality/ranking?country=IN"
```

## 📝 Coordinate Format

### **Format:**
```
City Name (Latitude°N/S, Longitude°E/W)
```

### **Examples:**
- **Moscow**: `Moscow, Moscow (55.7558°N, 37.6176°E)`
- **New York**: `New York, NY (40.7128°N, 74.0060°W)`
- **Delhi**: `Delhi, Delhi (28.7041°N, 77.1025°E)`

## 🎨 Benefits

1. **Precision** - Точное указание местоположения городов
2. **Navigation** - Легко найти город на карте
3. **Scientific** - Научный подход к отображению данных
4. **International** - Стандартный формат координат
5. **User Experience** - Лучшее понимание географического контекста

## 🔍 Use Cases

- **Research** - Научные исследования качества воздуха
- **Navigation** - Поиск городов на картах
- **Analysis** - Анализ географических паттернов загрязнения
- **Education** - Образовательные цели
- **Planning** - Планирование поездок

## 🌐 Geographic Coverage

### **Continents Covered:**
- **North America** - USA, Canada (via US cities)
- **Europe** - Russia, Germany, France, UK
- **Asia** - India, China, Kazakhstan
- **Future Expansion** - Africa, South America, Oceania

### **Coordinate Systems:**
- **Latitude**: -90° to +90° (N/S)
- **Longitude**: -180° to +180° (E/W)
- **Precision**: 4 decimal places (~11 meters accuracy)

---

**Status:** ✅ **COMPLETED**  
**Date:** 2025-10-05  
**Author:** NASA TEMPO Air Quality Monitor Team
