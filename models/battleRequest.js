const mongoose = require('mongoose');

battleRequestSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    defender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    status: { type: String, enum: ['Accepted', 'Pending', 'Declined'],  default:'Pending'}
});

battleRequestSchema.post('updateMany', {document:true}, async function(next) {
    //find users of one battlerequest.
    console.log(this.challenger + " challenger")
    console.log(this.defender + " defender")
    const challenger = await Users.find({_id: this.challenger});
    const defender = await Users.find({_id: this.defender});

    if (challenger == null && defender == null) {
        console.log("yes");
    } 
    next();
})

module.exports = mongoose.model('BattleRequest', battleRequestSchema);