const express = require('express');
const registerHandler =require('../apis/register');
const loginHandler=require('../apis/login');
const router = express.Router()
router.get('/chat',)
router.post('/login',loginHandler.login)
router.post('/register',registerHandler.redirectregist)
module.exports = router