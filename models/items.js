const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: String,
    description: String
});

module.exports = mongoose.model('Item', itemSchema);