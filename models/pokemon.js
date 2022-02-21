const mongoose = require('mongoose');

pokemonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true },
    nickName: { type: String, required: false },
    starter: { type: Boolean, required: true, default: false },
    description: String,
    // heldItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item'}
});

module.exports = mongoose.model('Pokemon', pokemonSchema);