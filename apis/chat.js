const messages = require('../models/messages')
const lib = require('./lib');
const users = require('../models/users');
const socketio=require('socket.io')
const mongoose = require("mongoose");
function getmessages(userid, friendId,next)
{
    let msg = [];

    messages.find({
        'source': {$in: [userid, friendId]},
        'dest': {$in: [friendId, userid]}
    }, {}, {sort: {'datetime': 1}}).then(doc => {
        doc.forEach(el => {
            if (String(el.source) === userid && String(el.dest) === friendId) {
                msgtype = 's'//set "sent" type
            } else {
                msgtype = 'r' //set "received" type
            }
            el.set('msgtype', msgtype, {strict: false});
            msg.push(el)
        })
        next(msg);
    }).catch(err => {
        next({error: err})
    });

}

function checkiffriends(userid, friendId,next,error) {
    let arefriends=false
    users.findById(userid).then(doc => {
        doc.friends.forEach(fId => {
            if (String(fId) === friendId) {
                arefriends=true
            }
        })
    }).then(()=> {
        if (arefriends) next()
        else error()
    });
}

function getwatcher(userid,friendId) {
    return msgwatcher = messages.watch([
        {
        $match:
            {
                $and:[
                    {'fullDocument.source': {$in: [new mongoose.Types.ObjectId(friendId)]}},
                    {'fullDocument.dest': {$in: [new mongoose.Types.ObjectId(userid)]}},
                    {'operationType':'insert'}
            ]}
    }])
}

let getchat = (server,corsopt) => {
    var io = new socketio.Server(server,{cors: corsopt});
    io.on("connection", (socket) => {
        let changehandler=(el)=>{
            let newmsg= el.fullDocument;
            newmsg.msgtype='r';
            socket.emit('newMessage',newmsg)
        };
        let authenticated = false
        let userid = undefined;
        let friendConn = undefined;
        let msgwatcher = undefined;
        let jwtoken=socket.handshake.headers.cookie.split('=')[1]
        if (!authenticated) {
            lib.authenticateWsToken(jwtoken,(uid) => {
                userid = uid
                authenticated = true
                socket.emit("authenticated", "authenticated, provide friendId")
            }, (err)=>{
                if(err==='verification'){
                    socket.emit("error","jwt verification failed")
                }else if(err==='nr'){
                    socket.emit("error","user not registered")
                }
                socket.disconnect(true)
            })
        }

        socket.on("connectFriend", (friendId,callback)=> {
            let resp={
                status:"error",
                message:"friendId not provided"
            }
            if (typeof friendId === "string") {
                checkiffriends(userid, friendId, () => {
                    if (typeof msgwatcher !== 'undefined')
                        msgwatcher.close()
                    msgwatcher = getwatcher(userid, friendId);
                    msgwatcher.on('change', changehandler)
                    resp.status="ok";
                    friendConn=friendId;
                    getmessages(userid, friendId,(msgs)=>{
                        resp.message=msgs
                        callback(resp)
                    })
                }, () => {
                    resp.message="users are not friends"
                    callback(resp)
                });
            }else{
                callback(resp)
            }
        });

        socket.on("disconnect",() => {
            if (typeof msgwatcher !== 'undefined')
                msgwatcher.close()
        })

        socket.on("send",(data,callback)=>{
            let message=JSON.parse(data);
            message.source=userid;
            message.dest=friendConn
            messages.create(message).then(succ=> {
                    succ.set('msgtype', 's', {strict: false});
                    callback(succ)
                }
            ).catch(err=>{
                callback(JSON.stringify({status:'error',message:err}))
            })

        })
    })



}
module.exports = {getchat}