const mongoose=require('mongoose');
var friendsSchema=mongoose.Schema({
    a: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    b: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
module.exports=mongoose.model('Friend',friendsSchema)