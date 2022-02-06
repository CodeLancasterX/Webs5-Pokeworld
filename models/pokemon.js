const mongoose = require('mongoose');

pokemonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    nickName: String
});

module.exports = mongoose.model('Pokemon', pokemonSchema);