const users=require('../models/users');
const lib = require("./lib");
let getfriends=function(req,res){
    lib.authenticateToken(req,res,()=> {
        let userid=req.user;
        let friends=[]
        let c=friends.find({a:userid}).cursor()
        c.forEach()
    })
}
module.exports={getfriends}