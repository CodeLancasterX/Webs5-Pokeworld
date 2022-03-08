const express = require('express');
const checkAuth = require('../Auth/check-auth');
const checkAdmin = require('../Auth/check-admin');
const PokemonController = require('../Controllers/pokemonController');
const router = express.Router();

//get pokemon
router.get('/', PokemonController.get_all_pokemon); 

//get specific pokemon
router.get('/:pokemonId', PokemonController.get_pokemon_by_Id);

//create pokemon
router.post('/', checkAuth, checkAdmin, PokemonController.create_pokemon);

//update pokemon
router.patch('/:pokemonId', checkAuth, checkAdmin, PokemonController.edit_pokemon);

//delete pokemon
router.delete('/:pokemonId', checkAuth, checkAdmin, PokemonController.delete_pokemon);

module.exports = router;