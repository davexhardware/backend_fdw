const users=require('../models/users');
const lib=require('./lib');
let register = (req,res)=>{
    let email,password,firstname,lastname=[req.body['email'],req.body['password'],req.body['firstname'], req.body['lastname']]
    // require fields for registration checking:
    if( email && password && firstname && lastname) {
        // required fields validation
        if(lib.validateEmail(email) && lib.validateHashPassword(password) && lib.validateName(firstname) && lib.validateName(lastname)){

        }
    }else res.json({error :"didn't receive all the required fields"})
}
module.exports={register}