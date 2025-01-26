const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fabricRoutes = require('./routes/fabricRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/fabric', fabricRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
