const hostname='localhost';
const frontendport=3000;
const jwt = require('jsonwebtoken');
const ms=require('ms')
function generateAccessToken(userid) {
    return jwt.sign({id:userid}, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
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
    let regex=new RegExp('([\\w]+[\.]?)+');
    return regex.test(String(name).toLowerCase())
}
const backendport=8080;
let redirecthome=require('util').format('http://%s:%d/',hostname,frontendport);
let redirectlogin=require('util').format('http://%s:%d/login',hostname,frontendport);
let redirectregist=require('util').format('http://%s:%d/register',hostname,frontendport);
module.exports={ generateAccessToken, redirectregist, redirectlogin, redirecthome, backendport,validateEmail,validateName, validateHashPassword}