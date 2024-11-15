const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Lab Schema
const LabSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

// Tool Schema
const ToolSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  labs: [LabSchema], // Array of embedded Labs
});

// Question Schema
const QuestionSchema = new Schema({
  _id: { type: String, required: true },
  toolId: { type: String, required: true, ref: 'Tool' },
  labId: { type: String, required: true },
  text: { type: String, required: true },
  hint: { type: String, required: true },
  script: { type: String, required: true },
});

const Tool = mongoose.model('Tool', ToolSchema);
const Question = mongoose.model('Question', QuestionSchema);

module.exports = { Tool, Question };

