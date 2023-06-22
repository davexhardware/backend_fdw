const messages = require('../models/messages')
const lib=require('./lib');
const ws=require('ws');
function getmessages(userid,friendId){
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
    }).catch(err=>{
        return 'error: '+err
    })
    return msg
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
        if(!authenticated){
                lib.authenticateWsToken(data, ws, (uid) => {
                    userid = uid
                    authenticated = true
                    if ( !data['friendId']) {
                        ws.send('ok: authenticated, provide friendId')
                    } else {
                        friendId = data['friendId'];
                        ws.send('ok: authenticated and connected to friend')
                        ws.send(getmessages(userid, friendId));
                        if (typeof msgwatcher=== 'undefined')
                            msgwatcher = getwatcher(userid, friendId);
                    }
                })

        }else {

            if (data['friendId']) {
                friendId = data['friendId']
                getmessages(userid, friendId, ws);
                if (!msgwatcher)
                    msgwatcher = getwatcher(userid, friendId);
            }
            if (data['message']) {
                ws.send('msg received')
            }
            if (userid && friendId)
                msgwatcher.on('change', next => {
                    console.log(next)
                });
        }
    }
    ws.onclose()



}
module.exports = {getchat}