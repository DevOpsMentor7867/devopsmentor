require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require("./db/mongoose");
const routes = require("./routes/routesfile");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();



app.use(cors({
  origin: 'http://localhost:3000', // The origin of your frontend
  credentials: true,               // Allow credentials
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Specific origin
  res.header('Access-Control-Allow-Credentials', 'true');             // Allow credentials
  next();
});


app.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ message: 'Invalid JSON' });
    }
  }
}));
//app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api', routes);
(async () => {
    try {
      await connectToDatabase();
      const port = process.env.PORT;
      const server = app.listen(port, () => {
        console.log(`Server running on port: ${port}`);
      });
    } catch (error) {
      console.error("Failed to start the server:", error.message);
    }
  })();