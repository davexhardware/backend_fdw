const users=require('../models/users');
const lib=require('./lib');
let register = (req,res)=>{
    // require fields for registration checking:
    if(req.body.email && req.body.password && req.body.firstname && req.body.lastname) {
        // required fields validation
        if(lib.validateEmail(req.body.email) && lib.validateNonHashPassword(req.body.password) && lib.validateName(req.body.firstname) && lib.validateName(req.body.lastname)){

        }
    }else res.json({error :"didn't receive all the required fields"})
}
module.exports={register}