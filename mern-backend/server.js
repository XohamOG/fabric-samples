const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fabricRoutes = require('./routes/fabricRoutes'); // Adjust path if needed

app.use(bodyParser.json()); // Ensure body parser is used to parse JSON
app.use('/api', fabricRoutes); // Make sure the prefix is '/api'

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
