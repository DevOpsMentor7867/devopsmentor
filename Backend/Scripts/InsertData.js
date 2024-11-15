const mongoose = require('mongoose');
const { Tool, Question } = require('.././models/DataModel');
const { tools, questions } = require('.././Utilities/ToolsAndQuestions');

// MongoDB Connection
const dbURI = 'mongodb+srv://f219284:4ArdiuI3shSVetCb@cluster0.scton.mongodb.net/devopsmentor?retryWrites=true&w=majority'; // Replace with your DB URI
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection error:', err));

// Insert Static Data
const insertData = async () => {
  try {
    // Clear existing collections
    await Tool.deleteMany({});
    await Question.deleteMany({});
    
    // Insert tools and questions
    await Tool.insertMany(tools);
    await Question.insertMany(questions);

    console.log('Data successfully inserted!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error inserting data:', error);
    mongoose.disconnect();
  }
};

// Execute the script
insertData();
