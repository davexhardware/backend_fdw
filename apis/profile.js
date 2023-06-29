const lib = require("./lib");
const users = require("../models/users");
let getprofile=(req,res)=>{
    lib.authenticateToken(req,res,(uid)=> {
        let userid=uid;
        users.findOne({_id:userid}).then(doc =>{
            res.status(200).json({_id:userid, email:doc.email, firstName:doc.firstName, lastName:doc.lastName})
        }).catch(err=>{return res.status(404).json({error: 'user with the userid: '+userid+' does not exist'})})

    });

}
module.exports={getprofile}