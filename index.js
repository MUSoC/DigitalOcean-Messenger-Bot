'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var https = require('https');
var fs = require('fs');

var ssl = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.diuda.me/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.diuda.me/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/www.diuda.me/chain.pem')
};

https.createServer(ssl, app).listen(444);

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


const token = "EAATkvGTDWk0BAGIT3kZAN0bP0meHSgVzNfZB0ZC8TFGeKaqiHgyDGTqgS946OeJKCQ4ZA3pgyxrQt8ChCuaQW83WU4hbWwKRQ9lD1NQuShfgQlGHgKsBDRoZAyZC13VZBovXgWXTYRBuxrDfJFpNzL6Kf8bvnkSWYQtdgAWdxezWAZDZD"

app.get('/', function(req, res){
	if(req.query['hub.verify_token']===token){
		res.send(req.query['hub.challenge'])
	}
	res.send(req.query['hub.challenge']);
})

app.post('/', function(req, res){
	let msg_event = req.body.entry[0].messaging;
	for (let i = 0; i< msg_event.length; i++){
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;
		if (event.message && event.message.text){
			let text = event.message.text;
			// let statusCode = JSON.stringify(sendReq());
			// console.log(JSON.stringify(sendReq()));
			sendTextMessage(sender, "response of the request "+sendReq()+" Ram Ram chacha : "+ sender)
		}
	}
	res.sendStatus(200);
})


function sendTextMessage(sender, text){
	let messageData = { text: text }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body){
		if (error){
			console.log('Error sending message: ', error);
		}
		else if(response.body.error) {
			console.log('Error: ', response.body.error);
		}
	})
}
var code;

function sendReq() {
	request({
		method: "GET",
		uri: "https://httpbin.org/get"
	}, function(err, response, body){
		code = body;
	})
	console.log(code);
	return code;
}