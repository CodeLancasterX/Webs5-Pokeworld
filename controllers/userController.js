const User = require('../models/user');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('request');
const rp = require('request-promise');
const pokemon = require('../models/pokemon');
const bcrypt = require('bcrypt');
const Pokemon = require('../models/pokemon');
const Battle = require('../models/battle');
const Encounter = require('../models/encounter');
const Move = require('../models/move');
const user = require('../models/user');
const ObjectId = require('mongoose').Types.ObjectId;

exports.get_all_users = (req, res, next) => {
    let query = req.query;
    if (req.query.limit == null){
        req.query.limit = 10
    }

    if (req.query.page == null) {
        req.query.page = 1
    }
    

    User.paginate(query, {page: req.query.page, limit: req.query.limit, select: "name" /*select: ["name", "starter"]*/})
        .then(obj => {

            if (obj.docs.length > 0) {

                const response = {
                    total: obj.totalDocs,
                    count: obj.docs.length,
                    currentPage: obj.page,
                    totalPages: obj.totalPages,
                    users: obj.docs.map(obj => {
                        return {
                            name: obj.name,
                            _id: obj._id,
                            url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + obj._id
                        }
                    })
                }

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

exports.get_user_by_id = (req, res, next) => {
    const id = req.params.userId;
    const $or = [ { name : id } ];
  
    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }

    User.findOne({$or: $or})
        .select('name caughtPokemon')
        .populate('caughtPokemon', 'id name')
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(200).json({
                    message: 'No user found for ID: ' + $or
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
    const id = req.params.userId;
    const $or = [ { name : id } ];
  
    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }

    User.findOne({$or: $or})
    .exec()
    .then( user => {
        if ( user ) {
            Encounter.find({user: user._id})
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
                    res.status(404).json({message: 'No encounters found for this user.'})
                }
            })
            .catch( err => {
                res.status(500).json({
                    error: err
                })
            })
        } else {
            res.status(404).json({
                message: 'No user found.'
            })
        }
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
    
}

exports.get_all_pokemon_by_userId = (req, res, next) => {
	
    const id = req.params.userId;
    const $or = [ { name : id } ];
  
    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }
    User.findOne({$or: $or})
    .exec()
    .then( user => {
        if ( user ) {
            Pokemon.find({owner: user._id})
            .select('name nickName _id type')
            .exec()
            .then(result => {
                if (result.length < 1) {
                    res.status(404).json({
                        message: 'No pokemon found under this trainer.'
                    })
                } else {
                    res.status(200).json({
                        count: result.length,
                        pokemon: result
                    })
                }
        
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            })
        } else {
            res.status(500).json({
                message: 'No user found.'
            })
        }
    })

}

exports.get_pokemon_by_userId = (req, res, next) => {
    // console.log(req.userData)
    const id = req.params.userId;
    const $or = [ { name : id } ];
  
    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }

    User.findOne({$or: $or})
    .exec()
    .then( user => {
        if ( user ) {
            Pokemon.findOne({$and: [{owner: {$eq: user._id}}, {_id: { $eq: req.params.pokemonId}}]})
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
        } else {
            res.status(500).json({
                message: 'No user found.'
            })
        }
    })


}

exports.get_pokemonMove_by_pokemon_with_userId = (req, res, next) => {
    const id = req.params.userId;
    const $or = [ { name : id } ];
  
    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }

    User.findOne({$or: $or})
    .exec()
    .then( user => {
        if ( user ) {
            Pokemon.findOne({$and: [{owner: {$eq: user._id}}, {_id: { $eq: req.params.pokemonId}}]})
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
        } else {
            res.status(500).json({
                message: 'No user found.'
            })
        }
    })

    
}

