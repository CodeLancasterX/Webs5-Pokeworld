const mongoose = require('mongoose');

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

module.exports = mongoose.model('Pokemon', pokemonSchema);