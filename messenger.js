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
    empty: function(sender) {
        delete sort.states.UserState[sender];
        delete sort.data[sender];
        // delete sort.MessageQueue.UserMessage[sender];
    },


    checkStatus: function(digitoken, status, sender, text, callback) {
        // console.log("working");
        var mod = sort.states.UserState[sender].module;
        var stage = sort.states.UserState[sender].stage;

        if (text.toLowerCase() == 'exit') {
            console.log("exit pressed");
            module.exports.empty(sender);
        } else if (mod == 'eToken') {

            if (stage == 1) {
                console.log("working");
                console.log(sort.states.UserState[sender]);
                // var a = {message:"Hello"};
                // sort.MessageQueue[sender].message.push("hello");
                // sort.MessageQueue.UserMessage[sender].push("Enter Token");
                sort.states.UserState[sender].stage++;
                console.log("chal rha hai");
                // callback("Enter Token and press exit to abort operation");
                module.exports.sendTextMessage(sender, "Enter token or press exir to abort the operation");
                // module.exports.mess(sender, );
            } else if (stage == 2) {
                module.exports.empty(sender);
                saveToken(sender, text);

                // sort.states.UserState[sender].stage=null;
                // delete sort.states.UserState[sender];
                
                module.exports.sendTextMessage(sender, "Token Saved");
                // callback("Token Saved");
            }


        } else if (mod == 'uToken') {
            if (stage == 1) {
                // sort.MessageQueue.UserMessage[sender].push("");
                sort.states.UserState[sender].stage++;
                callback("You are about to enter token. Type exit to cancel this event")
            } else if (stage == 2) {
                updateToken(sender, text);
                // sort.MessageQueue.UserMessage[sender].push("Token updated");
                module.exports.empty(sender);
                callback("Token Updated");
            }

            // status = 0;
        }




         else if (mod == 'lDroplet') {
            // console.log("working")
            // status=0;
            if (stage == 1) {
                module.exports.listDrop(sender,text, function(user){
             for (var i = 0; i < user.length; i++) {
                module.exports.sendTextMessage(sender, (i+1)+". Droplet Name: " + user[i].dropletName + "\nDroplet memory: " + user[i].memory + "mb\nDroplet Disk: " + user[i].disk + "gb\nRegion: " + user[i].region +"Droplet Id: "+user[i].dropletId)  
                     }
                 });

                module.exports.empty(sender);
            }

        }


         else if (mod == 'rDroplets') {
            if (stage == 1) {
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






         else if (mod == 'lActions') {
            if (stage == 1) {
                console.log("hello")
                dof.lastActions(digitoken, function(body) {
                    // console.log(body.actions.length)
                    for (var i = 0; i < body.actions.length; i++) {
                        module.exports.sendTextMessage(sender, "Action: " + body.actions[i].type + "\nStatus: " + body.actions[i].status + "\nStarted At: " + body.actions[i].started_at + "\nCompleted At: " + body.actions[i].completed_at + "\nResource Type: " + body.actions[i].resource_type)
                    }
                });
                module.exports.empty(sender);
            }

        }





         else if (mod == 'lDomains') {
            if (stage == 1) {
                database.Domains.find({ id: sender }, function(err, domain) {
                    if (err) throw err;
                    // console.log(domain.length);
                    for (var i = 0; i < domain.length; i++) {
                        module.exports.sendTextMessage(sender, "Domain Name: " + domain[i].domainName + "\nttl: " + domain[i].ttl);
                    }
                })
                module.exports.empty(sender);
            }
        } 



        else if (mod == 'rDomains') {
            if (stage == 1) {
                dof.listDomains(digitoken, function(body) {
                    console.log(typeof(body.domains[0].ttl));
                    module.exports.saveDomain(sender, body);

                })
                module.exports.empty(sender);
            }
        } else if (status == 8) {

        }



         else if (mod == 'rDomainsRecords') {
            if (stage == 1) {
                dof.listDomainRecords(digitoken, text, function(body) {
                    console.log(body);
                    if (text == "Refresh domain records")
                        return;
                    module.exports.saveDomainRecords(sender, body);
                })
                module.exports.empty(sender);
            }
        } else if (status == 10) {
            //TODO

        }



         else if (mod == 'lRegions') {
            if (stage == 1) {
                dof.listRegions(digitoken, function(body) {
                    console.log(body);

                    for (var i = 0; i < body.regions.length; i++) {
                        module.exports.sendTextMessage(sender, "Name: " + body.regions[i].name + "\nSlug: " + body.regions[i].slug + "\nSizes: " + body.regions[i].sizes + "\nFeatures: " + body.regions[i].features + "\nAvailability: " + body.regions[i].available);
                    }
                })
                module.exports.empty(sender);
            }
        } 


        else if (mod == 'lSizes') {
            if (stage == 1) {
                dof.listSizes(digitoken, function(body) {
                    console.log(body);
                    for (var i = 0; i < body.sizes.length; i++) {
                        module.exports.sendTextMessage(sender, "Memory: " + body.sizes[i].slug + "\nVirtual CPU: " + body.sizes[i].vcpus + "\nDisk: " + body.sizes[i].disk + "gb\nMonthly Price: " + body.sizes[i].price_monthly + "$\nHourly Price: " + body.sizes[i].price_hourly + "$\nRegions Available: " + body.sizes[i].regions + "\nAvailability: " + body.sizes[i].available)
                    }
                })
                module.exports.empty(sender);
            }
        } 


        else if (mod == 'dDroplet') {
            //TODO remove droplet from database
            if (stage == 1) {
                module.exports.sendTextMessage(sender, "Type \"current droplet\" from the following to delete a droplet");
                sort.states.UserState[sender].stage++;


            }
            else if(stage == 2){
                //TODO if user types other than current droplet
        module.exports.listDrop(sender,text, function(user){
             for (var i = 0; i < user.length; i++) {
                module.exports.sendTextMessage(sender, (i+1)+". Droplet Id: "+user[i].dropletId+ "\nDroplet Name: " + user[i].dropletName + "\nDroplet memory: " + user[i].memory + "mb\nDroplet Disk: " + user[i].disk + "gb\nRegion: " + user[i].region)  
                     }
                 });
        sort.states.UserState[sender].stage++;
            }
            else if(stage == 3){
                dof.deleteDroplet(digitoken, text, function(body){
                    //TODO droplet delete success or fail
                    // console.log(body);
                })
                module.exports.empty(sender)
            }

        } 



//Create Droplet
        else if (mod == 'cDroplet') {
            //TODO Success message on creating droplet
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                callback("Enter Name of the Droplet");


            } else if (stage == 2) {
                sort.data[sender] = { name: text };
                // console.log("chal rha")
                //TODO slug along with region name after fixing json array error
                var regions = [];
                sort.states.UserState[sender].stage++;
                dof.listRegions(digitoken, function(body) {
                    for(var i = 0;i < body.regions.length; i++){
                        regions.push(body.regions[i].slug);
                    }
                    console.log(regions);
                    callback("Enter region from following regions: \n"+regions);
                });
            }
            else if(stage == 3){
                sort.data[sender].region = text;
                var size = [];
                sort.states.UserState[sender].stage++;
                dof.listSizes(digitoken, function(body){
                    for(var i = 0; i < body.sizes.length; i++){
                        size.push(body.sizes[i].slug);
                    }
                    console.log(size);
                    callback("Enter the size from following sizes: \n"+size);
                });
            }
            else if(stage == 4){
                sort.data[sender].size = text;
                var image = [];
                sort.states.UserState[sender].stage++;
                dof.listImage(digitoken, function(body){
                    // console.log(body);
                    for(var i = 0; i < body.images.length; i++){
                        if(body.images[i].slug!=null){
                            console.log(body.images[i].slug);
                            image.push(body.images[i].slug);
                        }
                    }
                    console.log(image);
                callback("Choose a image");
                });
                
            }
            else if(stage == 5){
                sort.data[sender].image = text;
                // console.log(sort.data[sender])
                sort.states.UserState[sender].stage++;
                dof.createDroplet(digitoken, sort.data[sender],  function(body){
                    console.log(body);
                })
                module.exports.empty(sender);

            }

        }
        else if(mod == 'aDroplet'){
            // var droplet;
            // var data;
            if(stage == 1){
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter the droplet id for performing Action:");
            }
            else if(stage == 2){
                sort.info[sender] = {id: text};
                sort.states.UserState[sender].stage++;
                // console.log(droplet);
                module.exports.sendTextMessage(sender, "Select an Action \n1. Enable Backup \n2. Disable Backups \n3. Reboot \n4. Power Cycle Droplet \n5. Shutdown Droplet \n6. Power Off Droplet \n7. Power On Droplet \n8. Restore Droplet \n9. Password Reset \n10. Resize Droplet \n11. Rebuild Droplet \n12. Rename Droplet \n13. Enable IPv6 \n14. Enable Private \n15. SnapShot Droplet \n16. Retrieve a Droplet Action");
            }
            else if(stage == 3){
                if(text == 1){
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = {type: "enable_backups"};
                    dof.dropletActions(digitoken, sort.info[sender].id, sort.data[sender], function(body){
                        if(body.action==undefined){
                            console.log(body);
                            module.exports.sendTextMessage(sender, body.message);
                        }
                        else{
                            // console.log(body.action)
                            module.exports.sendTextMessage(sender, body.action.status);
                        }
                    })
                }
                else if(text == 2){
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = {type: "disable_backups"};
                    dof.dropletActions(digitoken, sort.info[sender].id, sort.data[sender], function(body){
                         console.log(body);
                        if(body.action==undefined){
                           
                            module.exports.sendTextMessage(sender, body.message);
                        }
                        else{
                            module.exports.sendTextMessage(sender, body.action.status);
                        }
                    })                   
                }
            }
        }

    },

    listDrop: function(sender, text, callback){
        database.Droplets.find({ id: sender }, function(err, user) {
            if (err) throw err;
            console.log(user.length);
            callback(user);
            // for (var i = 0; i < user.length; i++) {
            //     module.exports.sendTextMessage(sender, "1. Droplet Name: " + user[i].dropletName + "\nDroplet memory: " + user[i].memory + "mb\nDroplet Disk: " + user[i].disk + "gb\nRegion: " + user[i].region)
            
        })
    },

    updateToken: function(sender, text) {
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
    saveToken: function(sender, text) {
        database.User.findOne({id:sender}, function(err, user){
            if (err) throw err;
            user.token = text;
        user.save(function(err) {
            if (err) throw err;
            module.exports.sendTextMessage(sender, "Token saved");
            })
        })



    },

    saveDomain: function(sender, body) {

        for (var i = 0; i < body.domains.length; i++) {
            var newDomain = new database.Domains({
                // console.log(typeof(body.domains[i].name)+"\n"+body.domains[i].ttl+"\n"+sender)
                id: sender,
                domainName: body.domains[i].name,
                ttl: body.domains[i].ttl
            })
            newDomain.save(function(err) {
                if (err) throw err;
                module.exports.sendTextMessage(sender, "Domain Saved");
            })
        }
    },

    saveDomainRecords: function(sender, body) {
        for (var i = 0; i < body.domain_records.length; i++) {
            var newRecord = new domainrecords({
                id: sender,
                domainRecordId: body.domain_records[i].id,
                typeR: body.domain_records[i].type,
                name: body.domain_records[i].name,
                data: body.domain_records[i].data
            })
            newRecord.save(function(err) {
                if (err) throw err;
                module.exports.sendTextMessage(sender, "Domain Records Saved");
            })
        }
    },




//TODO need to fix the promise for new User
    findToken: function(sender) {
        return new Promise(function(resolve, reject) {
            database.User.findOne({ id: sender }, function(err, user) {
                if(user.token!=undefined){
                resolve(user.token);
            }
                else{
                    var newUser = new database.User({
                        id: sender
                    });
                    newUser.save(function(err){
                        if(err) throw err;
                        resolve("nothing");
                        // mmodule.exports.sendTextMessage(sender, "New User");
                    })
                }

            });
        });

    }

};
