const Encounter = require('../models/encounter');
const mongoose = require('mongoose');
const Encounter = require('../models/encounter');

exports.get_all_encounters = (req, res, next) => {
    Encounter.find()
    .populate('user', 'name')
    .select('_id pokemon.name user caught')
    .exec()
    .then( encounters => {
        if (encounters.length > 0) {
            const response = {
                count: encounters.length,
                encounters: encounters.map( obj => {
                    return {
                        _id: obj._id,
                        name: obj.user,
                        pokemonName: obj.pokemon.name,
                        type: obj.pokemon.type,
                        moves: obj.pokemon.moves,
                        url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + obj._id
                    }
                })
            }
            res.status(200).json(response)
        } else {
            res.status(404).json({
                message: 'No encounters found.'
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
}

exports.get_encounter_by_id = (req, res, next) => {
    const encounterId = req.params.id;
    
    Encounter.findById(encounterId)
    .select('id user pokemon.pokemonId pokemon.name pokemon.imageUrl pokemon.type pokemon.moves')
    .populate('user', 'name')
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
}