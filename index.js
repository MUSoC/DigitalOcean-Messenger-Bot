'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var https = require('https');
var fs = require('fs');
var database = require('./schema.js');
var Q = require('q');

var c = require('./config.js');
var dof = require('./dofunc.js');
var mess = require('./messenger.js');

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

    for (let i = 0; i < msg_event.length; i++) {
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id.toString();


        if ((event.message!=undefined)&&(!event.message.is_echo)) {
        	// console.log("hello");
        mess.findToken(sender).then(function(body){

        	// console.log("hello");
	        if (event.message && event.message.text) {
	            let text = event.message.text;



	            

	                mess.checkStatus(body, status, sender, text);

	            
	            if (status == 0) {
	                if (text == 'Token') {
	                    status = 1;
	                    // console.log(status);
	                    mess.mess.sendTextMessage(sender, "Enter Token");
	                } else if (text == "Update token") {
	                    status = 2;
	                    mess.sendTextMessage(sender, "Enter new Token");
	                } else if (text == "List droplet") {
	                    status = 3;

	                    mess.checkStatus(body, status, sender, text)

	                } else if (text == "Refresh droplets") {
	                    status = 4;
	                    mess.checkStatus(body, status, sender, text)
	                }
	                else if(text=="Last actions"){
	                	status = 5;
	                	console.log("hello");
	                	mess.checkStatus(body, status, sender, text)
                	}
                	else if(text=="List domains"){
                		status=6;
                		mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="Refresh domains"){
                		status = 7;
                		mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="List domain records"){
                		status = 8;
                		mess.sendTextMessage(sender, "Select a domain");
                		// listDomains()
                		mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="Refresh domain records"){
                		status=9;
                		mess.sendTextMessage(sender, "Select a domain");
                		// continue;
                		mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="List Snapshots"){
                		status=10;
                		mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="List regions"){
                		status=11;
                		mess.checkStatus(body, status, sender, text);
                	}
                	else if(text=="List sizes"){
                		status=12;
                		mess.checkStatus(body, status, sender,text)
                	}
            	}

        	}
    	}, function(err){
    		// console.log(err);
    	});
    }
    }
    res.sendStatus(200);
})







