
/*const express = require("express");
const router = express.Router();
const userController = require("../controllers/userAuth");
const { hashPassword, authMiddleware } = require('../middleware/userMiddleware');
router.post('/user/register', userController.register);
router.post('/user/verify', userController.verifyOtp);
router.post('/user/login', userController.login);
router.post('/user/logout', userController.logout);
router.post('/user/auth' , authMiddleware, userController.auth);
module.exports = router;*/

const express = require("express");
const { register, verifyOtp, login, logout, user, auth } = require("../controllers/userAuth");
//const { hashPassword,authMiddleware } = require('../middleware/userMiddleware');
const redis = require("redis");
const userRouter = express.Router();
userRouter.post('/user/register', register);
userRouter.post('/user/verify', verifyOtp);
userRouter.post('/user/login', login);
userRouter.post('/user/logout', logout);
const jwt = require('jsonwebtoken');
// userRouter.get('/auth', authMiddleware, auth);
//userRouter.post('/user/dummy', user);

const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
  });

  redisClient.connect().catch(console.error);
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
  
  userRouter.get('/user/dummy', authMiddleware, (req, res) => {
    try {
      // Send userData along with the success message
      res.status(200).json({
        message: 'Authentication successful',
        user: req.user,  // Send the userData in the response
      });
    } catch (error) {
      console.error('Error in dummy route:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
// Add other routes here if needed

module.exports =  userRouter; 