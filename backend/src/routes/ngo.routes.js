const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngo.controller');

router.get('/nearest', ngoController.getNearestNGO);

module.exports = router;
