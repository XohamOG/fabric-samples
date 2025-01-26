const express = require('express');
const { invokeTransaction, queryTransaction } = require('../controllers/fabricController');
const router = express.Router();

// Routes for invoking and querying chaincode
router.post('/invoke', invokeTransaction);
router.get('/query', queryTransaction);

module.exports = router;
