const mongoose = require('mongoose');
const Item = require('./items');

pokemonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    nickName: String,
    description: String,
    // heldItem: Item
});

module.exports = mongoose.model('Pokemon', pokemonSchema);