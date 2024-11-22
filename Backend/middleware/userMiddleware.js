const jwt = require('jsonwebtoken');
const redisClientPool = require('../redis/redis-server');

// User authentication middleware
const authMiddleware = async (req, res, next) => {
  const redisClient = await redisClientPool.borrowClient();
  try {
    // Check if the token is provided in cookies or in the Authorization header
    const token = req.cookies.session || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Borrow a Redis client
    

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sessionId = decoded.sessionId;

    // Fetch the session data from Redis
    const sessionData = await redisClient.get(`session:${sessionId}`);

    if (!sessionData) {
      return res.status(401).json({ message: 'Session expired' });
    }

    // Parse and attach user data to the request
    const userData = JSON.parse(sessionData);
    req.user = userData;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  } finally {
    // Ensure that Redis client is returned to the pool
    if (redisClient) {
      redisClientPool.returnClient(redisClient);
    }
  }
};

module.exports = authMiddleware;
