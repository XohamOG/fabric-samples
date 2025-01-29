const express = require('express');
const router = express.Router();
const fabricController = require('../controllers/fabricController');

// Define your POST route for invoke
router.post('/fabric/invoke', fabricController.invokeTransaction);

// Define your GET route for query
router.get('/fabric/query', fabricController.queryTransaction);

module.exports = router;
