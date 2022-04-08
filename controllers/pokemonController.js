const Pokemon = require('../models/pokemon');
const mongoose = require('mongoose');

exports.get_all_pokemon = (req, res, next) => {
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
}

exports.get_pokemon_by_Id = (req, res, next) => {
    const id = req.params.pokemonId;
    Pokemon.findById(id)
    .populate('moves', 'name power')
    .select('-_v')
    .exec()
    .then( obj => {
        // console.log(obj)
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
}

exports.get_all_starter_pokemon = (req, res, next) => {
    Pokemon.find({starter: true})
    .select('name')
    .exec()
    .then(obj => {
        if (obj.length >= 1){

            const response = {
                count: obj.length,
                pokemon: obj.map( obj => {
                    return {
                        _id: obj._id,
                        name: obj.name,
                        url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + obj._id
                    }
                })
            }
            res.status(200).json(response);

        } else {
            res.status(200).json({
                message: 'No starters available.'
            })
        }
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.create_pokemon = (req, res, next) => {
    const pokemon = new Pokemon({
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        starter: req.body.starter
    });
    //exec turn the following into a promise
    pokemon.save().then(result => {
        // console.log(result);

        res.status(201).json({
            _id: pokemon._id,
            message: "Pokemon: \`"+ pokemon.name + "\` has been created.",
            url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + pokemon._id
        });
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });

}

exports.update_pokemon_by_id = (req, res, next) => {
    const id = req.params.pokemonId;

    Pokemon.updateOne({ _id: id }, {$set: {
        name: req.body.name,
        nickName: req.body.nickName
    }})
    .exec()
    .then( result => {
        // console.log(result);
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
}

exports.delete_pokemon = async (req, res, next) => {
    const pokemonId = req.params.pokemonId;
    const pokemon = await Pokemon.findById(pokemonId);
    if (pokemon) {
        pokemon.deleteOne();
             res.status(200).json({
                 message: `${pokemon.name} has been deleted.`
             })
    } else {
        req.status(404).json({message: `No pokemon found for ID: ${pokemonId}.`})
    }
}