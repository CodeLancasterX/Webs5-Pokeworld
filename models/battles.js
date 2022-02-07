const mongoose = require('mongoose');
const Users = require('./users');

const battleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    trainers: [Users]
});

module.exports = mongoose.model('Battle', battleSchema);