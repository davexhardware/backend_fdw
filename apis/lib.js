const hostname='localhost';
const jwt = require('jsonwebtoken');
require("dotenv").config();
const util=require('util')
const users=require('../models/users')
const errCode=403;
const frontendport=process.env.F_PORT;
const backendport=process.env.B_PORT;

function returnjwterror(err,res){
    return res.status(401).json({error:'Error during JWT verification (check if you are logged in and retry) '+err.message})
}
function generateAccessToken(userid) {
    return jwt.sign({id:userid}, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}
function lookforUser(userid,next,error){
    users.findById(userid).then(()=>{next()}).catch(()=>{error()})
}
function authenticateWsToken(token,next,error){

    jwt.verify(token, process.env.TOKEN_SECRET, (err, id) => {

        if (err) {
            return error('verification')
        }
        lookforUser(id.id,()=>{next(id.id)},()=>{return error('nr')})

    })

}
function authenticateToken(req,res,next) {
    if(!req.cookies['auth_token']){
        return returnjwterror({message:'no cookie'},res)
    }
    const token =req.cookies['auth_token']


    jwt.verify(token, process.env.TOKEN_SECRET, (err, id) => {

        if (err) {
            return returnjwterror(err,res)
        }
        lookforUser(id.id,()=>{
            next(id.id)
        },()=>{
            return returnjwterror({message:"can't find user with the specified userid is not in the database"},res)
        });
    })
}

function validateEmail(email) {
    let regex =new RegExp('^[\\w.-]+@([\\w-]+.)+[\\w-]{2,4}$' );
    return regex.test(String(email).toLowerCase());
}

function validateHashPassword(pwd) {
    //matches an hex string of 64 characters (32B sha256 digest)
    let regex=new RegExp('^[0123456789abcdef]{64}$');
    return regex.test(String(pwd).toLowerCase());
}
/*
function validateNonHashPassword(pwd) {
    This regex matches only if all of the following are true:
        password must contain at least 1 digit (0-9)
        password must contain at least 1 uppercase letters
        password must contain at least 1 lowercase letters
        password must contain at least 1 non-alpha numeric number
        password is 8-16 characters with no space
    let regex = new RegExp('^(?=.*\\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\\w\\d\\s:])([^\\s]){8,16}$');
    return regex.test(String(pwd))
}
*/
function validateName(name){
    let regex=new RegExp('(\\w+.?)+');
    return regex.test(String(name).toLowerCase())
}

let redirecthome=util.format('http://%s:%d',hostname,frontendport);
let redirectchat=util.format('http://%s:%d/chat',hostname,frontendport);
let redirectlogin=util.format('http://%s:%d/login',hostname,frontendport);
let redirectregist=util.format('http://%s:%d/register',hostname,frontendport);
module.exports={ authenticateToken, authenticateWsToken, generateAccessToken, errCode, redirectregist, redirectlogin,redirectchat, redirecthome, backendport,validateEmail,validateName, validateHashPassword}