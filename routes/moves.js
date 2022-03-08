const express = require('express');
const router = express.Router();
const Move = require('../models/move');
const mongoose = require('mongoose');
const checkAuth = require('../Auth/check-auth');
const checkAdmin = require('../Auth/check-admin');
const MoveController = require('../Controllers/moveController')

router.get('/', MoveController.get_all_moves)

router.get('/:moveId', MoveController.get_move_by_id)

router.post('/new', checkAuth, checkAdmin, MoveController.create_move)

router.patch('/:moveId', checkAuth, checkAdmin, MoveController.update_move_by_id)

router.delete('/:moveId', checkAuth, checkAdmin, MoveController.delete_move_by_id)

module.exports = router;