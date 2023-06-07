const mongoose=require('mongoose');
var messageSchema=mongoose.Schema({
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dest:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    datetime: Date
});
module.exports=mongoose.model('Message',messageSchema)