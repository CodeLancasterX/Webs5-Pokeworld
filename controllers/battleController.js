const Battle = require('../models/battle');
const User = require('../models/user');
const mongoose = require('mongoose');

exports.get_all_battles = (req, res, next) => {

    Battle.find()
    .select('challenger defender winner')
    .populate('challenger defender winner', 'name')
    .exec()
    .then( result => {

        if (result){

            const battle = {
                count: result.length,
                battles: result.map( result => {
                    return {
                        challenger: result.challenger,
                        defender: result.defender,
                        status: result.status,
                        url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + result._id

                    }
                })
            }

            res.status(200).json(battle);
        } else {
            res.status(404).json({ message: "No battles found."})
        }
    })
    .catch( err => {
        res.status(500).json({error: err});
    })
    
}

exports.get_battle_by_id = (req, res, next) => {
    const id = req.params.id;

    Battle.findById(id)
    .select('challenger defender winner')
    .populate('challenger defender winner', 'name')
    .exec()
    .then( result => {
        if (result){
            res.status(200).json(result)
        } else {
            res.status(404).json({message: 'No battle found for ID: ' + id})
        }
        
    })
    .catch( err => {

        console.log(err);
        res.status(500).json({
            error: err    
        })
    })
}

exports.create_battle = (req, res, next) => {
    const battle = Battle({
        _id: new mongoose.Types.ObjectId,
        challenger: req.userData.userId,
        defender: req.body.defender,
        winner: null
    });
    battle.save()
    .then( result => {
        // console.log(result);

        res.status(201).json({
            message: "Battle has been created.",
            url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + battle._id
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: err});
    })
}

exports.update_battle_by_id = (req, res, next) => {
    
    const id = req.userData.userId;
    const userId = req.body.winner;
    User.findById(userId)
    .exec()
    .then( result => {
        if (result) {
            Battle.updateOne({_id: id}, {$set: {
                winner: userId
            }})
            .exec()
            .then( result => {
                console.log(result);
                if (userId) {
                    const battle = {
                        message: 'Battle with ID: '+ id + ' has been updated.',
                        _id: id,
                        url: req.protocol + '://' + req.get('host') + req.originalUrl
                    }
                    
                    res.status(201).json(battle);
                } else {
                    res.status(400).json({message: 'Use \'winner\' in the body of the request.'})
                }
            })
        } else {
            res.status(404).json({message: 'User with ID: ' + id + ' could not be found.'})
        }
    })
    .catch( err => {
        console.log(err)
        res.status(500).json({
            message: err
        })
    })
}

exports.delete_battle_by_id = (req, res, next) => {
    const id = req.params.id;
    Battle.deleteOne({ _id: id })
    .exec()
    .then( result => {
        console.log(result)
        if (result.deletedCount >= 1){
            res.status(200).json({
                message: "Battle has succesfully been deleted."
            })
        } else {
            res.status(404).json({message: 'Could not find battle with ID: ' + id})
        }

    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    });
}