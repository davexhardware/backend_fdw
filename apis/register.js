const users=require('../models/users');
const lib=require('./lib');
const bcrypt = require ('bcrypt');
const saltRounds=10;
const wrong='Something went wrong, check and retry: '
let register = (req,res)=>{
    let {email,password,firstname,lastname}=req.body;

    // require fields for registration checking
    if( email && password && firstname && lastname) {
        // required fields validation
        try {
            if (lib.validateEmail(email) && lib.validateHashPassword(password) && lib.validateName(firstname) && lib.validateName(lastname)) {
                bcrypt.genSalt(saltRounds, 'b', (er, salt)=>{
                    if(salt && !er) {
                        bcrypt.hash(password, salt, (err, hash) => {
                            // returns hash
                            if(hash && !err){
                                users.findOne({email:email}).then(el=> {
                                    try {
                                        if (!el) {
                                            users.create({
                                                email: email,
                                                firstName: firstname,
                                                lastName: lastname,
                                                password: hash,
                                            }).then(el => {
                                                let token = lib.generateAccessToken(String(el['_id']))
                                                return res.json({jwtcookie: token})
                                            }).catch(e => {
                                                return res.sendStatus(403).json({error: wrong+e.message})
                                            });
                                        } else throw new TypeError('user already registered')
                                    }catch(e){ return res.sendStatus(403).json({error: wrong+e.message})}
                                }).catch(e => { return res.sendStatus(403).json({error: wrong+e.message})})
                            }else throw new TypeError(err.message)
                        })
                    }else throw new TypeError(er.message)
                });
            }else throw new TypeError('Validation failed')
        }catch(e) {
            res.sendStatus(403).json({error: wrong+e.message})
        }
    }else res.sendStatus(403).json({error :"didn't receive all the required fields"})
}
module.exports={register}