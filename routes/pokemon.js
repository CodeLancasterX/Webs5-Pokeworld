const express = require('express');
const checkAuth = require('../Auth/check-auth');
const PokemonController = require('../Controllers/PokemonController');
const router = express.Router();

//get pokemon
router.get('/', PokemonController.get_all_pokemon); 

//get specific pokemon
router.get('/:pokemonId', PokemonController.get_pokemon_by_Id);

//create pokemon
router.post('/', checkAuth, PokemonController.create_pokemon);

//update pokemon
router.patch('/:pokemonId', checkAuth, PokemonController.edit_pokemon);

//delete pokemon
router.delete('/:pokemonId', PokemonController.delete_pokemon);

module.exports = router;