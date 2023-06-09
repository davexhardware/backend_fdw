const hostname='localhost';
const frontendport=3000;
function validateEmail(email) {
    let regex =new RegExp('^[\\w.-]+@([\\w-]+.)+[\\w-]{2,4}$' );
    return regex.test(String(email).toLowerCase());
}
function validateHashPassword(pwd) {
    return true;
}
function validateNonHashPassword(pwd) {
    /*This regex matches only if all of the following are true:
        password must contain at least 1 digit (0-9)
        password must contain at least 1 uppercase letters
        password must contain at least 1 lowercase letters
        password must contain at least 1 non-alpha numeric number
        password is 8-16 characters with no space */
    let regex = new RegExp('^(?=.*\\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\\w\\d\\s:])([^\\s]){8,16}$');
    return regex.test(String(pwd))
}
function validateName(name){
    let regex=new RegExp('^([\\w]+[\\.])+$');
    return regex.test(String(name).toLowerCase())
}
const backendport=8080;
let redirecthome=require('util').format('http://%s:%d/',hostname,frontendport);
let redirectlogin=require('util').format('http://%s:%d/login',hostname,frontendport);
let redirectregist=require('util').format('http://%s:%d/register',hostname,frontendport);
module.exports={ redirectregist, redirectlogin, redirecthome, backendport,validateEmail,validateName, validateHashPassword,validateNonHashPassword}