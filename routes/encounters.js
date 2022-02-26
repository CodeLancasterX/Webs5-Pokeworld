const express = require('express');
const router = express.Router();
const Encounter = require('../models/encounter');

router.get('/', (req, res, next) => {

})

router.get('/:id', (req, res, next) => {
    const encounterId = req.params.id;
    
    Encounter.findById(encounterId)
    .select('id user pokemon.pokemonId pokemon.name pokemon.imageUrl pokemon.type pokemon.moves')
    .exec()
    .then( result => {
        // console.log(result);
        if (result){
            res.status(200).json(result);
        } else {
            return res.status(404).json({
                message: 'No encounter found for ID: ' + id + '.'
            })
        }
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;