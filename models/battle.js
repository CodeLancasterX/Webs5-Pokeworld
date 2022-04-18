const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

battleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    defender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false}
});

battleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Battle', battleSchema);