const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fabricRoutes = require('./routes/fabricRoutes'); // Ensure correct path

const app = express();
const port = 5000;

// Enable CORS for all requests
app.use(cors());

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Logging middleware (placed before routes for proper request logging)
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// Use fabric routes with '/api' prefix
app.use('/api', fabricRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
