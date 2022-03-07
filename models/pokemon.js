const res = require('express/lib/response');
const mongoose = require('mongoose');
const User = require('./user');

pokemonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    pokemonId: Number,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, unique: false},
    nickName: { type: String, required: false },
    starter: { type: Boolean, required: true, default: false },
    type: [{ type: String, required: false }],
    weight: { type: Number, required: false },
    height: { type: Number, required: false },
    description: String,
    moves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Move' }],
    imageUrl: { type: String, required: false }
});

pokemonSchema.pre('deleteOne', {document:true}, function(next) {
    User.findOneAndUpdate(
        { _id: this.owner}, 
        { $pull: { caughtPokemon: this._id }},
        {new:true})
    .exec()
    .then( result => {console.log(result)})
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
    next();
})

module.exports = mongoose.model('Pokemon', pokemonSchema);