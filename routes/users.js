const express = require('express');
const router = express.Router();
const checkAuth = require('../auth/check-auth');
const checkAdmin = require('../auth/check-admin');
const UserController = require('../controllers/userController')


router.get('/', UserController.get_all_users);

router.get('/:userId', UserController.get_user_by_id)

router.get('/:userId/encounters', checkAuth, UserController.get_encounter_by_userId)

router.get('/:userId/pokemon', UserController.get_all_pokemon_by_userId)

router.get('/:userId/pokemon/:pokemonId', UserController.get_pokemon_by_userId)

router.get('/:userId/pokemon/:pokemonId/moves/:moveId', checkAuth, UserController.get_pokemonMove_by_pokemon_with_userId)

router.get('/:userId/battles', UserController.get_battles_by_userId)

router.post('/signup', UserController.sign_up)

router.post('/login', UserController.login)

router.post('/:userId/encounters', checkAuth, UserController.create_encounter)

router.patch('/:userId/encounters/:encounterId', checkAuth, UserController.update_encounter)

router.patch('/:userId', checkAuth, UserController.update_user_by_id)

router.patch('/:userId/pokemon/:pokemonId/moves', checkAuth, UserController.update_pokemonMoves_by_userId)

router.patch('/:userId/pokemon/:pokemonId', checkAuth, UserController.update_pokemon_by_userId)

router.delete('/:userId', checkAuth, checkAdmin, UserController.delete_user_by_userId)

router.delete('/:userId/pokemon/:pokemonId', checkAuth, UserController.delete_pokemon_by_userId)


module.exports = router;