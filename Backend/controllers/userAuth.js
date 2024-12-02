const crypto = require("crypto");
const Bull = require("bull");
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const redisClientPool = require('../redis/redis-server');
const { sendOtpEmail, sendResetPasswordEmail } = require('../email/send-otp');
require('dotenv').config();

// OTP generation
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Redis queues 
const registration_queue = new Bull('registration', {
  redis: { port: 6379, host: 'localhost' }
});

const verification_queue = new Bull('verification', {
  redis: { port: 6379, host: 'localhost' }
});

const login_queue = new Bull('login', {
  redis: { port: 6379, host: 'localhost' }
});

const logout_queue = new Bull('logout', {
  redis: { port: 6379, host: 'localhost' }
});


// Registration Controller and queue process 

registration_queue.process(async (job) => {
  const { email, password } = job.data;
  let redisClient = await redisClientPool.borrowClient();
  try {
    console.log(`Debug: Starting registration process for email: ${email}`);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Debug: User already exists for email: ${email}`);
      return { 
        success: false, 
        message: 'An account with this email already exists. PLease login or sign up with a different email.',
        code: 'ALREADY_REGISTERED'
      };
    }

    const registrationKey = `registration:${email}`;
    const registrationExists = await redisClient.get(registrationKey);

    if (registrationExists) {
      console.log(`Debug: Registration already in progress for ${email}`);
      return { 
        success: false, 
        message: 'Registration already in progress. Please check your email for OTP or try again later.',
        code: 'REGISTRATION_IN_PROGRESS'
      };
    }

    const otp = generateOtp();
    console.log(`Debug: Storing plain password for OTP verification: ${password.substring(0, 3)}...`);

    await redisClient.set(registrationKey, JSON.stringify({ password, otp }), {
      EX: parseInt(process.env.OTP_EXPIRY) || 300 // Default to 5 minutes
    });
    
    await sendOtpEmail(email, otp);
    console.log(`Debug: OTP sent to ${email}`);
    
    return { 
      success: true, 
      message: 'OTP sent to email. Please verify within 5 minutes.',
      code: 'OTP_SENT'
    };
  } catch (error) {
    console.error(`Error in registration queue process: ${error.message}`);
    return { 
      success: false, 
      message: 'Registration failed',
      error: error.message,
      code: 'REGISTRATION_ERROR' 
    };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Attempting to register user: ${email}`);
    
    const job = await registration_queue.add({ email, password }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    
    const result = await job.finished();
    console.log(`Registration job completed result: ${JSON.stringify(result)}`);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      const statusCodes = {
        'ALREADY_REGISTERED': 400,
        'REGISTRATION_IN_PROGRESS': 409,
        'REGISTRATION_ERROR': 500
      };
      const statusCode = statusCodes[result.code] || 400;
      res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message,
      code: 'SYSTEM_ERROR'
    });
  }
};

// Verify OTP controller and queue process
verification_queue.process(async (job) => {
  const { email, otp } = job.data;
  let redisClient = await redisClientPool.borrowClient();
  try {
    console.log(`Debug: Starting OTP verification for email: ${email}`);
    const stored_key = `registration:${email}`;
    const stored_data = await redisClient.get(stored_key);
    
    if (!stored_data) {
      console.log(`Debug: No stored data found for email: ${email}`);
      return { 
        success: false, 
        message: 'OTP has expired or is invalid. Please request a new OTP.',
        code: 'INVALID_OTP'
      };
    }

    const { password: storedPassword, otp: storedOTP } = JSON.parse(stored_data);
    
    if (otp !== storedOTP) {
      console.log(`Debug: Incorrect OTP for email: ${email}`);
      return { 
        success: false, 
        message: 'Incorrect OTP. Please try again.',
        code: 'WRONG_OTP'
      };
    }

    try {
      const newUser = new User({ email, password: storedPassword });
      await newUser.save();
      console.log(`Debug: User saved successfully for email: ${email}`);
      await redisClient.del(stored_key);
      return { 
        success: true, 
        message: 'Registration completed successfully. You can now login.',
        code: 'SUCCESS'
      };
    } catch (error) {
      if (error.code === 11000) {
        console.log(`Debug: Duplicate key error for email: ${email}`);
        await redisClient.del(stored_key);
        return { 
          success: false, 
          message: 'An account with this email already exists. PLease login or sign up with a different email.',
          code: 'ALREADY_REGISTERED'
        };
      }
      console.error(`Error saving user: ${error.message}`);
      return { 
        success: false, 
        message: 'An error occurred during registration. Please try again.',
        code: 'SAVE_ERROR',
        error: error.message 
      };
    }
  } catch (error) {
    console.error(`Error in verification queue process: ${error.message}`);
    return { 
      success: false, 
      message: 'Verification failed due to a system error. Please try again.',
      code: 'SYSTEM_ERROR',
      error: error.message 
    };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const job = await verification_queue.add({ email, otp }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    const result = await job.finished();
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      const statusCodes = {
        'ALREADY_REGISTERED': 400,
        'INVALID_OTP': 400,
        'WRONG_OTP': 400,
        'SAVE_ERROR': 500,
        'SYSTEM_ERROR': 500
      };
      const statusCode = statusCodes[result.code] || 400;
      res.status(statusCode).json({ 
        message: result.message,
        code: result.code 
      });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      message: 'OTP verification failed', 
      error: error.message,
      code: 'SYSTEM_ERROR'
    });
  }
};

