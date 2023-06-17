const users=require('../models/users');
const lib = require("./lib");
let getfriends=function(req,res){
    lib.authenticateToken(req,res,()=> {
        let userid=req.user['id']
        users.findById(userid).
        then( (doc)=>{
            doc.populate('friends').then(
                (docp)=>{
                    let friends=Array();
                    docp.friends.forEach(el=>friends.push({email: el.email,firstName:el.firstName, lastName:el.lastName}))
                    return res.status(200).json(friends);
                }).catch(err => {return res.status(500).json({error: "error while populating the data"}) })
        }).catch(err=> { return res.status(404).json({error: "user not found"}) })

    })
}
let addfriend= (req,res)=>{
    lib.authenticateToken(req,res,()=> {
        userid=re.user['id']

    })
}
module.exports={getfriends, addfriend}