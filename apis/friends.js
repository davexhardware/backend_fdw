const users=require('../models/users');
const lib = require("./lib");
let register=function(req,res){
    lib.authenticateToken(req,res,()=> {
        let userid=req.user;
        friends.
    })
}
module.exports={getfriends}