const verifyStoredPasswords = async () => {
  try {
    console.log('Debug: Starting verification of stored passwords');
    const users = await User.find().select('+password');
    for (const user of users) {
      console.log(`Email: ${user.email}, Password Hash: ${user.password.substring(0, 10)}...`);
      if (!user.password || !user.password.startsWith('$2b$') || user.password.length !== 60) {
        console.log(`Debug: Invalid password hash format for user: ${user.email}`);
      }
    }
    console.log('Debug: Finished verifying stored passwords');
  } catch (error) {
    console.error('Error verifying stored passwords:', error);
  }
};

// Login
// Login queue process
login_queue.process(async (job) => {
  const { email, password } = job.data;
  let redisClient = await redisClientPool.borrowClient();
  try {
    console.log(`Debug: Starting login process for email: ${email}`);
    
    // Explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`Debug: User not found for email: ${email}`);
      return { 
        success: false, 
        message: 'Invalid email or password', 
        code: 'USER_NOT_FOUND' 
      };
    }

    console.log(`Debug: Found user password hash: ${user.password.substring(0, 10)}...`);
    
    // Ensure password is properly trimmed
    const trimmedPassword = password.trim();
    
    // Use the user model's comparePassword method
    const isMatch = await user.comparePassword(trimmedPassword);
    console.log(`Debug: Password comparison result: ${isMatch}`);
    
    if (!isMatch) {
      return { 
        success: false, 
        message: 'Invalid email or password', 
        code: 'INVALID_PASSWORD' 
      };
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionData = JSON.stringify({
      sessionId,
      userId: user._id,
      email: user.email
    });

    await redisClient.set(`session:${sessionId}`, sessionData, {
      EX: parseInt(process.env.SESSION_EXPIRY) || 86400 // Default to 24 hours
    });

    const token = jwt.sign(
      { sessionId, email }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    return { 
      success: true, 
      token, 
      message: 'Login successful',
      code: 'LOGIN_SUCCESS'
    };

  } catch (error) {
    console.error(`Debug: Login process error:`, error);
    return { 
      success: false, 
      message: 'Login failed', 
      error: error.message,
      code: 'LOGIN_ERROR' 
    };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});


const login = async (req, res) => {
  console.log("Request body in login:", req.body);
  try {
    const { email, password } = req.body;

    const job = await login_queue.add({ email, password }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    const result = await job.finished();
    if (result.success) {
      res.cookie('session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.SESSION_EXPIRY) * 1000 // Ensure SESSION_EXPIRY is defined
      });
      res.status(200).json({ token: result.token, email: email });
    } else {
      res.status(401).json({ message: result.message });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Logout
logout_queue.process(async (job) => {
  let redisClient = await redisClientPool.borrowClient();
  const { sessionId, email } = job.data;
  try {
    console.log(`Debug: Starting logout process for email: ${email}`);
    await redisClient.del(`session:${sessionId}`);
    
    const registrationKey = `registration:${email}`;
    await redisClient.del(registrationKey);
    
    console.log(`Debug: Logout successful for email: ${email}`);
    return { success: true, message: 'Logout successful', code: 'LOGOUT_SUCCESS' };
  } catch (error) {
    console.error(`Error in logout queue process: ${error.message}`);
    return { success: false, message: 'Logout failed', error: error.message, code: 'LOGOUT_ERROR' };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});

const logout = async (req, res) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(400).json({ message: 'No session found', code: 'NO_SESSION' });
    }

    let sessionId, email;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      sessionId = decoded.sessionId;
      email = decoded.email;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
    }

    const job = await logout_queue.add({ sessionId, email }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    const result = await job.finished();

    if (result.success) {
      res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.setHeader('Clear-Site-Data', '"cookies", "storage"');

      res.status(200).json({ message: result.message, code: result.code });
    } else {
      res.status(500).json({ message: 'Logout failed', code: result.code });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed', error: error.message, code: 'SYSTEM_ERROR' });
  }
};

const welcomeMessage = (req, res) => {
  try {
    res.status(200).json({ message: 'Welcome', code: 'WELCOME' });
  } catch (error) {
    console.error('Error in welcomeMessage:', error);
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message || 'Unknown error',
      code: 'SYSTEM_ERROR'
    });
  }
};


const forgotPassword = async (req, res) => {
  let redisClient;
  try {
    const { email } = req.body;
    console.log(`Debug: Processing forgot password for: ${email}`);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    redisClient = await redisClientPool.borrowClient();
    await redisClient.set(`resetToken:${resetToken}`, JSON.stringify({
      userId: user._id.toString(),
      email: user.email,
      expires: resetTokenExpiry
    }), {
      EX: 3600 // Set expiry for 1 hour
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetPasswordEmail(user.email, resetUrl);

    res.status(200).json({ 
      message: 'Password reset link sent to your email', 
      code: 'RESET_EMAIL_SENT',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process forgot password request', error: error.message, code: 'FORGOT_PASSWORD_ERROR' });
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
};

const resetPassword = async (req, res) => {
  let redisClient;
  try {
    const { token, newPassword } = req.body;
    console.log(token, " password ",newPassword)
    console.log(`Debug: Attempting to reset password for token: ${token.substring(0, 10)}...`);

    redisClient = await redisClientPool.borrowClient();
    const resetData = await redisClient.get(`resetToken:${token}`);

    if (!resetData) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token', 
        code: 'INVALID_RESET_TOKEN' 
      });
    }

    const { userId, email, expires } = JSON.parse(resetData);

    if (Date.now() > expires) {
      await redisClient.del(`resetToken:${token}`);
      return res.status(400).json({ 
        message: 'Reset token has expired', 
        code: 'EXPIRED_RESET_TOKEN' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found', 
        code: 'USER_NOT_FOUND' 
      });
    }

    user.password = newPassword.trim();
    await user.save();

    await redisClient.del(`resetToken:${token}`);

    console.log(`Debug: Password reset successfully for email: ${email}`);
    res.status(200).json({ 
      message: 'Password reset successfully', 
      code: 'PASSWORD_RESET_SUCCESS' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Password reset failed', 
      error: error.message, 
      code: 'PASSWORD_RESET_ERROR' 
    });
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
};


const deleteUser = async (req, res) => {
  let redisClient;
  try {
    const { email } = req.body;
    console.log(`Debug: Attempting to delete user: ${email}`);

    // Delete user from MongoDB
    const deletedUser = await User.findOneAndDelete({ email });
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Delete user-related data from Redis
    redisClient = await redisClientPool.borrowClient();
    const registrationKey = `registration:${email}`;
    await redisClient.del(registrationKey);

    // Find and delete any active sessions for this user
    const sessionPattern = `session:*`;
    const sessionKeys = await redisClient.keys(sessionPattern);
    for (const key of sessionKeys) {
      const sessionData = await redisClient.get(key);
      const session = JSON.parse(sessionData);
      if (session.email === email) {
        await redisClient.del(key);
      }
    }

    console.log(`Debug: User deleted successfully: ${email}`);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      code: 'USER_DELETED'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
      code: 'DELETE_USER_ERROR'
    });
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
};


module.exports = { 
  register, 
  deleteUser,
  verifyOtp, 
  login, 
  logout, 
  welcomeMessage, 
  verifyStoredPasswords,
  forgotPassword,
  resetPassword
};

