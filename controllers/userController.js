const User = require('../models/user');
const mongoose = require('mongoose');

//get users
exports.get_all_users = (req, res, next) => {
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
}

//get specific user
exports.get_user_by_id = (req, res, next) => {
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
}

exports.get_encounter_by_userId = (req, res, next) => {

    Encounter.find({user: req.userData.userId})
    .exec()
    .then( encounters => {
        if (encounters.length > 0) {

            const response = {
                count: encounters.length,
                encounters: encounters.map( obj => {
                    return {
                        _id: obj._id,
                        trainer: obj.user,
                        pokemon: obj.pokemon,
                        caught: obj.caught
                    }
                })
            }

            res.status(200).json({
                response
            })
        } else {
            res.status(500).json({message: 'No encounters found for this user.'})
        }
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
}

//get user owned pokemon
exports.get_all_pokemon_by_userId = (req, res, next) => {

    Pokemon.find({owner: req.params.userId})
    .select('name nickName _id type')
    .exec()
    .then(result => {
        if (result.length < 1) {
            res.status(404).json({
                message: 'No pokemon found under this trainer.'
            })
        } else {
            res.status(200).json({
                result: result
            })
        }

    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    })

}

//get specific user owned pokemon
exports.get_pokemon_by_userId = (req, res, next) => {
    // console.log(req.userData)
    Pokemon.findOne({$and: [{owner: {$eq: req.userData.userId}}, {_id: { $eq: req.params.pokemonId}}]})
    .select('name _id type moves')
    .populate('moves', 'name')
        .exec()
        .then(result => {
            if(result) {
                res.status(200).json({
                    result: result
                })
            } else {
                res.status(404).json({
                    message: 'User has not caught pokemon or pokemon does not exist.'
                })
            }

        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}


exports.get_pokemonMove_by_pokemon_with_userId = (req, res, next) => {

    Pokemon.findOne({$and: [{owner: {$eq: req.userData.userId}}, {_id: { $eq: req.params.pokemonId}}]})
    .select('moves')
    .populate('moves', '-__v')
        .exec()
        .then(pokemon => {
            if(pokemon) {
                for (let i = 0; i < pokemon.moves.length; i++) {
                    console.log(pokemon[i])
                    if (pokemon.moves[i]._id == req.params.moveId){
                        res.status(200).json(
                           pokemon.moves[i]
                        )
                        break;
                    } else if (i == pokemon.moves.length) {
                        res.status(500).json({
                            message: 'Pokemon does not have this move.'
                        })
                    }
                }

            } else {
                res.status(404).json({
                    message: 'User has not caught pokemon or pokemon does not exist.'
                })
            }

        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}

exports.get_battles_by_userId = (req, res, next) => {
    const userId = req.params.userId
    User.findById(userId)
        .select('challenger defender winner')
        .exec()
        .then(result => {
            console.log(result);
            if (result) {
                Battle.find({$or: [{
                        challenger: {$eq: userId}
                    } , {
                        defender: {$eq: userId}
                    }]})
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
            } else {
                res.status(404).json({
                    message: 'No battles found for this user.'
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.sign_up = (req, res, next) => {
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
                        // admin can create pokemon with starter true to define starter pokemon.
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

}

exports.create_encounter = (req, res, next) => {

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
}

exports.update_encounter = (req, res, next) => {
    const encounterId = req.params.encounterId;
    //TODO: make a randomizer for a true or false boolean to determine if pokemon is caught.
    Encounter.findById(encounterId)
        .exec()
        .then(encounterData => {
            if (encounterData) {
                if (encounterData.user == req.params.userId) {
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

exports.login = (req, res, next) => {

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
}

exports.update_user_by_id = (req, res, next) => {
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
}

exports.update_pokemonMoves_by_userId = (req, res, next) => {

    if (req.body.moves.length < 4 ){
        res.status(400).json({message: 'Please submit four moves for the pokemon.'}); 
        return;
    } 
    Pokemon.findOne({$and: [{owner: {$eq: req.params.userId}}, {_id: {$eq: req.params.pokemonId}} ]})
    .exec()
    .then( async pokemon => {
        // console.log(pokemon);
        if (pokemon) {
            const requestedMoves = req.body.moves
            const movesArray = [];
            

            request('https://pokeapi.co/api/v2/pokemon/' + pokemon.name, async (error, response, body) => {
                const pokeData = JSON.parse(body);

                let pokeMoves = [];

                //see if requested moves are learnable by pokemon. 
                let notFound = false;
                for (let x = 0; x < requestedMoves.length; x++) {
                    if (!notFound) {
                        for (let y = 0; y < pokeData.moves.length; y++) {
                            // console.log(pokeData.moves[y].move.name)
                            if (pokeData.moves[y].move.name == requestedMoves[x]){
                                pokeMoves.push(requestedMoves[x])
                                break;
                            } else if (y == pokeData.moves.length - 1) {
                                if (requestedMoves[x] == null) {
                                    console.log(pokeData.moves[x] + " and " + pokemon.moves[x])
                                    requestedMoves[x] = pokemon.moves[x];
                                }
                                res.status(404).json({
                                    message: 'Pokemon cannot learn ' + requestedMoves[x]
                                })
                                notFound = true;
                                break;
                            }
                        }
                    } else {
                        break;
                    }
                }

                await getPokeMoves(pokeMoves, movesArray).then( async result => {
                    // console.log(result + ' getpokemoves');
                    console.log(movesArray)
                    Pokemon.findOneAndUpdate({$and: [{owner: {$eq: req.params.userId}}, {_id: {$eq: req.params.pokemonId}} ]}, {$set: {moves: movesArray}}, {new: true})
                    .exec()
                    .then(pokemon => {
                        res.status(200).json({
                            result: pokemon
                        })
                    })
                    .catch()
                }).catch( err =>{
                    console.log(err)
                })

             });

        } else {
            res.status(404).json({
                message: 'Pokemon could not be found.'
            })
        }
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
    })

})
}

exports.update_pokemon_by_userId = (req, res, next) => {

    Pokemon.findOneAndUpdate({$and: [{owner: {$eq: req.params.userId}}, {_id: {$eq: req.params.pokemonId}} ]}, {$set: {nickName: req.body.nickName}}, {new: true})
    .exec()
    .then( result => {
        // console.log(result);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                message: 'Pokemon could not be found.'
            })
        }
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
    })

})
}

exports.delete_user_by_userId = (req, res, next) => {
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
}

exports.delete_pokemon_by_userId = async (req, res, next) => {

    const pokemon = await Pokemon.findOne({$and: [{_id: {$eq: req.params.pokemonId}}, {owner: {$eq: req.params.userId}}]})
    if (pokemon) {
        pokemon.deleteOne();
             res.status(200).json({
                 message: `${pokemon.name} has been deleted.`
             })
    } else {
        req.status(404).json({message: "No pokemon found."})
    }
}


async function getPokeMoves(pokeMoves, movesArray) {
    
    for (const pokeMove of pokeMoves) {
        console.log(pokeMove + ' the move.');
        let body = await rp('https://pokeapi.co/api/v2/move/' + pokeMove);
        const moveData = await JSON.parse(body);

        //see if move is already known in database, if it is then add id to array
        //if not then api call for move info and create move.
        await Move.findOne({name: pokeMove})
        .exec()
        .then( async queriedMove => {
            if (queriedMove != null){
                console.log(queriedMove.name + ' is already in the database! :), its ID: ' + queriedMove._id)
                await movesArray.push(queriedMove._id);
            } else {
                const move = await Move({
                    _id: new mongoose.Types.ObjectId,
                    name: pokeMove,
                    description: moveData.effect_entries[0].effect,
                    type: moveData.damage_class.name,
                    accuracy: moveData.accuracy,
                    power: moveData.power
                })
                await move.save()
                    .then(result => {
                        movesArray.push(result._id);
                    });
            }
        })
        .catch( err => {
            res.status(500).json({
                error: err
            })
        })


    }
    return movesArray;
}