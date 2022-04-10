const express = require('express');
const checkAdmin = require('../auth/check-admin');
const checkAuth = require('../auth/check-auth');
const BattleController = require('../controllers/battleController')
const router = express.Router();

//get battles
router.get('/', BattleController.get_all_battles); 

//get specific battle
router.get('/:id', BattleController.get_battle_by_id)

//create battles
router.post('/', checkAuth, checkAdmin, BattleController.create_battle)

//update battles
router.put('/:id', checkAuth, checkAdmin, BattleController.update_battle_by_id)

//delete battles
router.delete('/:id', checkAuth, checkAdmin, BattleController.delete_battle_by_id)

module.exports = router;