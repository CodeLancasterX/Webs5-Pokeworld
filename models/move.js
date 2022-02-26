const mongoose = require('mongoose');

moveSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    description: {type: String, required: false},
    type: {type: String, required: false},
    accuracy: {type: Number, required: false},
    power: {type: Number, required: false, default: 0}
});

module.exports = mongoose.model('Move', moveSchema);