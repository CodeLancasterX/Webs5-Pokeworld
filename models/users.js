const mongoose = require('mongoose');
const Pokemon = require('./pokemon');


userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    // pokemon: [Pokemon]

});

module.exports = mongoose.model('User', userSchema);