const Pokemon = require('../models/pokemon');
const express = require('express');
const mongoose = require('mongoose');
const checkAuth = require('../Auth/check-auth');
const router = express.Router();

//get pokemon
router.get('/', (req, res, next) => {
    Pokemon.find()
    .select('name nickName')
    .exec()
    .then(obj => {

        if (obj.length >= 1){

            const response = {
                count: obj.length,
                pokemon: obj.map( obj => {
                    return {
                        name: obj.name,
                        nickName: obj.nickName,
                        _id: obj._id,
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
router.get('/:pokemonId', (req, res, next) => {
    const id = req.params.pokemonId;
    Pokemon.findById(id)
    .select('name nickName')
    .exec()
    .then( obj => {
        console.log(obj)
        if (obj) {
            res.status(200).json(obj)
        } else {
            res.status(404).json({
                message: 'No pokemon found for ID: ' + id
            })
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
})

//create pokemon
router.post('/', checkAuth, (req, res, next) => {
    const pokemon = new Pokemon({
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        starter: req.body.starter
    });
    //exec turn the following into a promise
    pokemon.save().then(result => {
        console.log(result);

        res.status(201).json({
            message: "Pokemon: \`"+ pokemon.name + "\` has been created",
            url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + pokemon._id
        });
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });

})

//update pokemon
router.patch('/:pokemonId', (req, res, next) => {
    const id = req.params.pokemonId;

    Pokemon.updateOne({ _id: id }, {$set: {
        name: req.body.name,
        nickName: req.body.nickName
    }})
    .exec()
    .then( result => {
        console.log(result);
        const pokemon = {
            message: req.body.name + " has been updated.",
            _id: id,
            url: req.protocol + '://' + req.get('host') + req.originalUrl
        }
        if (result.modifiedCount >= 1){
            res.status(200).json(pokemon);
        } else {
            res.status(404).json({
                message: "No pokemon found for ID: " + id + "."
            });
        }
        
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
        console.log(result)
        res.status(200).json({
            message: "Pokemon has succesfully been deleted."
        });
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    });
})

module.exports = router;