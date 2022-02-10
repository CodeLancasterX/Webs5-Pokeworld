const mongoose = require('mongoose');

pokemonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    nickName: String,
    description: String,
    heldItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item'}
});

module.exports = mongoose.model('Pokemon', pokemonSchema);