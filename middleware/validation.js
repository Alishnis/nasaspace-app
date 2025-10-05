// Validation middleware for API endpoints

const validateLocation = (req, res, next) => {
  const { lat, lng } = req.query;
  
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
  
  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({ 
      error: 'Latitude must be between -90 and 90' 
    });
  }
  
  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({ 
      error: 'Longitude must be between -180 and 180' 
    });
  }
  
  req.validatedLocation = { lat: latitude, lng: longitude };
  next();
};

const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      error: 'Email is required' 
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }
  
  next();
};

const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ 
      error: 'Password is required' 
    });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters long' 
    });
  }
  
  next();
};

const validateSubscription = (req, res, next) => {
  const { email, phone, alertLevels } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({ 
      error: 'Either email or phone number is required' 
    });
  }
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
  }
  
  if (phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        error: 'Invalid phone number format' 
      });
    }
  }
  
  if (alertLevels && !Array.isArray(alertLevels)) {
    return res.status(400).json({ 
      error: 'Alert levels must be an array' 
    });
  }
  
  next();
};

module.exports = {
  validateLocation,
  validateEmail,
  validatePassword,
  validateSubscription
};
