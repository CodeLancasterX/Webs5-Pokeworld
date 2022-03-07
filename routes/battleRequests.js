const express = require('express');
const mongoose = require('mongoose');
const checkAuth = require('../Auth/check-auth');
const BattleRequest = require('../models/battleRequest');
const BattleRequestController = require('../Controllers/battleRequestController')
const Battle = require('../models/battle');
const User = require('../models/user');
const router = express.Router();


router.get('/', BattleRequestController.get_all_battleRequests);

router.get('/:id', BattleRequestController.get_battleRequest_by_id);

router.post('/', checkAuth, BattleRequestController.create_battleRequest);

router.patch('/:id', checkAuth, BattleRequestController.update_battleRequest_by_id);

router.delete('/:id', checkAuth, BattleRequestController.delete_battleRequest_by_id);

module.exports = router;