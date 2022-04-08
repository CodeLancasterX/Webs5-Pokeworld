const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

battleRequestSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    defender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    status: { type: String, enum: ['Accepted', 'Pending', 'Declined'],  default:'Pending'}
});

battleRequestSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('BattleRequest', battleRequestSchema);