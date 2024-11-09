const bcrypt = require('bcrypt');
const redis = require("redis");
const jwt = require('jsonwebtoken');

// connecting client to redis server
const redisClient = redis.createClient({
  url: 'redis://localhost:6379'
});

const hashPassword = async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.session || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sessionId = decoded.sessionId;

    const sessionData = await redisClient.get(`session:${sessionId}`);

    if (!sessionData) {
      return res.status(401).json({ message: 'Session expired' });
    }

    const userData = JSON.parse(sessionData);
    req.user = userData;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};
module.exports = { hashPassword, authMiddleware };