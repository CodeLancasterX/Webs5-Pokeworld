const mongoose = require('mongoose');
const Encounter = require('../models/encounter');
const User = require('../models/user');
const userController = require('../controllers/userController');
const request = require('request');
const Pokemon = require('../models/pokemon');

exports.get_all_encounters = (req, res, next) => {
    let query = req.query;
    if (req.query.limit == null){
        req.query.limit = 10
    }

    if (req.query.page == null) {
        req.query.page = 1
    }
    console.log(query)
    Encounter.paginate(query, {page: req.query.page, limit: req.query.limit, populate: ({ path: 'user', select: 'name' }) /*select: ["name", "starter"]*/})
    .then( encounters => {
        if (encounters.docs.length > 0) {
            console.log(encounters)
            const response = {
                total: encounters.totalDocs,
                count: encounters.docs.length,
                currentPage: encounters.page,
                totalPages: encounters.totalPages,
                encounters: encounters.docs.map( obj => {
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
    
    Encounter.findOne({_id: encounterId})
    .select('id user pokemon.pokemonId pokemon.name pokemon.imageUrl pokemon.type pokemon.moves')
    .populate('user', 'name')
    .exec()
    .then( result => {
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

exports.create_encounter = (req, res, next) => {
    const userId = req.userData.userId

    User.findById(userId)
    .exec()
    .then( user => {
        if (user) {
            const encounter = Encounter({
                _id: new mongoose.Types.ObjectId,
                user: userId,
                pokemon: {
                    pokemonId: req.body.pokemon.pokemonId,
                    name: req.body.pokemon.name,
                    imageUrl: req.body.pokemon.imageUrl,
                    type: req.body.pokemon.type,
                    weight: req.body.pokemon.weight,
                    height: req.body.pokemon.height,
                    moves: req.body.pokemon.moves
                },
                caught: req.body.caught
            })
            encounter.save()
            .then( result => {
                res.status(201).json({
                    _id: encounter._id,
                    message: "Encounter has been created.",
                    url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + encounter._id
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err});
            })
        } else {
            res.status(404).json({
                message: `No users found for ID: ${this.user}.`
            });
        }
    })
    .catch( err => {
        res.status(500).json({
            error: err
        });
    })
    

}

exports.update_encounter = async (req, res, next) => {
    const encounterId = req.params.encounterId;

    Encounter.findById(encounterId)
            .exec()
            .then(encounterData => {
                if (encounterData) {
                    if (encounterData.user != req.userData._id) {
                    if (encounterData.caught) {
                        res.status(200).json({
                            message: 'Cannot update encounter where pokemon has already been caught.'
                        })
                    } else { //check
                        const caught = req.body.caught
                        
                        Encounter.updateOne({
                                _id: encounterId
                            }, {
                                $set: {
                                    caught: caught
                                }
                            })
                            .exec()
                            .then(async result => {
                                const encounter = {
                                    _id: encounterData._id,
                                    user: encounterData.user,
                                    pokemon: encounterData.pokemon,
                                    caught: caught
                                }

                                if (result.modifiedCount >= 1) {
    
                                    //if pokemon is caught create a new Pokemon and udpate  
                                        //Get move info, create new move object, set new pokemon property moves to 
                                        const movesArray = [];
                                        await userController.getPokeMoves(encounter.pokemon.moves, movesArray, res).then(result => {
                                            // console.log(result + ' getpokemoves');
                                        }).catch(err => {
                                            console.log(err);
                                        });

                                    if (encounter.pokemon.name == 'squirtle' || encounter.pokemon.name == 'charmander' || encounter.pokemon.name == 'bulbasaur') {
                                        encounter.pokemon.starter = true;
                                    }

                                    request('https://pokeapi.co/api/v2/pokemon-species/' + encounter.pokemon.name, async (error, response, body) => {
                                        const speciesData = JSON.parse(body);
                                        let pokemonDescription = '';
                                        
                                        for (let i = 0; i < speciesData.flavor_text_entries.length; i++) {
                                            if (speciesData.flavor_text_entries[i].language.name == 'en') {
                                                pokemonDescription = speciesData.flavor_text_entries[i].flavor_text;
                                                break;
                                            }
                                        }

                                        const pokemon = Pokemon({
                                            _id: new mongoose.Types.ObjectId,
                                            pokemonId: encounter.pokemon.pokemonId,
                                            owner: encounter.user,
                                            name: encounter.pokemon.name,
                                            nickName: encounter.pokemon.nickName,
                                            starter: encounter.pokemon.starter,
                                            type: encounter.pokemon.type,
                                            weight: encounter.pokemon.weight,
                                            height: encounter.pokemon.height,
                                            description: pokemonDescription,
                                            moves: movesArray,
                                            imageUrl: encounter.pokemon.imageUrl
                                        })

                                        pokemon.save()
                                            .then(result => {
                                                // console.log(pokemon._id)
                                                User.findOneAndUpdate({
                                                        _id: encounter.user
                                                    }, {
                                                        $push: {
                                                            caughtPokemon: pokemon._id
                                                        }
                                                    })
                                                    .exec()
                                                    .then(userData => {
                                                        encounter.userId = userData._id,
                                                        encounter.pokemonId = pokemon._id
                                                        encounter.message = 'You caught ' + encounterData.pokemon.name + '!'
                                                        encounter.update = encounterData.pokemon.name + ' has been added to your team.'
                                                        encounter.pokeUrl = req.protocol + '://' + req.get('host') + '/pokemon/' + pokemon._id
                                                        res.status(201).json(encounter);
                                                    })
                                                    .catch(err => {
                                                        res.status(500).json({
                                                            error: err
                                                        })
                                                    })
                                            })
                                            .catch(err => {
                                                res.status(500).json({
                                                    error: err
                                                })
                                            })
                                    })
    
                                } else if (!encounter.caught && result.matchedCount == 1) {
                                    //if pokemon is not caught but the encounterId exists then tell user it got away.
                                    // console.log('dont log if true.')
                                    encounter.message = encounterData.pokemon.name + ' got away.'
                                    res.status(200).json(encounter);
                                } else {
                                    res.status(500).json({
                                        error: 'something went wrong.'
                                    })
                                }
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            })
                    } //check
                } else {
                    res.status(400).json({
                        message: "Cannot update encounter of another user."
                    })
                }
                } else {
                    // console.log("check encdata.")
                    res.status(404).json({
                        message: 'Encounter could not be found.'
                    })
                }
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            })
}

exports.delete_encounter_by_id = async (req, res, next) => {
    const encounterId = req.params.id;
    console.log(encounterId)
    const encounter = await Encounter.findOne({_id: encounterId})
    if (encounter) {
        encounter.deleteOne({_id: encounterId});
             res.status(200).json({
                 message: `${encounter.name} has been deleted.`
             })
    } else {
        req.status(404).json({message: `No encounter found for ID: ${encounterId}.`})
    }
}