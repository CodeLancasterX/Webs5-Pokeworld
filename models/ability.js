const mongoose = require('mongoose');

abilitySchema = mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true}
});

module.exports = mongoose.model('Ability', abilitySchema);