exports.get_battles_by_userId = (req, res, next) => {
    
    const userId = req.params.userId;
    const $or = [ { name : userId } ];
  
    if (ObjectId.isValid(userId)) {
      $or.push({ _id : ObjectId(userId) });
    }

    User.findOne({$or: $or})
    .exec()
    .then( user => {
        if ( user ) {
            User.find(user._id)
            .select('challenger defender winner')
            .exec()
            .then(result => {
                console.log(result);
                if (result) {
                    Battle.find({$or: [{
                            challenger: {$eq: user._id}
                        } , {
                            defender: {$eq: user._id}
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
        } else {
            res.status(500).json({
                message: 'No user found.'
            })
        }
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
                                    // console.log(starterCheck)
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
                                        await this.getPokeMoves(pokeMoves, movesArray, res).then(result => {
                                            // console.log(result + ' getpokemoves');
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

                                            // console.log(movesArray)
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
                                                caughtPokemon: idArray,
                                                isAdmin: req.body.isAdmin /*for testing purposes only*/
                                            });
                                            user.save()
                                                .then(result => {
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
                                                            // console.log(result);

                                                            res.status(201).json({
                                                                _id: userId.toHexString(),
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
    const $or = [ { name : userId } ];
  
    if (ObjectId.isValid(userId)) {
      $or.push({ _id : ObjectId(userId) });
    }

    User.findOne({$or: $or})
    .exec()
    .then( user => {
        if ( user ) {
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
                    user: user._id,
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
                            _id: encounter._id,
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
        } else {
            res.status(500).json({
                message: 'No user found.'
            })
        }
    })


}

exports.update_encounter = (req, res, next) => {
    const encounterId = req.params.encounterId;
    //TODO: make a randomizer for a true or false boolean to determine if pokemon is caught.
    const id = req.params.userId;
    const $or = [ { name : id } ];
  
    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }

    User.findOne({$or: $or})
    .exec()
    .then( user => {
        if ( user ) {
            Encounter.findById(encounterId)
            .exec()
            .then(encounterData => {
                if (encounterData) {
                    if (encounterData.user == user._id) {
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
                                        await getPokeMoves(encounter.pokemon.moves, movesArray, res).then(result => {
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
        } else {
            res.status(500).json({
                message: 'No user found.'
            })
        }
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
                return res.status(401).json({
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
                        _id: user[0]._id,
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

exports.update_user_by_id = async (req, res, next) => {
    // allow new email
    // allow new password 
    const id = req.params.userId;
    const email = req.body.email;
    const newEmail = req.body.newEmail;

    User.findOne({email: newEmail})
        .exec()
        .then(async uniqueResult => {
            // console.log(uniqueResult + " some text")
            if (uniqueResult != null) {
                // console.log(uniqueResult.email + " some text")
                if (uniqueResult.email == newEmail) {
                    if (uniqueResult.email == newEmail) {
                        return res.status(409).json({
                            message: 'Email already exists.'
                        })
                    }
                }
            } else {
                bcrypt.hash(req.body.password, 10, async (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const userInfo = await User.find({email: email})
                        req.body.name = userInfo.name;
                        req.body.password = hash;
                        req.body.email = req.body.newEmail;

                        //Didnt user findOneAndUpdate because updateOne shows if anything was modified.
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
                                    name: userInfo.name,
                                    email: newEmail,
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
    
    const id = req.params.userId;
    const $or = [ { name : id } ];
  
    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }

    User.findOne({$or: $or})
    .exec()
    .then( user => {
        if ( user ) {
            Pokemon.findOne({$and: [{owner: {$eq: user._id}}, {_id: {$eq: req.params.pokemonId}} ]})
            .exec()
            .then( async pokemon => {
                
                if (pokemon) {
                    const requestedMoves = req.body.moves
                    const movesArray = [];
                    
        
                    request('https://pokeapi.co/api/v2/pokemon/' + pokemon.name, async (error, response, body) => {
                        const pokeData = JSON.parse(body);
        
                        let pokeMoves = [];
        
                        //see if requested moves are learnable by pokemon. 
                        let notFound = false;
                        for (let x = 0; x < requestedMoves.length; x++) {
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
                                    return res.status(404).json({
                                        message: 'Pokemon cannot learn ' + requestedMoves[x]
                                    })
                                }
                            }
                        }
        
                        await this.getPokeMoves(pokeMoves, movesArray, res).then( async result => {
                            // console.log(result + ' getpokemoves');
                            // console.log(movesArray)
                            Pokemon.findOneAndUpdate({$and: [{owner: {$eq: user._id}}, {_id: {$eq: req.params.pokemonId}} ]}, {$set: {moves: movesArray}}, {new: true})
                            .exec()
                            .then(pokemon => {
                                res.status(200).json({
                                    result: pokemon
                                })
                            })
                            .catch()
                        }).catch( err =>{
                            res.status(500).json({
                                error: err
                            })
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
        } else {
            res.status(404).json({
                message: 'No user found.'
            })
        }
    })

  

}

exports.update_pokemon_by_userId = (req, res, next) => {
    const id = req.params.userId;
    const $or = [ { name : id } ];
  
    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }

    User.findOne({$or: $or})
    .exec()
    .then( user => {
        if ( user ) {
            Pokemon.findOneAndUpdate({$and: [{owner: {$eq: user._id}}, {_id: {$eq: req.params.pokemonId}} ]}, {$set: {nickName: req.body.nickName}}, {new: true})
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
        } else {
            res.status(500).json({
                message: 'No user found.'
            })
        }
    })

    
}

exports.delete_user_by_userId = async (req, res, next) => {
    const id = req.params.userId;
    const $or = [ { name : id } ];

    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }

    const user = await User.findOne({$or: $or})
    if (user) {
        user.deleteOne({
            _id: user._id
        })
        res.status(200).json({
            message: "User with ID/name: " + $or + " has succesfully been deleted."
        });
    } else {
        res.status(404).json({
            message: 'No user found.'
        })
    }



    // .exec()
    // .then( user => {
    //     if ( user ) {
    //         User.deleteOne({
    //             _id: user._id
    //         })
    //         .exec()
    //         .then(result => {
    //             console.log(result);
    

    //         })
    //         .catch(err => {
    //             console.log(err)
    //             res.status(500).json({
    //                 error: err
    //             });
    //         });
    //     } else {
    //         res.status(404).json({
    //             message: 'No user found.'
    //         })
    //     }
    // })

   
}

exports.delete_pokemon_by_userId = async (req, res, next) => {
    const id = req.params.userId;
    const $or = [ { name : id } ];
  
    if (ObjectId.isValid(id)) {
      $or.push({ _id : ObjectId(id) });
    }

    User.findOne({$or: $or})
    .exec()
    .then( async user => {
        if ( user ) {
            const pokemon = await Pokemon.findOne({$and: [{_id: {$eq: req.params.pokemonId}}, {owner: {$eq: user._id}}]})
            if (pokemon) {
                pokemon.deleteOne();
                     res.status(200).json({
                         message: `${pokemon.name} has been deleted.`
                     })
            } else {
                req.status(404).json({message: "No pokemon found."})
            }
        } else {
            res.status(500).json({
                message: 'No user found.'
            })
        }
    })

    
}

exports.getPokeMoves = async function getPokeMoves(pokeMoves, movesArray, res) {
    
    for (const pokeMove of pokeMoves) {
        // console.log(pokeMove + ' the move.');
        let body = await rp('https://pokeapi.co/api/v2/move/' + pokeMove);
        const moveData = await JSON.parse(body);

        //see if move is already known in database, if it is then add id to array
        //if not then api call for move info and create move.
        await Move.findOne({name: pokeMove})
        .exec()
        .then( async queriedMove => {
            if (queriedMove != null){
                // console.log(queriedMove.name + ' is already in the database! :), its ID: ' + queriedMove._id) //Uncomment to see which moves are already in the database.
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
