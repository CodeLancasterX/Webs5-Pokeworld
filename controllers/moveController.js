const Move = require('../models/move');
const mongoose = require('mongoose');

//get all moves
exports.get_all_moves = (req, res, next) => {
    let query = req.query;
    if (req.query.limit == null){
        req.query.limit = 10
    }

    if (req.query.page == null) {
        req.query.page = 1
    }

    Move.paginate(query, {page: req.query.page, limit: req.query.limit/*select: ["name", "starter"]*/})
    .then( result => {
        if (result.docs.length > 0){
            const moves = {
                total: result.totalDocs,
                count: result.docs.length,
                currentPage: result.page,
                totalPages: result.totalPages,
                moves: result.docs.map( obj => {
                    return {
                        _id: obj._id,
                        name: obj.name,
                        description: obj.description,
                        type: obj.type,
                        accuracy: obj.accuracy,
                        url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + obj._id
                    }
                })
            }
            res.status(200).json(moves)
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
    
}

//get specific move.
exports.get_move_by_id = (req, res, next) => {
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
}

exports.create_move =  (req, res, next) => {
    const move = Move({
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        accuracy: req.body.accuracy,
        power: req.body.power
    })
    move.save()
    .then(result => {
        console.log(result);

        res.status(201).json({
            _id: move._id,
            message: "Move: \`" + move.name + "\` has been created.",
            url: req.protocol + '://' + req.get('host') + req.baseUrl + '/' + move._id
        });
    })
    .catch(err => res.status(500).json({
        error: err
    }))
}

exports.update_move_by_id = (req, res, next) => {
    const moveId = req.params.moveId;
    Move.findByIdAndUpdate(moveId, {$set:req.body}, {new:true})
    .select('-__v')
    .exec()
    .then( move => {
        if (move) {
            res.status(201).json(move)
            //TODO: finish move update.
        } else {
            res.status(500).json({
                message: `No move found with ID: ${moveId}.`
            })
        }
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
}

exports.delete_move_by_id = async (req, res, next) => {
    const moveId = req.params.moveId;

    const move = await Move.findOne({_id: moveId})
    if (move) {
        move.deleteOne();
             res.status(200).json({
                 message: `${move.name} has been deleted.`
             })
    } else {
        req.status(404).json({message: `No move found for ID: ${moveId}.`})
    }
}