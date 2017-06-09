'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var https = require('https');
var fs = require('fs');

var c = require('./config.js');

var ssl = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.diuda.me/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.diuda.me/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/www.diuda.me/chain.pem')
};

https.createServer(ssl, app).listen(444);

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


const token = c['fb'].page_token;


app.get('/', function(req, res){
	if(req.query['hub.verify_token']===token){
		res.send(req.query['hub.challenge'])
	}
	res.send(req.query['hub.challenge']);
})



const user_token = c['do'].auth_token;


app.post('/', function(req, res){
	let msg_event = req.body.entry[0].messaging;
	for (let i = 0; i< msg_event.length; i++){
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;
		if (event.message && event.message.text){
			let text = event.message.text;

			sendReq(function(body){
				var v = JSON.parse(body);
				console.log(v.droplets[0].name);
				sendTextMessage(sender, "Server Name "+v.droplets[0].name+" Ram Ram chacha : "+ sender)
				// return JSON.stringify(body);

			})
			// console.log(r);
			
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


function sendReq(callback) {
	request({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/droplets?page=1&per_page=1",
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		// code = body;
		// console.log(code);
		callback(body);
	})
	// console.log(code);
	// return code;
}



// To view last actions
function lastActions(callback) {
	request({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/actions?page=1&per_page=1",
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body);
	})
}

function listDroplets(callback) {
	//5 droplets at a time
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/droplets?page=1&per_page=5",
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}


// To create droplet 
function createDroplet(callback, data) {

	request ({
		method: "POST",
		uri: "https://api.digitalocean.com/v2/droplets",
		// form: //enter form data
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){

	})

}


function listDomains(callback) {
	//5 droplets at a time
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/domains",
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}

//create domain



//delete a domain

function deleteDomains(callback, domain) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/domains/"+domain,
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}


//To list all domain records
function listDomainRecords(callback, domain) {
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/domains/"+domain+"/records",
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}

//create domain records


//update domain record
function updateDomainRecords(callback, domain, record, data) {
		request ({
		method: "PUT",
		form: data,
		uri: "https://api.digitalocean.com/v2/domains/"+domain+"/records/"+record,
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}





//To delete domain records

function deleteDomainRecords(callback, domain, record) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/domains/"+domain+"/records/"+record,
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}


//To perform different droplet action
function dropletActions(callback, id, data) {

	 request({
	 	method: "POST",
	 	uri: "https://api.digitalocean.com/v2/droplets/"+id+"/actions",
	 	form: data,
	 	auth: {
	 		'bearer': user_token
	 	}
	 }, function(err, response, body){
	 	callback(body)
	 })
}



// list all load balancer

function listLoadBalancer(callback) {

	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/load_balancers",
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}

//TODO Load balancer




//to list all the snapshots
function listSnapshots(callback) {
	//5 snapshots at a time
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/snapshots?page=1&per_page=5",
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}

//To delete a particular snapshot
function deleteSnapshot(callback, id) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/snapshots/"+id,
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}


//to list all the available Regions
function listRegions(callback) {
	
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/regions",
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}


//to list all the available sizes
function listSizes(callback) {
	
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/sizes",
		auth: {
			'bearer': user_token
		}
	}, function(err, response, body){
		callback(body)
	})
}









