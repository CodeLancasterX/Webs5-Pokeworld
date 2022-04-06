const mongoose = require('mongoose');
const validator = require('validator');
const Encounter = require('./encounter');
const Pokemon = require('./pokemon');

userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, required: true, validate: validator.isEmail}, /*adding unique: true was also an option*/
    password: { type: String, required: true, minLength: 8, maxLength: 100 }, //range validator.
    name: { type: String, required: true, unique: true },
    caughtPokemon: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Pokemon'}],
    isAdmin: {type: Boolean, required: false, default: false}
});

userSchema.pre('deleteOne', {document:true}, async function(next) {
    const userOwnedPokemon = await Pokemon.find({owner: this._id});
    await Pokemon.deleteMany({_id: {$in: userOwnedPokemon}})

    const userEncounters = await Encounter.find({user: this._id});
    await Encounter.deleteMany({_id: {$in: userEncounters}})
    next();
})

module.exports = mongoose.model('User', userSchema);