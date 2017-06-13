'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var https = require('https');
var fs = require('fs');
var database = require('./schema.js');

var c = require('./config.js');
var dof = require('./dofunc.js');

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
        if (event.message && event.message.text) {
            let text = event.message.text;
            console.log(event);




            if (!event.message.is_echo) {

                checkStatus(status, sender, text);

            }
            if (status == 0) {
                if (text == 'Token') {
                    status = 1;
                    // console.log(status);
                    sendTextMessage(sender, "Enter Token");
                } else if (text == "Update token") {
                    status = 2;
                    sendTextMessage(sender, "Enter new Token");
                } else if (text == "List droplet") {
                    status = 3;

                    checkStatus(status, sender, text)

                } else if (text == "Refresh droplets") {
                    status = 4;
                    checkStatus(status, sender, text)
                }
                else if(text=="Last actions"){
                	status = 5;
                	console.log(token);
                	checkStatus(status, sender, text)
                }
            }

        }
    }
    res.sendStatus(200);
})

function checkStatus(status, sender, text) {

    if (status == 1) {
        console.log("token save");
        saveToken(sender, text);
        status = 0;
    } else if (status == 2) {
        updateToken(sender, text);
        status = 0;
    } else if (status == 3) {
        // console.log("working")
        database.Droplets.find({ id: sender }, function(err, user) {
            if (err) throw err;
            console.log(user.length);
            for (var i = 0; i < user.length; i++) {
            	sendTextMessage(sender, "Droplet Name: "+user[i].dropletName+"\nDroplet memory: "+user[i].memory+"mb\nDroplet Disk: "+user[i].disk+"gb\nRegion: "+user[i].region )
            }
        })
    } else if (status == 4) {
        database.User.findOne({ id: sender }, function(err, user) {
            if (err) throw err;
            dof.listDroplets(user.token, function(body) {
            	//FIX Duplicate ISSUE
                for (var i = 0; i < body.droplets.length; i++) {
                    var newDroplet = new database.Droplets({
                        dropletId: body.droplets[i].id,
                        dropletName: body.droplets[i].name,
                        memory: body.droplets[i].memory,
                        disk: body.droplets[i].disk,
                        region: body.droplets[i].region.name,
                        id: sender

                    })
                    newDroplet.save(function(err) {
                        if (err) throw err;
                        // sendTextMessage(sender)
                    })

                }
                sendTextMessage(sender, "List saved");
            })
        })
    }
    else if(status==5){
    	var t = findToken(sender).then(
    	dof.lastActions(t, function(body){
    		console.log(body)
    	}));
    }
}

// if(status==0){

// }




function updateToken(sender, text) {
    console.log(sender);
    database.User.findOne({ id: sender }, function(err, user) {
        if (err) throw err;
        console.log(user);
        user.token = text;
        user.save(function(err) {
            if (err) throw err;
            sendTextMessage(sender, "New Token saved");
        })
    })
}

//write Test case of saved token
function saveToken(sender, text) {
    var newUser = new database.User({
        token: text,
        id: sender
    })

    newUser.save(function(err) {
        if (err) throw err;
        sendTextMessage(sender, "Token saved");
    })

}


function sendTextMessage(sender, text) {
    let messageData = { text: text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    })
}

function findToken(sender){
	       database.User.findOne({id:sender}, function(err, user){
	       	// console.log(user.token)
            	// callback(user.token);
            	return user.token;
            })
}
