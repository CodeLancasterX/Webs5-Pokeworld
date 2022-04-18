const mongoose = require('mongoose');
const Pokemon = require('./pokemon');
const mongoosePaginate = require('mongoose-paginate-v2');

moveSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true, unique: true},
    description: {type: String, required: false},
    type: {type: String, required: false},
    accuracy: {type: Number, required: false, min: 0, max: 100, default: null},
    power: {type: Number, required: false, default: null}
});

moveSchema.plugin(mongoosePaginate);

moveSchema.pre('findOneAndUpdate', function(next) {
    console.log('pre udpate hook triggered @moveModel.')
    this.options.runValidators = true;
    next();
})

moveSchema.pre('deleteOne', {document:true}, function(next) {
    console.log('pre delete hook triggered @moveModel.')
    Pokemon.updateMany(
        { moves: this._id}, 
        { $pull: { moves: this._id } })
    .exec()
    .then( result => {
        console.log(result)
    })
    .catch( err => {
        res.status(500).json({
            error: err
        })
    })
    next();
})

module.exports = mongoose.model('Move', moveSchema);