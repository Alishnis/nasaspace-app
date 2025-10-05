const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
  constructor() {
    this.users = new Map(); // In production, use a database
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  async registerUser({ email, password, name }) {
    try {
      // Check if user already exists
      if (this.users.has(email)) {
        throw new Error('User already exists');
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = {
        id: this.generateUserId(),
        email,
        password: hashedPassword,
        name,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      this.users.set(email, user);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const user = this.users.get(email);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        isActive: user.isActive
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Update user fields
      if (updates.name) user.name = updates.name;
      if (updates.email) user.email = updates.email;
      
      user.updatedAt = new Date().toISOString();

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      this.users.delete(user.email);
      
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = UserService;
