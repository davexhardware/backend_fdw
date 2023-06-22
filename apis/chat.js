const messages = require('../models/messages')
const lib=require('./lib');
const ws=require('ws');
function getmessages(userid,friendId,ws){
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
    }).then(succ => {
        console.log(msg)
        return ws.send(msg)
    })
}
function getwatcher(friendId,userid){
    return msgwatcher = messages.watch({
        $match: {
            'fullDocument.source': friendId,
            'fullDocument.dest': userid
        }
    })
}
let getchat = (ws, req) => {
    let authenticated=false
    let userid=undefined;
    let friendId=undefined;
    let msgwatcher=undefined;
    ws.onmessage=(msg)=>{
        let data=JSON.parse(msg.data);
        if(data['access_token']){
            lib.authenticateWsToken(data, ws, (uid) => {
                userid =uid
                authenticated=true
                if(!friendId){
                    ws.send('error: provide friendId')
                }else {
                    friendId = data['friendId'];
                    getmessages(userid,friendId,ws);
                    if(!msgwatcher)
                        msgwatcher=getwatcher(userid,friendId);
                }
            })
        }else if(data['friendId'] && authenticated) {
            friendId = data['friendId']
            getmessages(userid,friendId,ws);
            if(!msgwatcher)
                msgwatcher=getwatcher(userid,friendId);
        }
        if(data['message'] && authenticated){
            ws.send('msg received')
        }
        if(authenticated && userid && friendId)
            msgwatcher.on('change', next => {
                console.log(next)
            });
    }



}
module.exports = {getchat}