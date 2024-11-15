const { Tool, Question } = require('../models/DataModel');

// Fetch all tools
const getAllTools = async (req, res) => {
  try {
    const tools = await Tool.find({}).select('_id name description labs');
    const toolsWithLabCount = tools.map(tool => ({
      _id: tool._id,
      name: tool.name,
      description: tool.description,
      labCount: tool.labs.length
    }));
    res.json(toolsWithLabCount);
  } catch (error) {
    console.error("Error in getAllTools:", error);
    res.status(500).json({ message: 'Error fetching tools', error: error.message });
  }
};

// Fetch labs for a specific tool
const getLabsByTool = async (req, res) => {
  const { toolId } = req.params;
  try {
    const tool = await Tool.findById(toolId).select('name labs');
    if (!tool) return res.status(404).json({ message: 'Tool not found' });
    
    const labsWithDetails = tool.labs.map(lab => ({
      id: lab.id,
      name: lab.name,
      description: lab.description
    }));

    res.status(200).json({
      toolName: tool.name,
      labs: labsWithDetails
    });
  } catch (error) {
    console.error("Error in getLabsByTool:", error);
    res.status(500).json({ message: 'Error fetching labs', error: error.message });
  }
};

// Fetch questions for a specific lab
const getQuestionsByLab = async (req, res) => {
  const { toolId, labId } = req.params;

  try {
    // Validate that the tool exists and contains the specified lab
    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    const lab = tool.labs.find(lab => lab.id === labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found for this tool' });
    }

    // Fetch questions
    const questions = await Question.find({ toolId, labId })
      .select('_id text hint script')
      .sort({ _id: 1 }); // Sorting by _id as 'order' field is not in the new schema

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this lab' });
    }

    res.status(200).json({
      toolName: tool.name,
      toolDescription: tool.description,
      labName: lab.name,
      labDescription: lab.description,
      questions: questions.map(q => ({
        id: q._id,
        text: q.text,
        hint: q.hint,
        script: q.script
      }))
    });
  } catch (error) {
    console.error('Error in getQuestionsByLab:', error);
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};


module.exports = { getAllTools, getLabsByTool, getQuestionsByLab };
