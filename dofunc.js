var request = require('request');

module.exports = {

// To view last 5 actions
lastActions: function(dotoken, callback) {
	request({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/actions?page=1&per_page=5",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body));
	})
},

listDroplets: function(dotoken, callback) {
	//5 droplets at a time
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/droplets?page=1&per_page=100",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},


listAllImage: function(dotoken, callback) {

	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/images?page=1&per_page=87",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},


listDistImage: function(dotoken, callback) {

	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/images?page=1&per_page=87&type=distribution",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},

listAppImage: function(dotoken, callback) {

	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/images?page=1&per_page=87&type=application",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},

listUserImage: function(dotoken, callback) {

	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/images?page=1&per_page=87&private=true",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},

actionImage: function(dotoken, id, data, callback){

	 request({
	 	method: "POST",
	 	uri: "https://api.digitalocean.com/v2/images/"+id+"/actions",
	 	form: data,
	 	auth: {
	 		'bearer': dotoken
	 	}
	 }, function(err, response, body){
	 	callback(JSON.parse(body))
	 })
},

imageActionR: function(dotoken, id, rid, callback) {

		request({
	 	method: "GET",
	 	uri: "https://api.digitalocean.com/v2/images/"+id+"/actions/"+rid,
	 	auth: {
	 		'bearer': dotoken
	 	}
	 }, function(err, response, body){
	 	callback(JSON.parse(body))
	 })
},

//TODO update image

deleteImage: function(dotoken, id, callback) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/images/"+id,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},


// To create droplet 
createDroplet: function(dotoken, data, callback) {
	// JSON.parse
	request ({
		method: "POST",
		uri: "https://api.digitalocean.com/v2/droplets",
		form: data,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body));

	})

},

deleteDroplet: function(dotoken, id, callback){

	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/droplets/"+id,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		console.log(response);
		callback("nothing");
	})
},


listDomains: function(dotoken, callback) {

	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/domains",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},

//create domain
createDomain: function(dotoken, data, callback){
	request({
		 	method: "POST",
		 	uri: "https://api.digitalocean.com/v2/domains",
		 	form: data,
		 	auth: {
		 		'bearer': dotoken
		 	}
		 }, function(err, response, body){
		 	callback(JSON.parse(body))
		 })
},


//delete a domain

deleteDomain: function(dotoken, domain, callback) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/domains/"+domain,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		// console.log(body.length)
		if(body.length == 0){
			callback(body)
		}
		else{
			callback(JSON.parse(body))
		}
	})
},


//To list all domain records
listDomainRecords: function(dotoken, domain, callback) {
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/domains/"+domain+"/records",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},

//create domain records
addDomainRecord: function(dotoken, Udomain, data, callback){
	// console.log("https://api.digitalocean.com/v2/domains/"+Udomain+"/records");
	// console.log(dotoken); 

	request({
		 	method: "POST",
		 	uri: "https://api.digitalocean.com/v2/domains/"+Udomain+"/records",
		 	form: data,
		 	auth: {
		 		'bearer': dotoken
		 	}
		 }, function(err, response, body){
		 	callback(JSON.parse(body))
		 })
},

//update domain record
updateDomainRecords: function(callback, domain, record, data) {
		request ({
		method: "PUT",
		form: data,
		uri: "https://api.digitalocean.com/v2/domains/"+domain+"/records/"+record,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(body)
	})
},





//To delete domain records

deleteDomainRecords: function(dotoken, Udomain, record, callback) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/domains/"+Udomain+"/records/"+record,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){

		if(body.length == 0){
			callback(body)
		}
		else{
			callback(JSON.parse(body))
		}
	})
},

//To perform different droplet action
dropletActions: function(dotoken, id, data, callback) {

	 request({
	 	method: "POST",
	 	uri: "https://api.digitalocean.com/v2/droplets/"+id+"/actions",
	 	form: data,
	 	auth: {
	 		'bearer': dotoken
	 	}
	 }, function(err, response, body){
	 	callback(JSON.parse(body))
	 })
},

dropletActionR: function(dotoken, id, rid, callback) {

		request({
	 	method: "GET",
	 	uri: "https://api.digitalocean.com/v2/droplets/"+id+"/actions/"+rid,
	 	auth: {
	 		'bearer': dotoken
	 	}
	 }, function(err, response, body){
	 	callback(JSON.parse(body))
	 })
},



// list all load balancer

listLoadBalancer: function(callback) {

	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/load_balancers",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(body)
	})
},

//TODO Load balancer




//to list all the snapshots
listSnapshots: function(dotoken, callback) {
	//5 snapshots at a time
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/snapshots?page=1&per_page=5",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},

//To delete a particular snapshot
deleteSnapshot: function(dotoken, id, callback) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/snapshots/"+id,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){

		if(body.length == 0){
			callback(body)
		}
		else{
			callback(JSON.parse(body))
		}
	})
},


//to list all the available Regions
listRegions: function(dotoken, callback) {
	
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/regions",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},


//to list all the available sizes
listSizes: function(dotoken, callback) {
	
	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/sizes",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},

listBlockS: function(dotoken, callback) {

	
	request ({
		method: "GET",
		uri: "https://api.digitalocean.com/v2/volumes",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},

createStorage: function(dotoken, data, callback){
	request({
		 	method: "POST",
		 	uri: "https://api.digitalocean.com/v2/volumes",
		 	form: data,
		 	auth: {
		 		'bearer': dotoken
		 	}
		 }, function(err, response, body){
		 	callback(JSON.parse(body))
		 })
},


createSnapshotStorage: function(dotoken, id, data, callback){

		request({
		 	method: "POST",
		 	uri: "https://api.digitalocean.com/v2/volumes/"+id+"/snapshots",
		 	form: data,
		 	auth: {
		 		'bearer': dotoken
		 	}
		 }, function(err, response, body){
		 	callback(JSON.parse(body))
		 })
},


deleteVolume: function(dotoken, name, reg, callback) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/volumes?name="+name+"&region="+reg,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){

		if(body.length == 0){
			callback(body)
		}
		else{
			callback(JSON.parse(body))
		}
	})
},

volumeAction: function(dotoken, data, callback){
	request({
	 	method: "POST",
	 	uri: "https://api.digitalocean.com/v2/volumes/actions",
	 	form: data,
	 	auth: {
	 		'bearer': dotoken
	 	}
	 }, function(err, response, body){
	 	callback(JSON.parse(body))
	 })
}







};