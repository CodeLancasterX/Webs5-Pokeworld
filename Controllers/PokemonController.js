const Pokemon = require('../models/pokemon');

exports.get_all_pokemon = (req, res, next) => {
    Pokemon.find()
    .select('name nickName')
    .exec()
    .then(obj => {

        if (obj.length >= 1){

            const response = {
                count: obj.length,
                pokemon: obj.map( obj => {
                    return {
                        name: obj.name,
                        nickName: obj.nickName,
                        _id: obj._id,
                        url: req.protocol + '://' + req.get('host') + req.originalUrl + '/' + obj._id
                    }
                })
            }
            console.log(response);
            res.status(200).json(response);

        } else {
            res.status(200).json({
                message: 'No pokemon available.'
            })
        }
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.get_pokemon_by_Id = (req, res, next) => {
    const id = req.params.pokemonId;
    Pokemon.findById(id)
    .select('name nickName')
    .exec()
    .then( obj => {
        console.log(obj)
        if (obj) {
            res.status(200).json(obj)
        } else {
            res.status(404).json({
                message: 'No pokemon found for ID: ' + id
            })
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
}