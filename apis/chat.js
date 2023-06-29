const messages = require('../models/messages')
const lib = require('./lib');
const users = require('../models/users')

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
        })
    }).catch(err => {
        return {error: err}
    })
    return msg
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

let getchat = (ws, req) => {
    let authenticated = false
    let userid = undefined;
    let friendId = undefined;
    let msgwatcher = undefined;
    let changehandler=(next)=>{
        let change;
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
    }
    ws.onmessage = (msg) => {
        let data = JSON.parse(msg.data);
        if (!authenticated) {
            lib.authenticateWsToken(data, ws, (uid) => {
                userid = uid
                authenticated = true
                if (!data['friendId']) {
                    ws.send(JSON.stringify({ok: "authenticated, provide friendId"}))
                } else checkiffriends(userid, data['friendId'],()=> {
                    friendId = data['friendId'];
                    ws.send(JSON.stringify({ok: "authenticated and connected to friend"}))
                    ws.send(JSON.stringify(getmessages(userid, friendId)));
                    if (typeof msgwatcher !== 'undefined')
                        msgwatcher.close()
                    msgwatcher = getwatcher(userid, friendId);
                    msgwatcher.on('change', changehandler);
                },()=> {
                    ws.send(JSON.stringify({error: "users are not friends"}))
                });
            })

        } else {

            if (data['friendId']) {
                friendId = data['friendId']
                checkiffriends(userid,friendId,() =>{
                    if (typeof msgwatcher !== 'undefined')
                        msgwatcher.close()
                    msgwatcher = getwatcher(userid, friendId);
                    msgwatcher.on('change', changehandler)
                    ws.send(JSON.stringify({ok: 'friends connected'}))
                    ws.send(JSON.stringify(getmessages(userid, friendId)));
                },()=>{
                    ws.send(JSON.stringify({error: "users are not friends"}))
                });
            }
            if (data['message']) {
                ws.send(JSON.stringify({ok: "message received"}))
            }

        }
    }
    ws.onclose(() => {
        msgwatcher.close()
    })


}
module.exports = {getchat}