const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


//get users
router.get('/', (req, res, next) => {
    User.find()
    .select('name')
    .exec()
    .then(obj => {

        if(obj.length >= 1){

            const response = obj.map( obj => {
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
    .catch( err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

//get specific user
router.get('/:userId', (req, res, next) => {
    const id = req.params.userId;
    
    User.findById(id)
    .select('name')
    .exec()
    .then( result => {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(200).json({
                message: 'No user found for ID: ' + id
            })
        }
        
    })
    .catch( err => {
        res.status(500).json({
            error: err
        });
    });
})


//create users
router.post('/signup', (req, res, next) => {
    
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                error: err
            })
        } else {
            const user = new User({
                _id: new mongoose.Types.ObjectId,
                name: req.body.name,
                email: req.body.email,
                password: hash,
                pokemon: req.body.pokemon
            });
            
            user.save()
            .then( result => {
                console.log(result);
                res.status(201).json({
                    message: "User: \`"+ user.name + "\` has been created",
                    url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + user._id
                });
            })
            .catch( err => res.status(500).json({
                error: err
            }));
        }
    })


})

//update users
router.patch('/:userId', (req, res, next) => {
    const id = req.params.userId;

    User.updateOne({ _id: id }, {$set: {
        name: req.body.name
    }})
    .exec()
    .then( result => {
        console.log(result);
        const user = {
            message: req.body.name + ' has been updated.',
            _id: res._id,
            name: res.name
        }
        if (result.modifiedCount >= 1){
            res.status(200).json(user);
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
    User.remove({ _id: Id })
    .exec()
    .then( result => {
        console.log(result);

        res.status(200).json({
            message: "User has succesfully been deleted."
        });
    })
    .catch( err => {
        res.status(500).json({
            error: err
        });
    });
})

module.exports = router;