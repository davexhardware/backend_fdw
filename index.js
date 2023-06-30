const express = require('express');
const chatHandler=require('./apis/chat');
const cors = require('cors');
const cookieparser=require('cookie-parser')
//creates the secret token for jwt signing
const secret=require('crypto').randomBytes(64).toString('hex');
require("dotenv").config();
delete process.env.TOKEN_SECRET;
process.env.TOKEN_SECRET=secret;
const lib= require('./apis/lib')
const mongoose = require('mongoose');
const app=express()
var corsOptions = {
    origin:  lib.redirecthome, // http://localhost:5175
    credentials:true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

app.use(cookieparser());

app.use(express.json());

const apirouter=require('./routers/api.js');

const user= process.env.DB_USER;
const password=process.env.DB_PASS
const addr=require('util').format("mongodb+srv://%s:%s@appdb.bjlme91.mongodb.net/?retryWrites=true&w=majority",user,password)
mongoose.connect(addr,{ useNewUrlParser: true })
const db=mongoose.connection;
let dbconn=false
db.once('open',()=>{console.log('Connessione al DB riuscita');dbconn=true})

/* REDIRECTION SECTION */
// In case the users makes the request to the wrong port expecting the webapp, we redirect him
app.get('/',(req,res)=>res.redirect(lib.redirecthome))
app.get(/.*register$/,(req,res)=>res.redirect(lib.redirectregist))
app.get(/.*login$/,(req,res)=>res.redirect(lib.redirectlogin))

app.get('/connection_check', (req, res) => {
    console.log('Required connection check');
    res.json({
        connection: true,
        dbconn: dbconn
    })
})
app.use('/api', apirouter)

const server= require('http').createServer(app)
chatHandler.getchat(server,corsOptions)
server.listen(lib.backendport, () => { console.log('app in ascolto sulla porta: '+lib.backendport) })

