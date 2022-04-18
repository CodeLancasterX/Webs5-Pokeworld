const express = require('express');
const router = express.Router();
const BaseController = require('../controllers/baseController');

router.get('/', BaseController.home)

module.exports = router;