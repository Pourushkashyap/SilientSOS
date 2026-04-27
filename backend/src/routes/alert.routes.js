const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('audio'), alertController.handleEmergencyAlert);

module.exports = router;
