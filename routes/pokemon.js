const express = require('express');
const checkAuth = require('../auth/check-auth');
const checkAdmin = require('../auth/check-admin');
const PokemonController = require('../controllers/pokemonController');
const router = express.Router();

//get pokemon
router.get('/', PokemonController.get_all_pokemon); 

router.get('/starters', PokemonController.get_all_starter_pokemon);

//get specific pokemon
router.get('/:pokemonId', PokemonController.get_pokemon_by_Id);

//create pokemon
router.post('/', checkAuth, checkAdmin, PokemonController.create_pokemon);

//update pokemon
router.patch('/:pokemonId', checkAuth, checkAdmin, PokemonController.update_pokemon_by_id);

//delete pokemon
router.delete('/:pokemonId', checkAuth, checkAdmin, PokemonController.delete_pokemon);

module.exports = router;