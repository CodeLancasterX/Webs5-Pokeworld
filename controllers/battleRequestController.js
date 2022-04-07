const BattleRequest = require('../models/battleRequest');
const mongoose = require('mongoose');
const Battle = require('../models/battle');
const User = require('../models/user');

exports.get_all_battleRequests = (req, res, next) => {
    BattleRequest.find()
    .select('_id challenger defender status')
    .populate('challenger defender', 'name')
    .exec()
    .then( obj => {
        if ( obj.length >= 1 ){
            const battleRequest = {
                count: obj.length,
                battleRequests: obj.map( obj => {
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
}

exports.get_battleRequest_by_id = (req, res, next) => {
    const id = req.params.id;
    BattleRequest.findById(id)
    .select('_id challenger defender status')
    .populate('challenger defender', 'name')
    .exec()
    .then( result => {
        // console.log(result);

        if (result) {
            res.status(200).json(result)
        } else {
            res.status(404).json({ message: 'No battle request found for ID: ' + id })
        }
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({ message: err })
    })
}

exports.create_battleRequest = (req, res, next) => {
    User.findById(req.body.defender)
    .exec()
    .then( defenderData => {
        if ( defenderData) {
            //check if battlrequest with pending status exists, if not then continue else return message that request exists.
            BattleRequest.find({$and: [{challenger: {$eq: req.body.challenger}} , {defender: {$eq: req.body.defender}} , {status: {$eq: 'Pending'}}]})
            .exec()
            .then( brCheck => {
                // console.log(brCheck);
                if (brCheck.length < 1){
                    const battleRequest = new BattleRequest({
                        _id: new mongoose.Types.ObjectId,
                        challenger: req.body.challenger,
                        defender: req.body.defender,
                        status: req.body.status
                    })
                
                    battleRequest.save()
                    .then( result => {
                        // console.log(result);
                        res.status(201).json({
                            _id: battleRequest._id,
                            message: "Battle Request was sent, only status can be edited.",
                            url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + battleRequest._id
                        })
                    })
                    .catch( err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                } else {
                    return res.status(409).json({
                        message: 'An existing request is still pending for these users.'
                    })
                }
            })
            .catch( err => res.status(500).json({
                error: err
            }))


        } else {
            res.status(404).json({
                message: "Challenged user could not be found."
            })
        }
    } )
    .catch( err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

//if accepted create new battle.
exports.update_battleRequest_by_id = (req, res, next) => {
    //no new request may be made if one is still pending.
    const id = req.params.id;
    const status = req.body.status;

    BattleRequest.findById(id)
    .exec()
    .then( battleCheck => {
        // if(battle)
        //checking status before update.
        if (!battleCheck) {
            return res.status(404).json({
                message: `No battle could be found for ID: ${id}.`
            })
        }
        if (battleCheck.status == 'Accepted') {
            return res.status(400).json({
                message: `Cannot modify a battle with \'${battleCheck.status}\' status.`
            })
        } else {
            BattleRequest.updateOne({_id: id}, {$set: {
                status: status
            }})
            .exec()
            .then( result => {
                console.log(result);
                if (result.matchedCount > 0) {
                    if (result.modifiedCount < 1) {
                        return res.status(200).json({
                            message: "No new values have been given."
                        });
                    }
                    if (status) {
                        const battleRequest = {
                            message: 'Battle request with ID: '+ id + ' has been updated.',
                            _id: id,
                            status: status,
                            battleRequestUrl: req.protocol + '://' + req.get('host') + req.originalUrl
                        }
            
                        if (status == 'Accepted') {
                            BattleRequest.findById(id)
                            .exec()
                            .then( BrData => {
                                const winner = [BrData.challenger, BrData.defender];
                                const battle = new Battle({
                                    _id: new mongoose.Types.ObjectId,
                                    challenger: BrData.challenger,
                                    defender: BrData.defender,
                                    winner: winner[Math.round(Math.random())]  /*calculate winner 50/50 math thingy.*/
                                })
                                battle.save()
                                .then( battleResult => {
                                    console.log(battleResult);
                                    battleRequest.battleId = battle._id;
                                    battleRequest.message = 'Battle request with ID: '+ id + ' has been updated.';
                                    battleRequest.battleUrl = req.protocol + '://' + req.get('host') + '/' + 'battles/'+ battle._id
                                    return res.status(201).json(battleRequest);
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({ error: err});
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).json({
                                    error: err
                                })
                            })
          
                        } else {
                            res.status(201).json(battleRequest);
                        }
                        
                    } else {
                        res.status(400).json({message: 'Use \'status\' in the body of the request.'})
                    }
                } else {
                    res.status(404).json({
                        message: "No battle request found for id: " + id +"."
                    })
                }
        
        
            })
            .catch( err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
        }
    } )
    .catch( err => res.status(500).json({error: err}));   
}

exports.delete_battleRequest_by_id =  (req, res, next) => {
    const id = req.params.id;
    BattleRequest.deleteOne({ _id: id })
    .exec()
    .then( result => {
        console.log(result)
        if (result.deletedCount < 1) {
            return res.status(404).json({
                message: 'No battle request could be found for id ' + id + '.'
            })
        } else {
            res.status(200).json({
                message: "Battle request has succesfully been deleted."
            });
        }
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    });
}