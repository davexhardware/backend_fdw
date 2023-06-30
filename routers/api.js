const express = require('express');
const registerHandler =require('../apis/register');
const loginHandler=require('../apis/login');
const chatHandler=require('../apis/chat')
const friendsHandler=require('../apis/friends')
const profileHandler=require('../apis/profile')
const router = express.Router()
var server = require('http').createServer(require('../index').app);
chatHandler.getchat(server,require('../index').corsopt)
router.post('/addfriend',friendsHandler.addfriend)
router.post('/removefriend',friendsHandler.deletefriend)
router.get('/getprofile',profileHandler.getprofile)
router.get('/friends',friendsHandler.getfriends)
router.post('/login',loginHandler.login)
router.post('/register',registerHandler.register)
module.exports = router