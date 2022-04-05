const mongoose = require('mongoose');
const User = require('./user');

encounterSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pokemon: {
        pokemonId: { type: String },
        name: { type: String, required: true },
        imageUrl: { type: String, required: false },
        type: { type: Array, required: true },
        weight: { type: Number, required: false },
        height: { type: Number, required: false },
        moves: [{ type: String, required: false }]
    },
    caught: { type: Boolean, required: false, default: false }
});

module.exports = mongoose.model('Encounter', encounterSchema);