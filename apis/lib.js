const hostname='localhost';
const frontendport=5173;
const jwt = require('jsonwebtoken');
const errCode=403;

function returnjwterror(err,res){
    return res.status(403).json({error:'Error during JWT verification (check if you are logged in and retry) '+err.message})
}
function generateAccessToken(userid) {
    return jwt.sign({id:userid}, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}
function authenticateToken(req,res,next) {
    if(!req.cookies['authorization']){
        returnjwterror('no cookie')
    }
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401).json({error:'Did not find a JWT cookie'})

    jwt.verify(token, process.env.TOKEN_SECRET, (err, id) => {

        if (err) {

        }

        req.user=id
        next()
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
const backendport=5000;
let redirecthome=require('util').format('http://%s:%d/',hostname,frontendport);
let redirectlogin=require('util').format('http://%s:%d/login',hostname,frontendport);
let redirectregist=require('util').format('http://%s:%d/register',hostname,frontendport);
module.exports={ authenticateToken, generateAccessToken, errCode, redirectregist, redirectlogin, redirecthome, backendport,validateEmail,validateName, validateHashPassword}