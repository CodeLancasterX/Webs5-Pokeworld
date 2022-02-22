const mongoose = require('mongoose');

battleRequest = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    defender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    status: { type: String, enum: ['Accepted', 'Pending', 'Declined'],  default:'Pending'}
});

module.exports = mongoose.model('BattleRequest', battleRequest);