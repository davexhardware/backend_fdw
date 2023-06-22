
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
                            bcrypt.compare(String(req.body['password']), String(user['password']), (err, same)=> {
                                // returns hash
                                if(same) {
                                    let token=lib.generateAccessToken(user['_id'])
                                    return res.status(200).cookie('access_token', token,{ domain:lib.redirecthome}).end()
                                }
                                return res.status(lib.errCode).json({error: 'passwords do not match'});
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