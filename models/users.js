const mongoose = require('mongoose');
const Pokemon = require('./pokemon');


const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    // pokemon: [Pokemon]

});

module.exports = mongoose.model('User', userSchema);