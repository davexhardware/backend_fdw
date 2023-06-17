const users=require('../models/users');
const lib = require("./lib");
const {Types} = require("mongoose");
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
        let userid=req.user['id']
        users.findOne({email:req.body.email}).then( (doc)=> {
            if(String(doc._id)===userid){
                return res.status(401).json({error:"cannot add yourself as a friend"}).end()
            }
            Promise.all([users.updateOne({_id:userid},{ $push:{friends: doc._id}}),users.updateOne({_id:String(doc._id)},{$push:{friends:userid}})])
            .then(ok=>{
                res.status(200).send({ok:"friend added"})
            }).catch(err=>{ res.status(500).json({error:'Pushing arrays error: '+err.message})})

        }).catch(err=> {return res.status(404).json({error: "friend not registered "+err.message}) })
    })
}
module.exports={getfriends, addfriend}