const messages = require('../models/messages')
const lib = require('./lib');
const users = require('../models/users');
const socketio=require('socket.io')
function getmessages(userid, friendId) {
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
            console.log(msg,el)
        })
        return msg;
    }).catch(err => {
        return {error: err}
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

function getwatcher(friendId, userid) {
    return msgwatcher = messages.watch({
        $match: {
            'fullDocument.source': friendId,
            'fullDocument.dest': userid
        }
    })
}

let getchat = (server,corsopt) => {
    var io = new socketio.Server(server,{cors: corsopt});

    let changehandler=(next)=>{
        let change;
        console.log(next)
        switch(next.operationType) {
            case 'update': {
                change = ('update: ' + JSON.stringify({
                    id: String(next.documentKey._id),
                    field: next.updateDescription.updatedFields
                }));
                break;
            }
            case 'delete':{

            }
        }
    };
    io.on("connection", (socket) => {
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
                /*
                if (!socket.handshake.query.friendId){
                } else checkiffriends(userid, socket.handshake.query.friendId,()=> {
                    friendId = data['friendId'];
                    socket.emit("friendOk", "authenticated and connected to friend")
                    socket.emit("messages", JSON.stringify(getmessages(userid, friendId)))
                    if (typeof msgwatcher !== 'undefined')
                        msgwatcher.close()
                    msgwatcher = getwatcher(userid, friendId);
                    msgwatcher.on('change', changehandler);

                },()=> {
                    socket.emit("error", "users are not friends")
                });*/
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
                    let msgs=getmessages(userid, friendId)
                    console.log(msgs)
                    resp.message=msgs
                    callback(resp)
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
        })
    })



}
module.exports = {getchat}