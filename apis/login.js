
const users=require('../models/users');
const lib=require('./lib')
const bcrypt = require ('bcrypt');

let login =(req,res)=> {
    // expected: a post containing username (email) and password hash
    if (req.body['email'] && req.body['password']) {
        // VALIDATION OF THE PARAMETERS
        if (lib.validateEmail(req.body['email']) &&  lib.validateHashPassword(req.body['password'])) {
            //console.log('ok')
            users.findOne({email: req.body['email']} )
                .then(user => {
                    try{
                        if(user) { // check user existence
                            //console.log('ok2')
                            bcrypt.hash(String(req.body['password']), String(user['password']).substring(0,29), (err, hash)=> {
                                // returns hash
                                if(hash===user['password']) {
                                    let token=lib.generateAccessToken(user['_id'])
                                    return res.cookie("access_token", token, {
                                        httpOnly: true
                                    }).status(200).send()
                                }
                                else throw new TypeError('Password do not match')
                            });
                        } else throw new TypeError('user not found')
                    }catch(e) {
                        res.status(lib.errCode).json({error: 'user or password not found'});
                    }
                })
                .catch(e =>  res.status(lib.errCode).json({error: 'user not found or incorrect password' + e.message}))

        } else return res.status(lib.errCode).json({error: 'email or password format not valid'})
    } else return res.status(lib.errCode).json({error: "didn't receive email and/or password in post"})
}
module.exports={ login}