const mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    friends: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }]
})
module.exports = mongoose.model('User', userSchema);