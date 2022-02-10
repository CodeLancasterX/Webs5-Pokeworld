const mongoose = require('mongoose');

encounterSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    pokemon: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon'}
});


module.exports = mongoose.model('Encounter', encounterSchema);