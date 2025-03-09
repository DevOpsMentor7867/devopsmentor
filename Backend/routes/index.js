const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth.routes');
const chatbotRoutes = require('./chatbot.routes');
const labRoutes = require('./lab.routes');
const messagesRoutes = require('./Messages.routes');

// Mount routes with their respective prefixes
router.use('/api/user', authRoutes);
// Change chatbot routes to use /api/user prefix to match existing structure
router.use('/api/user', chatbotRoutes);
router.use('/api/user', labRoutes);
router.use('/api/messages', messagesRoutes);

module.exports = router;

