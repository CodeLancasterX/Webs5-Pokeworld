const mongoose = require('mongoose');
const validator = require('validator');

userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, required: true, validate: validator.isEmail},
    password: { type: String, required: true },
    name: { type: String, required: true },
    caughtPokemon: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon'}
});

module.exports = mongoose.model('User', userSchema);