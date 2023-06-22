const users=require('../models/users');
const lib = require("./lib");
const messages=require('../models/messages');
let getfriends=function(req,res) {
    lib.authenticateToken(req, res, () => {
        let userid = req.user['id']
        users.findById(userid).then((doc) => {

            doc.populate('friends').then(
                (docp) => {
                    let friends = Array();
                    docp.friends.forEach(el => friends.push({
                        objectId: String(el._id),
                        email: el.email,
                        firstName: el.firstName,
                        lastName: el.lastName
                    }))
                    return res.status(200).json(friends);
                }).catch(err => {
                return res.status(500).json({error: "error while populating the data"})
            })
        }).catch(err => {
            return res.status(404).json({error: "user not found"})
        })

    })
}
let deletefriend=(req,res)=>{
    lib.authenticateToken(req,res,()=> {
        let userid=req.user['id']
        if(lib.validateEmail(req.body.email)) {
            users.findOne({email: req.body.email}).then((doc) => {
                let werefriends = false;
                doc.friends.forEach(frid => {
                    if (String(frid) === userid)
                        werefriends = true

                })
                if (!werefriends){
                    return res.status(401).json({error: "the users are not friends"}).end()
                }else {
                    Promise.all([users.updateOne({_id: userid}, {$pull: {friends: doc._id}}), users.updateOne({_id: String(doc._id)}, {$pull: {friends: userid}}), messages.deleteMany({source: {$in: [doc._id, userid]}, dest: {$in: [userid,doc._id]}})])
                        .then(ok => {
                            return res.status(200).send({ok: "friend removed and messages deleted"})
                        }).catch(err => {
                        res.status(500).json({error: 'pulling from arrays error: ' + err.message})
                    })
                }
            }).catch(err => {
                return res.status(404).json({error: "friend not registered " + err.message})
            })
        }else return res.status(404).json({error: "the provided email is not valid"})
    })
}
let addfriend= (req,res)=>{
    lib.authenticateToken(req,res,()=> {
        let userid=req.user['id']
        if(lib.validateEmail(req.body.email)) {
            users.findOne({email: req.body.email}).then((doc) => {
                if (String(doc._id) === userid) {
                    return res.status(401).json({error: "cannot add yourself as a friend"}).end()
                }
                let alreadyfrnd = false;
                doc.friends.forEach(frid => {
                    if (String(frid) === userid)
                        alreadyfrnd = true
                        return res.status(401).json({error: "the users are already friends"}).end()
                })
                if (!alreadyfrnd)
                    Promise.all([users.updateOne({_id: userid}, {$push: {friends: doc._id}}), users.updateOne({_id: String(doc._id)}, {$push: {friends: userid}})])
                        .then(ok => {
                            return res.status(200).send({ok: "friend added"})
                        }).catch(err => {
                        res.status(500).json({error: 'Pushing arrays error: ' + err.message})
                    })

            }).catch(err => {
                return res.status(404).json({error: "friend not registered " + err.message})
            })
        }else return res.status(404).json({error: "the provided email is not valid"})
    })
}
module.exports={getfriends, addfriend,deletefriend}