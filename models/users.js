const mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    token: String
})
module.exports = mongoose.model('User', userSchema);