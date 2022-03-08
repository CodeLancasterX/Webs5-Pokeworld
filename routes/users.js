const express = require('express');
const router = express.Router();
const checkAuth = require('../auth/check-auth');
const checkAdmin = require('../auth/check-admin');
const UserController = require('../controllers/userController')


router.get('/', UserController.get_all_users);

router.get('/:userId', UserController.get_user_by_id)

router.get('/:userId/encounters', checkAuth, UserController.get_encounter_by_userId)

router.get('/:userId/pokemon', UserController.get_all_pokemon_by_userId)

router.get('/:userId/pokemon/:pokemonId', checkAuth, UserController.get_pokemon_by_userId)

//get specific move for user owned pokemon
router.get('/:userId/pokemon/:pokemonId/moves/:moveId', checkAuth, UserController.get_pokemonMove_by_pokemon_with_userId)

//get user battles
router.get('/:userId/battles', UserController.get_battles_by_userId)

//create users
router.post('/signup', UserController.sign_up)

//create encounter 
router.post('/:userId/encounters/new', checkAuth, UserController.create_encounter)

//update encounter
router.patch('/:userId/encounters/:encounterId', checkAuth, UserController.update_encounter)

//login
router.patch('/login', UserController.login)

//update users
router.patch('/:userId', checkAuth, UserController.update_user_by_id)

//update user owned pokemon. solve null userId with checkAuth
router.patch('/:userId/pokemon/:pokemonId/moves', UserController.update_pokemonMoves_by_userId)

router.patch('/:userId/pokemon/:pokemonId', UserController.update_pokemon_by_userId)

//TODO: cascade delete pokemon and encounters. delete user
router.delete('/:userId', checkAuth, checkAdmin, UserController.delete_user_by_userId)

router.delete('/:userId/pokemon/:pokemonId', UserController.delete_user_by_userId)


module.exports = router;