'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var https = require('https');
var fs = require('fs');
var database = require('./schema.js');
var Q = require('q');
var leve = require('levenshtein');

var c = require('./config.js');
var dof = require('./dofunc.js');
var mess = require('./messenger.js');
var sort = require('./sort.js');

var ssl = {
    key: fs.readFileSync('/etc/letsencrypt/live/www.diuda.me/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.diuda.me/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/www.diuda.me/chain.pem')
};

https.createServer(ssl, app).listen(444);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const token = c['fb'].page_token;


app.get('/', function(req, res) {
    if (req.query['hub.verify_token'] === token) {
        res.send(req.query['hub.challenge'])
    }
    res.send(req.query['hub.challenge']);
})

app.post('/status',function(req,res){
    console.log(req.body)
    sendStatus(req.body);
})

app.get('/status', function(req, res){
    
})


const user_token = c['do'].auth_token;

var status = 0;
app.post('/', function(req, res) {


    let msg_event = req.body.entry[0].messaging;

    for (var i = 0; i < msg_event.length; i++) {
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id.toString();

        if ((event.message != undefined) && (!event.message.is_echo)) {
            // console.log("hello");
            if (sort.info[sender] == undefined) {
                mess.findToken(sender).then(function(body) {
                    console.log(body)
                    sort.info[sender] = { token: body };
                    mess.sendTextMessage(sender, "Welcome!!!")
                }, function(err) {
                    // console.log(err);
                });
            } else {

                // console.log("hello");

                //similarity between two strings
                var distance = function(str1, str2) {
                    var l = new leve(str1, str2);
                    return (1 - (l.distance / Math.max(str1.length, str2.length))) * 100;

                }
                console.log(distance("hello", "hel"));
                if (event.message && event.message.text) {
                    let text = event.message.text;

              
                    if (distance('token', text.toLowerCase())>=85) {
                        console.log(distance('token', text.toLowerCase()))
                        sort.states.UserState[sender] = { module: "eToken", stage: 1 };
       
                    } else if (distance('update token', text.toLowerCase())>=85) {
                       
                        sort.states.UserState[sender] = { module: "uToken", stage: 1 };
                        
                    } else if (distance('list droplet', text.toLowerCase())>=85) {
                 
                        sort.states.UserState[sender] = { module: "lDroplet", stage: 1 };
 

                    }else if (distance('list actions', text.toLowerCase())>=85) {
  

                        sort.states.UserState[sender] = { module: "lActions", stage: 1 };
                        
                    } else if (distance('list domains', text.toLowerCase())>=85) {
                      
                        console.log(distance('list domains', text.toLowerCase()))
                        sort.states.UserState[sender] = { module: "lDomains", stage: 1 };
                        
                    }
                    else if(distance('add domain', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = {module: "aDomain", stage: 1};

                    }
                    else if(distance('delete domain', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = {module: "dDomain", stage: 1};
                    } 
                    else if(distance('add domain record', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = {module: "aDomainRecord", stage: 1};
                    }
                    else if (distance('list domain records', text.toLowerCase())>=85) {
              
                        sort.states.UserState[sender] = { module: "lDomainRecords", stage: 1 };
                        
                    } 
                    else if(distance('delete domain record', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = { module: "dDomainRecord", stage: 1}
                    }
                     else if (distance('list snapshots', text.toLowerCase())>=85) {
                        
                        sort.states.UserState[sender] = { module: "lSnapshots", stage: 1 };
                        
                    } 
                    else if(distance('delete snapshot', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = { module: "dSnapshot", stage: 1};
                    }
                    else if (distance('list regions', text.toLowerCase())>=85) {
                       
                        sort.states.UserState[sender] = { module: "lRegions", stage: 1 };
                       
                    } else if (distance('list sizes', text.toLowerCase())>=85) {
                        
                        sort.states.UserState[sender] = { module: "lSizes", stage: 1 };
                        
                    }
                    else if (distance('delete droplet', text.toLowerCase())>=85) {
                       
                        sort.states.UserState[sender] = { module: "dDroplet", stage: 1 };
                      
                    } 
                    else if (distance('create droplet', text.toLowerCase())>=85) {
                        sort.states.UserState[sender] = { module: "cDroplet", stage: 1 };
                    }
                    //TODO list backups for droplet 
                    else if (distance('droplet action', text.toLowerCase())>=85) {
                        sort.states.UserState[sender] = { module: "aDroplet", stage: 1 };

                    }
                    else if(distance('list images', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = {module: "lImage", stage: 1};
                        sort.info[sender].count = 10;
                    }
                    else if(distance('list distribution images', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = {module: "lDImage", stage: 1};
                        sort.info[sender].count = 10;
                    }
                    else if(distance('list application images', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = {module: "lAImage", stage: 1};
                        sort.info[sender].count = 10;   
                    }
                    else if(distance('list user images', text.toLowerCase())>=85){
                     sort.states.UserState[sender] = {module: "lUImage", stage: 1};  
                    }
                    else if(distance('delete image', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = {module: "dImage", stage: 1};
                    }
                    else if(distance('image actions', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = {module: "aImage", stage: 1}
                    }
                    else if(distance('list block storage', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = {module: "lBlock", stage: 1}   
                    }
                    else if(distance('create block storage', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = { module: "cBlock", stage: 1}
                    }
                    else if(distance('create storage snapshot', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = { module: "cBlockSnap", stage: 1}
                    }
                    else if(distance('delete storage', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = { module: "dBlock", stage: 1}
                    }
                    else if(distance('storage action', text.toLowerCase())>=85){
                        sort.states.UserState[sender] = { module: "aStorage", stage: 1}   
                    }
                    else if(distance('status', text.toLowerCase())>=85){
                        //CALL THE BASH FILE HERE   
                    }

                    // console.log("hell");

                    if (sort.states.UserState[sender] != undefined) {

                        mess.checkStatus(sort.info[sender].token, status, sender, text, function(messbody) {
                            mess.sendTextMessage(sender, messbody)
                                // console.log("sup")
                        });
                        // console.log("xyz");

                    }
                }
            }
        }
    }
    res.sendStatus(200);
})


function sendStatus(status) {
    console.log(status);
    return;

}