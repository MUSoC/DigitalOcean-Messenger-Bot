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
        findToken(sender).then(function(body){


        	// console.log(body);

	        if (event.message && event.message.text) {
	            let text = event.message.text;



	            

	                checkStatus(body, status, sender, text);

	            
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

	                    checkStatus(body, status, sender, text)

	                } else if (text == "Refresh droplets") {
	                    status = 4;
	                    checkStatus(body, status, sender, text)
	                }
	                else if(text=="Last actions"){
	                	status = 5;
	                	// console.log(token);
	                	checkStatus(body, status, sender, text)
                	}
                	else if(text=="List domains"){
                		status=6;
                		checkStatus(body, status, sender, text);
                	}
                	else if(text=="Refresh domains"){
                		status = 7;
                		checkStatus(body, status, sender, text);
                	}
                	else if(text=="List domain records"){
                		status = 8;
                		sendTextMessage(sender, "Select a domain");
                		// listDomains()
                		checkStatus(body, status, sender, text);
                	}
                	else if(text=="Refresh domain records"){
                		status=9;
                		sendTextMessage(sender, "Select a domain");
                		// continue;
                		checkStatus(body, status, sender, text);
                	}
                	else if(text=="List Snapshots"){
                		status=10;
                		checkStatus(body, status, sender, text);
                	}
                	else if(text=="List regions"){
                		status=11;
                		checkStatus(body, status, sender, text);
                	}
                	else if(text=="List sizes"){
                		status=12;
                		checkStatus(body, status, sender,text)
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

function checkStatus(digitoken, status, sender, text) {

    if (status == 1) {
        console.log("token save");
        saveToken(sender, text);
        status = 0;
    } else if (status == 2) {
        updateToken(sender, text);
        status = 0;
    } else if (status == 3) {
        // console.log("working")
        status=0;
        database.Droplets.find({ id: sender }, function(err, user) {
            if (err) throw err;
            console.log(user.length);
            for (var i = 0; i < user.length; i++) {
            	sendTextMessage(sender, "Droplet Name: "+user[i].dropletName+"\nDroplet memory: "+user[i].memory+"mb\nDroplet Disk: "+user[i].disk+"gb\nRegion: "+user[i].region )
            }
        })
        
    } else if (status == 4) {
    	status=0;
        database.User.findOne({ id: sender }, function(err, user) {
            if (err) throw err;
            dof.listDroplets(digitoken, function(body) {
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
    	// console.log(digitoken)
    	dof.lastActions(digitoken, function(body){
    		// console.log(body.actions.length)
    		for(var i=0;i<body.actions.length;i++){
    			sendTextMessage(sender, "Action: "+body.actions[i].type+"\nStatus: "+body.actions[i].status+"\nStarted At: "+body.actions[i].started_at+"\nCompleted At: "+body.actions[i].completed_at+"\nResource Type: "+body.actions[i].resource_type )
    		}
    	});
    	status=0;
    }
    else if(status==6){
    	status=0;
    	database.Domains.find({id:sender}, function(err, domain){
    		if (err) throw err;
    		// console.log(domain.length);
    		for(var i=0;i<domain.length;i++){
    			sendTextMessage(sender, "Domain Name: "+domain[i].domainName+"\nttl: "+domain[i].ttl);
    		}
    	})
    }
    else if(status==7){
    	dof.listDomains(digitoken, function(body){
    		console.log(typeof(body.domains[0].ttl));
    		saveDomain(sender, body);
    		
    	})
    }
    else if(status==8){

    }
    else if(status==9){
    	dof.listDomainRecords(digitoken, text, function(body){
    		console.log(body);
    		if(text=="Refresh domain records")
    			return;
    		saveDomainRecords(sender, body);


    	})
    }
    else if(status==10){
  	//TODO
  
    }
    else if(status==11){
    	dof.listRegions(digitoken, function(body){
    		console.log(body);

    		for(var i=0; i<body.regions.length; i++){
    			sendTextMessage(sender, "Name: "+body.regions[i].name+"\nSlug: "+body.regions[i].slug+"\nSizes: "+body.regions[i].sizes+"\nFeatures: "+body.regions[i].features+"\nAvailability: "+body.regions[i].available);
    		}
    	})
    }
    else if(status==12){
    	dof.listSizes(digitoken, function(body){
    		console.log(body);
    		for(var i=0; i<body.sizes.length; i++){
    			sendTextMessage(sender, "Memory: "+body.sizes[i].slug+"\nVirtual CPU: "+body.sizes[i].vcpus+"\nDisk: "+body.sizes[i].disk+"gb\nMonthly Price: "+body.sizes[i].price_monthly+"$\nHourly Price: "+body.sizes[i].price_hourly+"$\nRegions Available: "+body.sizes[i].regions+"\nAvailability: "+body.sizes[i].available)
    		}
    	})
    }
}





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

function saveDomain(sender, body){

	for(var i=0; i<body.domains.length; i++){
		var newDomain = new database.Domains({
			// console.log(typeof(body.domains[i].name)+"\n"+body.domains[i].ttl+"\n"+sender)
			id:sender, 
			domainName: body.domains[i].name,
			ttl: body.domains[i].ttl
		})
		newDomain.save(function(err) {
			if (err) throw err;
			sendTextMessage(sender, "Domain Saved");
		})
	}
}

function saveDomainRecords(sender, body){
    		for(var i=0; i<body.domain_records.length; i++){
				var newRecord = new domainrecords({
					id: sender,
					domainRecordId: body.domain_records[i].id,
					typeR: body.domain_records[i].type,
					name: body.domain_records[i].name,
					data: body.domain_records[i].data
				})
			newRecord.save(function(err){
				if (err) throw err;
				sendTextMessage(sender, "Domain Records Saved");
			})
		}
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
	return new Promise(function(resolve, reject){
	       database.User.findOne({id:sender}, function(err, user){
	       	resolve(user.token);
            	
            });
	   });
	  
}
