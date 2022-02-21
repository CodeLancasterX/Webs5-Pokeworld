const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Pokemon = require('../models/pokemon');
const Battles = require('../models/battle');
// const checkAuth = require('../Auth/check-auth');
const jwt = require('jsonwebtoken');


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
        .catch()

})

//get specific user owned pokemon (is this useful?)
router.get('/:userId/:pokemonId', (req, res, next) => {

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
router.get('/:userId/battles')

//create users
router.post('/signup', (req, res, next) => {

    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            console.log(user)
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
                        //start by checking if pokemon in body is a starter pokemon.
                        //do so by adding a starter field to pokemon?
                        //see if body.pokemon can be found.
                        //if not null then check if starterCheck.starter == true
                        const starter = req.body.pokemon;
                        // const starterOptions = ['Bulbasaur', 'Squirtle', 'Charmander']
                        Pokemon.findOne({
                                name: starter
                            })
                            .exec()
                            .then(starterCheck => {
                                if (starterCheck.starter) {
                                    console.log(starterCheck)
                                    const user = new User({
                                        _id: new mongoose.Types.ObjectId,
                                        name: req.body.name,
                                        email: req.body.email,
                                        password: hash,
                                        caughtPokemon: starterCheck._id
                                    });
                                    user.save()
                                        .then(result => {
                                            console.log(result);
                                            // console.log(req)
                                            res.status(201).json({
                                                message: "User: \`" + user.name + "\` has been created",
                                                url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + user._id
                                            });
                                        })
                                        .catch(err => res.status(500).json({
                                            error: err
                                        }));
                                } else {
                                    return res.status(500).json({
                                        message: 'Pokemon is not a starter.'
                                    })
                                }
                            })
                            .catch()
                    }
                })
            }
        })

})

router.patch('/login', (req, res, next) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length < 1) {
                res.status(401).json({
                    message: 'Auth failed.' /*chose not to return mail unknown message to prevent bruteforce.*/
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    res.status(401).json({
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
                }

                // res.status(401).json({
                //     message: 'Auth failed.'
                // })
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
router.patch('/:userId', (req, res, next) => {
    const id = req.params.userId;

    // User.find({ })

    User.updateOne({
            _id: id
        }, {
            $set: {
                name: req.body.name,
                email: req.body.email
            }
        })
        .exec()
        .then(result => {
            console.log(result);
            const user = {
                message: req.body.name + ' has been updated.',
                _id: id,
                name: req.body.name,
                email: req.body.email
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

module.exports = router;