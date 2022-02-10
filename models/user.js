const mongoose = require('mongoose');

userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    caughtPokemon: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon'}
});

module.exports = mongoose.model('User', userSchema);