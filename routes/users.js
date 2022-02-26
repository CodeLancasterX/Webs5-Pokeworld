const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Pokemon = require('../models/pokemon');
const Battle = require('../models/battle');
const Encounter = require('../models/encounter');
const Move = require('../models/move');
const checkAuth = require('../Auth/check-auth');
const jwt = require('jsonwebtoken');
const request = require('request');
const rp = require('request-promise');
const encounter = require('../models/encounter');
const pokemon = require('../models/pokemon');


//get users
router.get('/', (req, res, next) => {
    User.find()
        .select('name')
        .exec()
        .then(obj => {

            if (obj.length >= 1) {

                const response = obj.map(obj => {
                    return {
                        name: obj.name,
                        _id: obj._id,
                        url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + obj._id
                    }
                })

                res.status(200).json(response)
            } else {
                res.status(200).json({
                    message: 'No users available.'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//get specific user
router.get('/:userId', (req, res, next) => {
    const id = req.params.userId;

    User.findById(id)
        .select('name caughtPokemon')
        .populate('caughtPokemon', 'id name')
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(200).json({
                    message: 'No user found for ID: ' + id
                })
            }

        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
})

//get user owned pokemon
router.get('/:userId/pokemon', (req, res, next) => {

    User.findById(req.params.userId)
        .select('caughtPokemon')
        .populate('caughtPokemon', 'name')
        .exec()
        .then(result => {
            console.log(result);

            // caughtPokemon = {

            // }
            res.status(200).json({
                result: result
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })

})

//get specific user owned pokemon (is this useful?)
router.get('/:userId/pokemon/:pokemonId', (req, res, next) => {

    User.findById(req.params.userId)
        .exec()
        .then(result => {
            console.log(result);

            // caughtPokemon = {

            // }
            res.status(200).json({
                result: result
            })
        })
        .catch()
})

//get user battles
router.get('/:userId/battles', (req, res, next) => {
    const userId = req.params.userId
    User.findById(userId)
        .select('challenger defender winner')
        .exec()
        .then(result => {
            if (result) {
                Battle.find({
                        challenger: userId
                    } || {
                        defender: userId
                    })
                    .exec()
                    .then(battles => {
                        console.log(battles)
                        if (battles.length > 0) {
                            res.status(200).json(battles)
                        } else {
                            return res.status(404).json({
                                message: 'No battles found for this user.'
                            })
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

//create users
router.post('/signup', (req, res, next) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length > 0) {
                return res.status(409).json({
                    message: 'Email already in use.'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        //poke api does not give starter data and other api's are not functional anymore.
                        // using hardcoded starterOptions instead of starter boolean.
                        const starter = req.body.pokemon;
                        Pokemon.findOne({
                                $and: [{
                                    name: {
                                        $eq: starter
                                    },
                                    starter: {
                                        $eq: true
                                    }
                                }]
                            })
                            .exec()
                            .then(starterCheck => {
                                if (starterCheck != null) {
                                if (starterCheck.starter) {
                                    console.log(starterCheck)
                                    const caughtArray = [];
                                    const movesArray = [];
                                    caughtArray.push(starterCheck)

                                    request('https://pokeapi.co/api/v2/pokemon/' + starterCheck.name, async (error, response, body) => {
                                        const pokeData = JSON.parse(body);

                                        // console.log(body)
                                        pokeType = [];
                                        pokeData.types.forEach(element => {
                                            pokeType.push(element.type.name);
                                        });

                                        let pokemonDescription = null

                                        pokeMoves = [];
                                        //select four random abilities for pokemon.
                                        for (let i = 0; i < 4; i++) {
                                            pokeMoves.push(pokeData.moves[Math.floor(Math.random() * pokeData.moves.length)].move.name)
                                        }

                                        await getPokeMoves(pokeMoves, movesArray).then(result => {
                                            console.log(result + ' getpokemoves');
                                        }).catch(err => {
                                            console.log(err);
                                        });


                                        request('https://pokeapi.co/api/v2/pokemon-species/' + starterCheck.name, async (error, response, body) => {
                                            const speciesData = JSON.parse(body);
                                            pokemonDescription = speciesData.flavor_text_entries[0].flavor_text


                                            let pokemonImageId;
                                            if (pokeData.id < 10) {
                                                pokemonImageId = '00' + pokeData.id.toString();
                                            } else if (pokeData.id < 100) {
                                                pokemonImageId = '0' + pokeData.id.toString();
                                            } else {
                                                pokemonImageId = pokeData.id;
                                            }
                                            const imageUrl = 'https://www.serebii.net/pokemongo/pokemon/' + pokemonImageId + '.png';

                                            console.log(movesArray)
                                            const userId = new mongoose.Types.ObjectId;
                                            const pokemonId = new mongoose.Types.ObjectId;

                                            const idArray = [];
                                            idArray.push(pokemonId)
                                            caughtArray.push(pokemon._id)
                                            const user = new User({
                                                _id: userId,
                                                name: req.body.name,
                                                email: req.body.email,
                                                password: hash,
                                                caughtPokemon: idArray
                                            });
                                            user.save()
                                                .then(result => {
                                                    console.log(result);
                                                    // console.log(req)
                                                    const pokemon = Pokemon({
                                                        _id: pokemonId,
                                                        pokemonId: pokeData.id,
                                                        owner: userId,
                                                        name: pokeData.species.name,
                                                        type: pokeType,
                                                        weight: pokeData.weight,
                                                        height: pokeData.height,
                                                        description: pokemonDescription,
                                                        moves: movesArray,
                                                        imageUrl: imageUrl
                                                    })
                                                    pokemon.save()
                                                        .then(result => {
                                                            console.log(result);

                                                            res.status(201).json({
                                                                message: "User: \`" + user.name + "\` has been created.",
                                                                url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + user._id
                                                            });
                                                        })
                                                        .catch(err => res.status(500).json({
                                                            error: err
                                                        }))

                                                })
                                                .catch(err => res.status(500).json({
                                                    error: err
                                                }));
                                        })

                                    })

                                } else {
                                    return res.status(500).json({
                                        message: req.body.pokemon + ' is not a starter.'
                                    })
                                }

                            } else {
                                return res.status(500).json({
                                    message: req.body.pokemon + ' is not a starter.'
                                })
                            }
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })

})

//create encounter 
router.post('/:userId/encounters/new', /* check-auth, */ (req, res, next) => {

    const userId = req.params.userId;

    let pokemon = {};
    let randomNumber = Math.floor(Math.random() * 807) + 1;
    request(`https://pokeapi.co/api/v2/pokemon/${randomNumber}`, (error, response, body) => {
        body = JSON.parse(body);
        pokemon.pokemonId = body.id;
        pokemon.name = body.name;
        pokemon.type = [];
        body.types.forEach(element => {
            pokemon.type.push(element.type.name);
        });
        pokemon.moves = [];
        //select four random abilities for pokemon.
        for (let i = 0; i < 4; i++) {
            pokemon.moves.push(body.moves[Math.floor(Math.random() * body.moves.length)].move.name)
        }

        pokemon.height = body.height;
        pokemon.weight = body.weight;

        let pokemonImageId;
        if (pokemon.pokemonId < 10) {
            pokemonImageId = '00' + pokemon.pokemonId.toString();
        } else if (pokemon.pokemonId < 100) {
            pokemonImageId = '0' + pokemon.pokemonId.toString();
        } else {
            pokemonImageId = pokemon.pokemonId;
        }
        pokemon.imageUrl = 'https://www.serebii.net/pokemongo/pokemon/' + pokemonImageId + '.png';

        const encounter = new Encounter({
            _id: new mongoose.Types.ObjectId,
            user: userId,
            pokemon: {
                pokemonId: pokemon.pokemonId,
                name: pokemon.name,
                imageUrl: pokemon.imageUrl,
                type: pokemon.type,
                weight: pokemon.weight,
                height: pokemon.height,
                moves: pokemon.moves
            }
        })
        encounter.save()
            .then(result => {
                console.log(result);
                res.status(201).json({
                    message: "Encounter has been created.",
                    url: req.protocol + '://' + req.get('host') + '/encounters/' + encounter._id
                });
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            })
    });
})

//update encounter
router.patch('/:userId/encounters/:encounterId', /* check-auth, */ (req, res, next) => {
    const encounterId = req.params.encounterId;
    //TODO: make a randomizer for a true or false boolean to determine if pokemon is caught.
    Encounter.findById(encounterId)
        .exec()
        .then(encounterData => {
            if (encounterData) {

                if (encounterData.caught) {
                    res.status(200).json({
                        message: 'Cannot update encounter where pokemon has already been caught.'
                    })
                } else { //check
                    const caught = Math.round(Math.random()) < 1;
                    
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
                                    await getPokeMoves(encounter.pokemon.moves, movesArray).then(result => {
                                        console.log(result + ' getpokemoves');
                                    }).catch(err => {
                                        console.log(err);
                                    });
                                
                                if (encounter.pokemon.name == 'squirtle' || encounter.pokemon.name == 'charmander' || encounter.pokemon.name == 'bulbasaur') {
                                    encounter.pokemon.starter = true;
                                }
                                request('https://pokeapi.co/api/v2/pokemon-species/' + encounter.pokemon.name, async (error, response, body) => {
                                   
                                    const speciesData = JSON.parse(body);
                                    const pokemonDescription = speciesData.flavor_text_entries[0].flavor_text;





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
                                            console.log(result + ' yuuuuuuurrrr');
                                            console.log(pokemon._id)
                                            User.findOneAndUpdate({
                                                    _id: encounter.user
                                                }, {
                                                    $push: {
                                                        caughtPokemon: pokemon._id
                                                    }
                                                })
                                                .exec()
                                                .then(userData => {
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
                                console.log('dont log if true.')
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
                                error: err + 'is it this one?'
                            })
                        })
                } //check
            } else {
                res.status(404).json({
                    message: 'Encounter could not be found.'
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err + 'or this one?'
            })
        })
})


router.patch('/login', (req, res, next) => {

    User.find({
            email: req.body.email
        })
        .select('email password _id')
        .exec()
        .then(user => {
            if (user.length < 1) {
                res.status(401).json({
                    message: 'Auth failed.' /*chose not to return mail unknown message to prevent bruteforce.*/
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed.'
                    })
                }
                if (result) {
                    const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY, {
                            expiresIn: "1h"
                        })

                    res.status(200).json({
                        message: 'Auth succesful.',
                        token: token
                    })
                } else {
                    //used for wrong password which doesnt give error.
                    res.status(401).json({
                        message: 'Auth failed.'
                    })
                }


            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

//update users
router.patch('/:userId', checkAuth, (req, res, next) => {
    const id = req.params.userId; /*can also get this info from checkauth so api is more secure*/
    const email = req.body.email;
    const name = req.body.name;

    // User.find({ }) see if email already exists before updating.
    // see if email and/or name is null after using find method.

    User.find({
            email: email
        } || {
            name: name
        })
        .exec()
        .then(uniqueResult => {
            console.log(uniqueResult + " some text")
            if (uniqueResult[0] != null) {
                console.log(uniqueResult[0].email + " some text")
                if (uniqueResult[0].email == email || uniqueResult[0].name == name) {
                    if (uniqueResult[0].email == email) {
                        return res.status(409).json({
                            message: 'Email already exists.'
                        })
                    }

                    if (uniqueResult[0].name == name) {
                        return res.status(409).json({
                            message: 'Username already exists.'
                        })
                    }
                }
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        req.body.password = hash
                        User.updateOne({
                                _id: id
                            }, {
                                $set: req.body
                            })
                            .exec()
                            .then(result => {
                                // console.log(result);

                                const user = {
                                    message: 'User has been updated.',
                                    _id: id,
                                    name: name,
                                    email: email,
                                    password: hash
                                }
                                if (result.modifiedCount >= 1) {
                                    res.status(200).json(user);
                                } else if (result.modifiedCount == 0 && result.matchedCount == 1) {
                                    res.status(200).json({
                                        message: "No new fields were given for: " + id + "."
                                    });
                                } else {
                                    res.status(404).json({
                                        message: "No user found for ID: " + id + "."
                                    });
                                }

                            }).catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            })
                    }
                })

            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

//delete user
router.delete('/:userId', (req, res, next) => {
    const Id = req.params.userId;
    User.remove({
            _id: Id
        })
        .exec()
        .then(result => {
            console.log(result);

            res.status(200).json({
                message: "User with ID: " + Id + " has succesfully been deleted."
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
})

async function getPokeMoves(pokeMoves, movesArray) {
    
    for (const pokeMove of pokeMoves) {
        console.log(pokeMove + ' the move.');
        let body = await rp('https://pokeapi.co/api/v2/move/' + pokeMove);
        const moveData = await JSON.parse(body);
        const move = await Move({
            _id: new mongoose.Types.ObjectId,
            name: pokeMove,
            description: moveData.effect_entries[0].effect,
            type: moveData.damage_class.name,
            accuracy: moveData.accuracy
        })
        move.save()
            .then(result => {
                movesArray.push(result._id);
                console.log(result + 'movesupdate');


            });
    }
    return movesArray;
}

module.exports = router;