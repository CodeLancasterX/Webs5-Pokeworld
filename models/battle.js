const mongoose = require('mongoose');

battleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    defender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false}
});

module.exports = mongoose.model('Battle', battleSchema);