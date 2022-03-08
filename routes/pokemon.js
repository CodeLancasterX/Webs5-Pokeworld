const express = require('express');
const checkAuth = require('../auth/check-auth');
const checkAdmin = require('../auth/check-admin');
const PokemonController = require('../controllers/pokemonController');
const router = express.Router();

//get pokemon
router.get('/', (req, res, next) => {
    Pokemon.find()
    .populate('owner', 'name ')
    .select('name nickName')
    .exec()
    .then(obj => {

        if (obj.length >= 1){

            const response = {
                count: obj.length,
                pokemon: obj.map( obj => {
                    return {
                        _id: obj._id,
                        name: obj.name,
                        owner: obj.owner,
                        url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + obj._id
                    }
                })
            }
            console.log(response);
            res.status(200).json(response);

        } else {
            res.status(200).json({
                message: 'No pokemon available.'
            })
        }
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}); 

//get specific pokemon
router.get('/:pokemonId', PokemonController.get_pokemon_by_Id);

//create pokemon
router.post('/', checkAuth, checkAdmin, PokemonController.create_pokemon);

//update pokemon
router.patch('/:pokemonId', checkAuth, checkAdmin, PokemonController.edit_pokemon);

//delete pokemon
router.delete('/:pokemonId', checkAuth, checkAdmin, PokemonController.delete_pokemon);

module.exports = router;