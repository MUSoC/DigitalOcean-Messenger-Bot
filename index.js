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

                var distance = function(str1, str2) {
                    var l = new leve(str1, str2);
                    return (1 - (l.distance / Math.max(str1.length, str2.length))) * 100;

                }
                console.log(distance("hello", "hel"));
                if (event.message && event.message.text) {
                    let text = event.message.text;



                    // if(sort.states.UserState[sender].module!=undefined){

                    //     mess.checkStatus(body, status, sender, text, function(body){
                    //      mess.sendTextMessage(sender, body.message);
                    //     });
                    // // }


              
                    if (text == 'Token') {
               
                        sort.states.UserState[sender] = { module: "eToken", stage: 1 };
       
                    } else if (text == "Update token") {
                       
                        sort.states.UserState[sender] = { module: "uToken", stage: 1 };
                        
                    } else if (text == "List droplet") {
                 
                        sort.states.UserState[sender] = { module: "lDroplet", stage: 1 };
 

                    }else if (text == "Last actions") {
  
                        sort.states.UserState[sender] = { module: "lActions", stage: 1 };
                        
                    } else if (text == "List domains") {
                      
                        sort.states.UserState[sender] = { module: "lDomains", stage: 1 };
                        
                    }
                    else if(text == 'Add domain'){
                        sort.states.UserState[sender] = {module: "aDomain", stage: 1};

                    }
                    else if(text == 'Delete domain'){
                        sort.states.UserState[sender] = {module: "dDomain", stage: 1};
                    } 
                    else if (text == "Refresh domains") {
    
                        sort.states.UserState[sender] = { module: "rDomains", stage: 1 };
                    } 
                    else if(text == "Add domain records"){
                        sort.states.UserState[sender] = {module: "aDomainRecord", stage: 1};
                    }
                    else if (text == "List domain records") {
              
                        sort.states.UserState[sender] = { module: "lDomainRecords", stage: 1 };
                        
                    } 
                    else if(text == "Delete domain record"){
                        sort.states.UserState[sender] = { module: "dDomainRecord", stage: 1}
                    }
                    else if (text == "Refresh domain records") {
               
                        sort.states.UserState[sender] = { module: "rDomainRecords", stage: 1 };
                       
                    } else if (text == "List snapshots") {
                        
                        sort.states.UserState[sender] = { module: "lSnapshots", stage: 1 };
                        
                    } 
                    else if(text == "Delete snapshot"){
                        sort.states.UserState[sender] = { module: "dSnapshot", stage: 1};
                    }
                    else if (text == "List regions") {
                       
                        sort.states.UserState[sender] = { module: "lRegions", stage: 1 };
                       
                    } else if (text == "List sizes") {
                        
                        sort.states.UserState[sender] = { module: "lSizes", stage: 1 };
                        
                    }
                    else if (text == "Delete droplet") {
                       
                        sort.states.UserState[sender] = { module: "dDroplet", stage: 1 };
                      
                    } 
                    else if (text == "Create droplet") {
                        sort.states.UserState[sender] = { module: "cDroplet", stage: 1 };
                    }
                    //TODO list backups for droplet 
                    else if (text == "Droplet action") {
                        sort.states.UserState[sender] = { module: "aDroplet", stage: 1 };

                    }
                    else if(text == "List images"){
                        sort.states.UserState[sender] = {module: "lImage", stage: 1};
                        sort.info[sender].count = 10;
                    }
                    else if(text == "List distribution images"){
                        sort.states.UserState[sender] = {module: "lDImage", stage: 1};
                        sort.info[sender].count = 10;
                    }
                    else if(text == "List application images"){
                        sort.states.UserState[sender] = {module: "lAImage", stage: 1};
                        sort.info[sender].count = 10;   
                    }
                    else if(text == "List user images"){
                     sort.states.UserState[sender] = {module: "lUImage", stage: 1};  
                    }
                    else if(text == "Delete image"){
                        sort.states.UserState[sender] = {module: "dImage", stage: 1};
                    }
                    else if(text == "Image actions"){
                        sort.states.UserState[sender] = {module: "aImage", stage: 1}
                    }
                    else if(text == "List block storage"){
                        sort.states.UserState[sender] = {module: "lBlock", stage: 1}   
                    }
                    else if(text == 'Create block storage'){
                        sort.states.UserState[sender] = { module: "cBlock", stage: 1}
                    }
                    else if(text == 'Create storage snapshot'){
                        sort.states.UserState[sender] = { module: "cBlockSnap", stage: 1}
                    }
                    else if(text == "Delete storage"){
                        sort.states.UserState[sender] = { module: "dBlock", stage: 1}
                    }
                    else if(text == "Storage action"){
                        sort.states.UserState[sender] = { module: "aStorage", stage: 1}   
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
