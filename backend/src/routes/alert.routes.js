const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');

router.post('/', alertController.handleEmergencyAlert);

module.exports = router;
