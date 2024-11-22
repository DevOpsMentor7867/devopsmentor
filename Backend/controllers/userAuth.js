const crypto = require("crypto");
const redis = require("redis");
const Bull = require("bull");
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClientPool = require('../redis/redis-server'); 
const sendOtpEmail =  require('../email/send-otp');
require('dotenv').config();
//otp generation

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// redis queues 
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



// registration Controller and queue process 

registration_queue.process(async (job) => {
  const { email, password } = job.data;
   let redisClient = await redisClientPool.borrowClient();
  try {
    const registrationKey = `registration:${email}`;
    const registrationExists = await redisClient.get(registrationKey);

    if (registrationExists) {
      console.log(`Registration already exists for ${email}`);
      return { message: 'Registration already in progress. Please check your email' };
    }

    const otp = generateOtp();
    await redisClient.set(registrationKey, JSON.stringify({ password, otp }), {
      EX: process.env.OTP_EXPIRY
    });
    
    const storedData = await redisClient.get(registrationKey);
    console.log(`Stored data for ${email}:`, storedData);

     await sendOtpEmail(email,otp);

    console.log(`OTP sent to ${email}`);
    return { message: 'OTP sent to email. Please verify within 2 minutes.' };
  } catch (error) {
    console.error(`Error in registration queue process: ${error.message}`);
    throw error;
  }finally {
    
    if (redisClient) {
      redisClientPool.returnClient(redisClient);
    }
  }
});

const register =  async (req, res) => {
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
    res.status(200).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// verify otp controller and queue process

verification_queue.process(async (job) => {
  const { email, otp } = job.data;
  let redisClient = await redisClientPool.borrowClient();
  try {
    const stored_key = `registration:${email}`;
    const stored_data = await redisClient.get(stored_key);
    if (!stored_data) {
      return { success: false, message: 'OTP has expired or is invalid' };
    }
    const { password: storedPassword, otp: storedOTP } = JSON.parse(stored_data);
    if (otp == storedOTP) {
      const newUser = new User({ email, password: storedPassword });
      await newUser.save();
      console.log('User saved successfully:', newUser);
      await redisClient.del(stored_key);
      return { success: true, message: 'OTP verified successfully' };
    } else {
      return { success: false, message: 'Incorrect OTP' };
    }
  } catch (error) {
    console.error(`Error in verification queue process: ${error.message}`);
    throw error;
  }finally {
    
    if (redisClient) {
      redisClientPool.returnClient(redisClient);
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
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// login 

login_queue.process(async (job) => {
  const { email, password } = job.data;
  let redisClient = await redisClientPool.borrowClient();
  try {
    console.log("email is ",email );
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: 'Invalid email credentials' };
    }

    const password_match = await bcrypt.compare(password, user.password);
    if (!password_match) {
      return { success: false, message: 'Invalid  password credentials' };
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionData = JSON.stringify({
      sessionId,
      userId: user._id,
      email: user.email
    });

    await redisClient.set(`session:${sessionId}`, sessionData, {
      EX: process.env.SESSION_EXPIRY
    });

    const token = jwt.sign({ sessionId }, process.env.JWT_SECRET);

    return { success: true, token, message: 'Login successful' };
  } catch (error) {
    console.error(`Error in login queue process: ${error.message}`);
    throw error;
  }finally {
    
    if (redisClient) {
      redisClientPool.returnClient(redisClient);
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
        maxAge: process.env.SESSION_EXPIRY * 1000 // Ensure SESSION_EXPIRY is defined
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

// logout 

logout_queue.process(async (job) => {
  let redisClient = await redisClientPool.borrowClient();
  const {sessionId} = job.data;
  try {
    await redisClient.del(`session:${sessionId}`);
    return { success: true, message: 'Logout successful' };
  } catch (error) {
    console.error(`Error in logout queue process: ${error.message}`);
    throw error;
  }finally {
    
    if (redisClient) {
      redisClientPool.returnClient(redisClient);
    }
  }

});

const logout = async (req, res) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(400).json({ message: 'No session found' });
    }

    let sessionId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      sessionId = decoded.sessionId;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const job = await logout_queue.add({ sessionId }, {
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

      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ message: 'Logout failed' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

const welcomeMessage = (req, res) => {
  try {
    // Send a simple welcome message as response
    res.status(200).json({ message: 'Welcome' });
  } catch (error) {
    console.error('Error in welcomeMessage:', error);
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message || 'Unknown error',
    });
  }
};


module.exports = { register, verifyOtp , login , logout , welcomeMessage};