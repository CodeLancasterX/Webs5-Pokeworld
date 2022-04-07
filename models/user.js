const mongoose = require('mongoose');
const validator = require('validator');
const BattleRequest = require('./battleRequest');
const Battle = require('./battle');
const Encounter = require('./encounter');
const Pokemon = require('./pokemon');

userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, required: true, validate: validator.isEmail}, /*adding unique: true was also an option*/
    password: { type: String, required: true}, //range validator.
    name: { type: String, required: true, unique: true, minLength: 8, maxLength: 30},
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

userSchema.post('deleteOne', {document:true}, async function(next) {

    //cascade delete battleRequests.
    const battleRequests = await BattleRequest.find({$or: [{challenger: this._id}, {defender:this._id}]})
    await BattleRequest.updateMany({$and: [{_id: {$in: battleRequests}}, {status: "Pending"}]}, {status: "Declined"})
    
    await battleRequests.forEach(async battleRequest => {

        let challenger = await this.constructor.findOne({_id: battleRequest.challenger});
        let defender = await this.constructor.findOne({_id: battleRequest.defender});

        if (challenger == null && defender == null) {
            await BattleRequest.deleteOne({_id: battleRequest._id});
        }
    });

    //cascade delete battles
    //TODO: test.
    const battles = await Battle.find({$or: [{challenger: this._id}, {defender:this._id}]})
    
    await battles.forEach(async battle => {

        let challenger = await this.constructor.findOne({_id: battle.challenger});
        let defender = await this.constructor.findOne({_id: battle.defender});

        if (challenger == null && defender == null) {
            await Battle.deleteOne({_id: battle._id});
        }
    });

    next();
})

module.exports = mongoose.model('User', userSchema);