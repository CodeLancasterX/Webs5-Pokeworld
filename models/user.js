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

//TODO: test.
// userSchema.pre('deleteOne', {document:true}, function(next) {
//     const userOwnedPokemon = await Pokemon.find({ _owner: this.owner});
//     for (let pokeIndex = 0; pokeIndex < userOwnedPokemon.length; pokeIndex++) {
//         await userOwnedPokemon[pokeIndex].deleteOne();
//     }

//     const userEncounters = await Encounter.find({user: this._id});
//     for (let pokeIndex = 0; pokeIndex < userEncounters.length; pokeIndex++) {
//         await userEncounters[pokeIndex].deleteOne();
//     }

//     next();
// })

module.exports = mongoose.model('User', userSchema);