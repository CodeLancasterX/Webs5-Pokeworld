const express = require('express');
const mongoose = require('mongoose');
const BattleRequest = require('../models/battleRequest');
const router = express.Router();


router.get('/', (req, res, next) => {
    BattleRequest.find()
    .select('_id challenger defender status')
    .populate('challenger defender', 'name')
    .exec()
    .then( obj => {

        if ( obj.length >= 1 ){
            const battleRequest = {
                count: obj.count,
                battleRequest: obj.map( obj => {
                    return {
                        id: obj.id,
                        challenger: obj.challenger,
                        defender: obj.defender,
                        status: obj.status
                    }
                })
            }
    
            res.status(200).json(battleRequest);
        } else {
            res.status(200).json({message: "No battle requests available."})
        }

    })
    .catch( err => {
        console.log(err)
        res.status(500).json({error: err});
    })
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    BattleRequest.findById(id)
    .select('_id challenger defender status')
    .populate('challenger defender', 'name')
    .exec()
    .then( result => {
        console.log(result);

        if (result) {
            res.status(200).json(result)
        } else {
            res.status(200).json({ message: 'No battle request found for ID: ' + id })
        }
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({ message: err })
    })
});

router.post('/', (req, res, next) => {
    
    const battleRequest = new BattleRequest({
        _id: new mongoose.Types.ObjectId,
        challenger: req.body.challenger,
        defender: req.body.defender,
        status: req.body.status
    })

    battleRequest.save()
    .then( result => {
        console.log(result);
        res.status(201).json({
            message: "Battle Request was sent, only status can be edited.",
            url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + battleRequest._id
        })
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            message: err
        });
    });


});

router.patch('/:id', (req, res, next) => {
    
    const id = req.params.id;

    BattleRequest.updateOne({_id: id}, {$set: {
        status: req.body.status
    }})
    .exec()
    .then( result => {
        console.log(result);
        if (req.body.status) {
            const battleRequest = {
                message: 'battle request with ID: '+ id + ' has been updated.',
                _id: id,
                url: req.protocol + '://' + req.get('host') + req.originalUrl
            }
            
            res.status(201).json(battleRequest);
        } else {
            res.status(200).json({message: 'Use \'status\' in the body of the request.'})
        }

    })
    .catch( err => {
        console.log(err)
        res.status(500).json({
            message: err
        })
    })
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    BattleRequest.deleteOne({ _id: id })
    .exec()
    .then( result => {
        console.log(result)
        res.status(200).json({
            message: "Battle request has succesfully been deleted."
        });
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router;