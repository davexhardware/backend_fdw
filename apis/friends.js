const users=require('../models/users');
const lib = require("./lib");
let getfriends=function(req,res){
    lib.authenticateToken(req,res).
    then(()=> {
        console.log('ello')
    })
}
module.exports={getfriends}