const mongoose = require('mongoose');
const validator = require('validator');

userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, required: true, validate: validator.isEmail}, /*adding unique: true was also an option*/
    password: { type: String, required: true, minLength: 8, maxLength: 100 }, //range validator.
    name: { type: String, required: true, unique: true },
    caughtPokemon: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Pokemon'}],
    isAdmin: {type: Boolean, required: false, default: false}
});

module.exports = mongoose.model('User', userSchema);