const express = require('express');
const cors = require('cors');
const apirouter=require('./routers/api.js');

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
const hostname='localhost'
const portnum=3000
let redirectlogin=require('util').format('http://%s:%d/login',hostname,portnum);
let redirectregist=require('util').format('http://%s:%d/register',hostname,portnum);
app.get('/register',(req,res)=>res.redirect(redirectregist))
app.get('/api/register',(req,res)=>res.redirect(redirectregist))

app.get('/api/login',(req,res)=>res.redirect(redirectlogin))
app.get('/api/login',(req,res)=>res.redirect(redirectlogin))

app.get('/connection_check', (req, res) => {
    console.log('Required connection check');
    res.json({
        connection: true,
        dbconn:dbconn
    })
})
app.use('/api', apirouter)

app.listen(8080, () => { console.log('app in ascolto') })