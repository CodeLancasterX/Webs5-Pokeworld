const Pokemon = require('../models/pokemon');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();


//get pokemon
router.get('/', (req, res, next) => {
    Pokemon.find()
    .exec()
    .then(obj => {
        if (obj.length >= 1){
            res.status(200).json(obj);
        } else {
            res.status(200).json({
                message: 'no pokemon available.'
            })
        }
        console.log(obj);

    })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}); 

//get specific pokemon
router.get('/:pokemonId', (req, res, next) => {
    const id = req.params.pokemonId;
    Pokemon.findById(id)
    .exec()
    .then( obj => {
        console.log(obj)
        if (obj) {
            res.status(200).json(obj)
        } else {
            res.status(404).json({
                message: 'No valid object found for ID: ' + id
            })
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
})

//create pokemon
router.post('/', (req, res, next) => {
    const pokemon = new Pokemon({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        nickName: req.body.nickName
    });
    //exec turn the following into a promise
    pokemon.save().then(result => {
        console.log(result);
    })
    .catch(err => console.log(err));

    res.status(201).json({
        message: 'posting pokemon route ready.',
        createdPokemon: pokemon
    })
})

//update pokemon
router.patch('/:pokemonId', (req, res, next) => {
    const id = req.params.pokemonId;

    // const updateOps = {};
    
    // for (const ops in req.body) {
    //     updateOps[ops.propName] = ops.value; 
    // };

    Pokemon.updateOne({ _id: id }, {$set: {
        name: req.body.name,
        nickName: req.body.customName
    }})
    .exec()
    .then( result => {
        console.log(res);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
})

//delete pokemon
router.delete('/:pokemonId', (req, res, next) => {
    const id = req.params.pokemonId;
    Pokemon.remove({ _id: id })
    .exec()
    .then( result => {
        res.status(200).json(result);
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    });
})

module.exports = router;