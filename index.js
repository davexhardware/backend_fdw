const express = require('express');
const cors = require('cors');
const apirouter=require('./routers/api.js');
const lib= require('./apis/lib')
//creates the secret token for jwt signing
const secret=require('crypto').randomBytes(64).toString('hex');
require('fs').createWriteStream('./.env').write('TOKEN_SECRET='+secret,(e)=>{e?console.log(e.message):null});;
require("dotenv").config();
const mongoose = require('mongoose');
const app=express();

app.use(cors());
app.use(express.json());
const user= 'fdwuser';
const password= '1OVXZAlRs4UNjw1I'
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

app.listen(lib.backendport, () => { console.log('app in ascolto') })