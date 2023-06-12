const express = require('express');
const registerHandler =require('../apis/register');
const loginHandler=require('../apis/login');
const chatHandler=require('../apis/chat')
const friendsHandler=require('../apis/chat')
const router = express.Router()
router.get('/chat/:userID',chatHandler.getchat)
router.get('/friends',friendsHandler.getfriends)
router.post('/login',loginHandler.login)
router.post('/register',registerHandler.register)
module.exports = router