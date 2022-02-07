const express = require('express');
const router = express.Router();
const User = require('../models/users');
const mongoose = require('mongoose');


//get users
router.get('/', (req, res, next) => {
    User.find()
    .exec()
    .then(obj => {
        if(obj.length >= 1){
            res.status(200).json(obj)
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
router.post('/', (req, res, next) => {
    const user = new User({
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        pokemon: req.body.pokemon
    });

    user.save()
    .then( result => {
        console.log(result);
        res.status(200).json({
            message: "User: \`"+ user.name + "\` has been created"
        });
    })
    .catch( err => res.status(500).json({
        error: err
    }));
})

//update users
router.patch('/:userId', (req, res, next) => {
    const id = req.params.userId;

    User.updateOne({ _id: id }, {$set: {
        name: req.body.name
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

//delete users
router.delete('/:userId', (req, res, next) => {
    const Id = req.params.userId;

    User.remove({ _id: Id })
    .exec()
    .then( result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch( err => {
        res.status(500).json({
            error: err
        });
    });
})

module.exports = router;