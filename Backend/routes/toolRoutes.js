const express = require('express');
const { getAllTools, getLabsByTool, getQuestionsByLab } = require('../controllers/toolController');

const router = express.Router();

// Get all tools
router.get('/tools', getAllTools);

// Get labs for a specific tool
router.get('/tools/:toolId/labs', getLabsByTool);

// Get questions for a specific lab
router.get('/tools/:toolId/labs/:labId/questions', getQuestionsByLab);

module.exports = router;
