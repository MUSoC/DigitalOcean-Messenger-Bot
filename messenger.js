'use strict'
var request = require('request');
var dof = require('./dofunc.js');
var database = require('./schema.js');
var c = require('./config.js');
var sort = require('./sort.js');

const token = c['fb'].page_token;


module.exports = {

sendTextMessage: function(sender, text) {
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
    },
empty: function(sender){
delete sort.states.UserState[sender];
// delete sort.MessageQueue.UserMessage[sender];
},


checkStatus: function(digitoken, status, sender, text, callback) {
    // console.log("working");
   var mod = sort.states.UserState[sender].module;
   var stage = sort.states.UserState[sender].stage;
    
    if(text.toLowerCase()=='exit'){
        module.exports.empty(sender);
    }
    else if (mod == 'eToken') {
       
        if(stage == 1){
            console.log("working");
            // var a = {message:"Hello"};
        // sort.MessageQueue[sender].message.push("hello");
        // sort.MessageQueue.UserMessage[sender].push("Enter Token");
        sort.states.UserState[sender].stage++;
        console.log("chal rha hai");
        callback("Enter Token and press exit to abort operation");
        // module.exports.mess(sender, );
    }
    else if(stage==2){
        saveToken(sender, text);
        // sort.states.UserState[sender].stage=null;
        // delete sort.states.UserState[sender];
        module.exports.empty(sender);
        }

        
    }
     else if (mod == 'uToken') {
        if(stage==1){
           sort.MessageQueue.UserMessage[sender].push("You are about to enter token. Type exit to cancel this event");
           sort.states.UserState[sender].stage++;
           callback(sort.MessageQueue.UserMessage[sender]) 
        }
        else if(stage==2){
        updateToken(sender, text);
        sort.MessageQueue.UserMessage[sender].push("Token updated");
        module.exports.empty(sender);
        callback(sort.MessageQueue.UserMessage[sender])
        }
        
        // status = 0;
    } else if (mod == 'lDroplet') {
        // console.log("working")
        // status=0;
        if(stage==1){
        database.Droplets.find({ id: sender }, function(err, user) {
            if (err) throw err;
            console.log(user.length);
            for (var i = 0; i < user.length; i++) {
                module.exports.sendTextMessage(sender, "Droplet Name: "+user[i].dropletName+"\nDroplet memory: "+user[i].memory+"mb\nDroplet Disk: "+user[i].disk+"gb\nRegion: "+user[i].region )
            }
        })
        module.exports.empty(sender);
    }
        
    } else if (mod == 'rDroplets') {
        if(stage==1){
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
                
                module.exports.sendTextMessage(sender, "List saved");
            })
        })
        module.exports.empty(sender);
    }
        
    }
    else if(mod == 'lActions'){
        if(stage == 1){
        console.log("hello")
        dof.lastActions(digitoken, function(body){
            // console.log(body.actions.length)
            for(var i=0;i<body.actions.length;i++){
                module.exports.sendTextMessage(sender, "Action: "+body.actions[i].type+"\nStatus: "+body.actions[i].status+"\nStarted At: "+body.actions[i].started_at+"\nCompleted At: "+body.actions[i].completed_at+"\nResource Type: "+body.actions[i].resource_type )
            }
        });
        module.exports.empty(sender);
    }
    
    }
    else if(mod == 'lDomains'){
        if(stage == 1){
        database.Domains.find({id:sender}, function(err, domain){
            if (err) throw err;
            // console.log(domain.length);
            for(var i=0;i<domain.length;i++){
                module.exports.sendTextMessage(sender, "Domain Name: "+domain[i].domainName+"\nttl: "+domain[i].ttl);
            }
        })
        module.exports.empty(sender);
    }
    }
    else if(mod == 'rDomains'){
        if(stage == 1){
            dof.listDomains(digitoken, function(body){
                console.log(typeof(body.domains[0].ttl));
                module.exports.saveDomain(sender, body);
                
            })
            module.exports.empty(sender);
        }
    }
    else if(status==8){

    }
    else if(mod == 'rDomainsRecords'){
        if(stage == 1){
            dof.listDomainRecords(digitoken, text, function(body){
                console.log(body);
                if(text=="Refresh domain records")
                    return;
                module.exports.saveDomainRecords(sender, body);
            })
            module.exports.empty(sender);
        }
    }
    else if(status==10){
    //TODO
  
    }
    else if(mod == 'lRegions'){
        if(stage == 1){
            dof.listRegions(digitoken, function(body){
                console.log(body);

                for(var i=0; i<body.regions.length; i++){
                    module.exports.sendTextMessage(sender, "Name: "+body.regions[i].name+"\nSlug: "+body.regions[i].slug+"\nSizes: "+body.regions[i].sizes+"\nFeatures: "+body.regions[i].features+"\nAvailability: "+body.regions[i].available);
                }
            })
            module.exports.empty(sender);
        }
    }
    else if(mod == 'lSizes'){
        if(stage == 1){
            dof.listSizes(digitoken, function(body){
                console.log(body);
                for(var i=0; i<body.sizes.length; i++){
                    module.exports.sendTextMessage(sender, "Memory: "+body.sizes[i].slug+"\nVirtual CPU: "+body.sizes[i].vcpus+"\nDisk: "+body.sizes[i].disk+"gb\nMonthly Price: "+body.sizes[i].price_monthly+"$\nHourly Price: "+body.sizes[i].price_hourly+"$\nRegions Available: "+body.sizes[i].regions+"\nAvailability: "+body.sizes[i].available)
                }
            })
            module.exports.empty(sender);
        }
    }
    else if(mod == 'dDroplet'){
        if(stage == 1){
            dof.listDroplets(digitoken, function(body){
                for(var i=0;i<body.droplets.length;i++){
                    module.exports.sendTextMessage(sender, ""+(i+1)+". Id: "+body.droplets[i].id+" name: "+body.droplets[i].name+"\n");
                }
            })
            module.exports.empty(sender);
        }
    }
},



updateToken: function (sender, text) {
    console.log(sender);
    database.User.findOne({ id: sender }, function(err, user) {
        if (err) throw err;
        console.log(user);
        user.token = text;
        user.save(function(err) {
            if (err) throw err;
            module.exports.sendTextMessage(sender, "New Token saved");
        })
    })
},

//write Test case of saved token
saveToken: function (sender, text) {
    var newUser = new database.User({
        token: text,
        id: sender
    })

    newUser.save(function(err) {
        if (err) throw err;
        module.exports.sendTextMessage(sender, "Token saved");
    })

},

saveDomain: function (sender, body){

    for(var i=0; i<body.domains.length; i++){
        var newDomain = new database.Domains({
            // console.log(typeof(body.domains[i].name)+"\n"+body.domains[i].ttl+"\n"+sender)
            id:sender, 
            domainName: body.domains[i].name,
            ttl: body.domains[i].ttl
        })
        newDomain.save(function(err) {
            if (err) throw err;
            module.exports.sendTextMessage(sender, "Domain Saved");
        })
    }
},

saveDomainRecords: function (sender, body){
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
                module.exports.sendTextMessage(sender, "Domain Records Saved");
            })
        }
},




findToken: function (sender){
    return new Promise(function(resolve, reject){
           database.User.findOne({id:sender}, function(err, user){
            resolve(user.token);
                
            });
       });
      
}

};