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
		uri: "https://api.digitalocean.com/v2/droplets?page=1&per_page=5",
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(JSON.parse(body))
	})
},


// To create droplet 
createDroplet: function(callback, data) {

	request ({
		method: "POST",
		uri: "https://api.digitalocean.com/v2/droplets",
		// form: //enter form data
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){

	})

},

deleteDroplet: function(dotoken, id, callback){

	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/domains/"+id,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(body)
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



//delete a domain

deleteDomains: function(callback, domain) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/domains/"+domain,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(body)
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

deleteDomainRecords: function(callback, domain, record) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/domains/"+domain+"/records/"+record,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(body)
	})
},

//To perform different droplet action
dropletActions: function(callback, id, data) {

	 request({
	 	method: "POST",
	 	uri: "https://api.digitalocean.com/v2/droplets/"+id+"/actions",
	 	form: data,
	 	auth: {
	 		'bearer': dotoken
	 	}
	 }, function(err, response, body){
	 	callback(body)
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
		callback(body)
	})
},

//To delete a particular snapshot
deleteSnapshot: function(callback, id) {

	
	request ({
		method: "DELETE",
		uri: "https://api.digitalocean.com/v2/snapshots/"+id,
		auth: {
			'bearer': dotoken
		}
	}, function(err, response, body){
		callback(body)
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
}





};