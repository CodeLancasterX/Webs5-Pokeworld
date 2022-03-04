const express = require('express');
const router = express.Router();
const Move = require('../models/move');

//get all moves
router.get('/', (req, res, next) => {
    Move.find()
    .select('-__v')
    .exec()
    .then( result => {
        if (result.length > 0){
            res.status(200).json(result)
        } else {
            res.status(404).json({
                message: 'Could not find any moves.'
            })
        }
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
    
})

//get specific move.
router.get('/:moveId', (req, res, next) => {
    Move.findOne({_id: req.params.moveId})
    .select('-__v')
    .exec()
    .then( result => {
        if (result){
            res.status(200).json(result)
        } else {
            res.status(404).json({
                message: 'Could not find any move with ID: ' + req.params.moveId
            })
        }
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;