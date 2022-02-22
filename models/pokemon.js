const mongoose = require('mongoose');

pokemonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    pokeId: Number,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: { type: String, required: true, unique: true },
    nickName: { type: String, required: false },
    starter: { type: Boolean, required: true, default: false },
    type: { type: String, required: true },
    weight: { type: Number, required: false },
    height: { type: Number, required: false },
    description: String,
    abilities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ability'}]
});

module.exports = mongoose.model('Pokemon', pokemonSchema);