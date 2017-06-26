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


        if ((event.message!=undefined)&&(!event.message.is_echo)) {
        	// console.log("hello");
        mess.findToken(sender).then(function(body){

        	// console.log("hello");

        	var distance = function(str1, str2){
        		var l = new leve(str1, str2);
        		return (1 - (l.distance / Math.max(str1.length, str2.length))) * 100;

        	}
        	console.log(distance("hello", "hel"));
	        if (event.message && event.message.text) {
	            let text = event.message.text;



	            // if(sort.states.UserState[sender].module!=undefined){

	            //     mess.checkStatus(body, status, sender, text, function(body){
	            //     	mess.sendTextMessage(sender, body.message);
	            //     });
	            // // }


	            // else{
	                if (text == 'Token') {
	                	// console.log("hello");
	                    // status = 1;
	                    sort.states.UserState[sender]={module: "eToken", stage: 1};
	                    sort.MessageQueue.UserMessage[sender] = {mesasge:''};
	                    // console.log("hello");
	                    // mess.sendTextMessage(sender, "Enter Token");
	                } else if (text == "Update token") {
	                    // status = 2;
	                    sort.states.UserState[sender]={module: "uToken", stage: 1};
	                    // mess.sendTextMessage(sender, "Enter new Token");
	                } else if (text == "List droplet") {
	                    // status = 3;
	                    sort.states.UserState[sender]={module: "lDroplet", stage: 1};
	                    // mess.checkStatus(body, status, sender, text)

	                } else if (text == "Refresh droplets") {
	                    // status = 4;
	                    // mess.checkStatus(body, status, sender, text)
	                    sort.states.UserState[sender]={module: "rDroplets", stage: 1};
	                }
	                else if(text=="Last actions"){
	                	// status = 5;
	                	// console.log("hello");
	                	sort.states.UserState[sender]={module: "lActions", stage: 1};
	                	// mess.checkStatus(body, status, sender, text)
                	}
                	else if(text=="List domains"){
                		// status=6;
                		sort.states.UserState[sender]={module: "lDomains", stage: 1};
                		// mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="Refresh domains"){
                		// status = 7;
                		// mess.checkStatus(body, status, sender, text);
                		sort.states.UserState[sender]={module: "rDomains", stage: 1};
                	}
                	else if(text=="List domain records"){
                		// status = 8;
                		// mess.sendTextMessage(sender, "Select a domain");
                		// listDomains()
                		sort.states.UserState[sender]={module: "lDomainRecords", stage: 1};
                		// mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="Refresh domain records"){
                		// status=9;
                		// mess.sendTextMessage(sender, "Select a domain");
                		// continue;
                		sort.states.UserState[sender]={module: "rDomainRecords", stage: 1};
                		// mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="List Snapshots"){
                		// status=10;
                		sort.states.UserState[sender]={module: "lSnapshots", stage: 1};
                		// mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="List regions"){
                		// status=11;
                		sort.states.UserState[sender]={module: "lRegions", stage: 1};
                		// mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="List sizes"){
                		// status=12;
                		sort.states.UserState[sender]={module: "lSizes", stage: 1};
                		// mess.checkStatus(body, status, sender,text)
                	}
                	else if(text=="Delete droplet"){
                		// status=13;
                		sort.states.UserState[sender]={module: "dDroplet", stage: 1};
                		// mess.checkStatus(body, status, sender, text)
                		// continue;
                	}
                    else if(text=="Create droplet"){
                        sort.states.UserState[sender]={module: "cDroplet", stage: 1};
                    }
                	else{

                	}
                	// console.log("hell");

            	if(sort.states.UserState[sender]!=undefined){
	                   	// console.log("hello");
  					    mess.checkStatus(body, status, sender, text, function(messbody){
  					    mess.sendTextMessage(sender, messbody)	
  					    // console.log("sup")
  					    });
  					    // console.log("xyz");
  					    
  					}
                	
            // }

        	}
        	// console.log("helllo");
    	}, function(err){
    		// console.log(err);
    	});
    	// console.log("hello");
      }
      // console.log(sort.states.UserState[sender]==undefined);
  //     if(sort.states.UserState[sender]!=undefined){
  //     mess.checkStatus(body, status, sender, text);
  // }
    }
    res.sendStatus(200);
})







