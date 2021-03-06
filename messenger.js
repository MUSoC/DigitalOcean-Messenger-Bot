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
        // console.log(digitoken);
        var mod = sort.states.UserState[sender].module;
        var stage = sort.states.UserState[sender].stage;

        if (text.toLowerCase() == 'exit') {
            console.log("exit pressed");
            module.exports.empty(sender);
            module.exports.sendTextMessage(sender, "OPeration aborted")
        } 

        //Enter token for first time user
        else if (mod == 'eToken') {

            if (stage == 1) {
                console.log("working");
                console.log(sort.states.UserState[sender]);
                sort.states.UserState[sender].stage++;
                console.log("chal rha hai");
                module.exports.sendTextMessage(sender, "Enter token or press exir to abort the operation");
            } else if (stage == 2) {

                saveToken(sender, text);
                module.exports.sendTextMessage(sender, "Token Saved");
                module.exports.empty(sender);
            }


        } 

        //Update token
        else if (mod == 'uToken') {
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                callback("You are about to enter token. Type exit to cancel this event")
            } else if (stage == 2) {
                updateToken(sender, text);
                module.exports.empty(sender);
                callback("Token Updated");
            }

        }

        //List Droplet
         else if (mod == 'lDroplet') {
            if (stage == 1) {
                module.exports.listDrop(digitoken, callback);
                module.exports.empty(sender);
            }

        } 


        //List Action
         else if (mod == 'lActions') {
            if (stage == 1) {
                // console.log("hello")
                dof.lastActions(digitoken, function(body) {
                    // console.log(body.actions.length)
                    for (var i = 0; i < body.actions.length; i++) {
                        module.exports.sendTextMessage(sender, "Action: " + body.actions[i].type + "\nStatus: " + body.actions[i].status + "\nStarted At: " + body.actions[i].started_at + "\nCompleted At: " + body.actions[i].completed_at + "\nResource Type: " + body.actions[i].resource_type)
                    }
                    module.exports.empty(sender);
                });
                
            }

        }




        //List domain Module
        else if (mod == 'lDomains') {
            if (stage == 1) {
                dof.listDomains(digitoken, function(body){
                    for(var i = 0; i<body.domains.length; i++ ){
                        callback("Name: "+body.domains[i].name+"\nTTL: "+body.domains[i].ttl+"\nZone File: "+body.domains[i].zone_file)
                    }
                    module.exports.empty(sender);
                })
                
            }
        }




        //Add domain records
        else if (mod == 'aDomainRecord') {
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter the domain")
            } else if (stage == 2) {
                sort.info[sender].domain = text;
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter the type of Record");
            } else if (stage == 3) {
                sort.states.UserState[sender].stage++;
                sort.data[sender] = { type: text };
                module.exports.sendTextMessage(sender, "Enter name if applicable or type null to leave this part");
            } else if (stage == 4) {
                sort.states.UserState[sender].stage++;
                if (text.toLowerCase() != 'null') {
                    sort.data[sender].name = text;
                }
                module.exports.sendTextMessage(sender, "Enter data if applicable or type null to leave this part")
            } else if (stage == 5) {
                sort.states.UserState[sender].stage++;
                if (text.toLowerCase() != 'null') {
                    sort.data[sender].data = text;
                }
                module.exports.sendTextMessage(sender, "Enter Priority if applicable or null");
            } else if (stage == 6) {
                sort.states.UserState[sender].stage++;
                if (text.toLowerCase() != 'null') {
                    sort.data[sender].priority = text;
                } else {
                    sort.data[sender].priority = null;
                }
                module.exports.sendTextMessage(sender, "Enter port if applicable or null");
            } else if (stage == 7) {
                sort.states.UserState[sender].stage++;
                if (text.toLowerCase() != 'null') {
                    sort.data[sender].port = text;
                } else {
                    sort.data[sender].port = null;
                }
                module.exports.sendTextMessage(sender, "Enter weight if applicable or null");
            } else if (stage == 8) {
                sort.states.UserState[sender].stage++;
                if (text.toLowerCase() != 'null') {
                    sort.data[sender].weight = text;
                } else {
                    sort.data[sender].weight = null;
                }
                module.exports.sendTextMessage(sender, "Press any key to continue or exit abort\n" + JSON.stringify(sort.data[sender]))
            } else if (stage == 9) {
                console.log(digitoken)
                dof.addDomainRecord(digitoken, sort.info[sender].domain, sort.data[sender], function(body) {
                    // console.log(body);
                    if (body.id) {
                        module.exports.sendTextMessage(sender, "Id: " + body.id + "\n Message: " + body.message)
                    } else {
                        module.exports.sendTextMessage(sender, "Record Added\nDomain record id: " + body.domain_record.id + "\nType: " + body.domain_record.type + "\nName: " + body.domain_record.name + "\nData: " + body.domain_record.data + "\nTTL: " + body.domain_record.ttl)
                    }
                    module.exports.empty(sender);
                })
            }

        }

        //List domain records
        else if (mod == 'lDomainRecords') {
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter domain name")
            } else if (stage == 2) {
                sort.info[sender].domain = text;
                dof.listDomainRecords(digitoken, sort.info[sender].domain, function(body) {
                    console.log(body)
                    for (var i = 0; i < body.domain_records.length; i++) {
                        module.exports.sendTextMessage(sender, "domain record id: " + body.domain_records[i].id + "\ntype: " + body.domain_records[i].type + "\nName: " + body.domain_records[i].name + "\nData: " + body.domain_records[i].data + "\nPriority: " + body.domain_records[i].priority + "\nPort: " + body.domain_records[i].port + "\nttl: " + body.domain_records[i].ttl + "\nWeight: " + body.domain_records[i].weight);
                    }
                    module.exports.empty(sender);
                })
            }
        }

        //Delete domain records module
        else if (mod == 'dDomainRecord') {
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter domain name")
            } else if (stage == 2) {
                sort.states.UserState[sender].stage++;
                sort.info[sender].domain = text;
                module.exports.sendTextMessage(sender, "Enter domain record id")
            } else if (stage == 3) {
                sort.info[sender].record = text;
                dof.deleteDomainRecords(digitoken, sort.info[sender].domain, sort.info[sender].record, function(body) {
                    console.log(body.id)
                    if (body.id) {
                        module.exports.sendTextMessage(sender, "id: " + body.id + "\nMessage: " + body.message)

                    } else {
                        //TODO check if this is working
                        module.exports.sendTextMessage(sender, "Domain Record Deleted Successfully")
                    }

                    module.exports.empty(sender)
                })
            }
        } 



        //List regions
        else if (mod == 'lRegions') {
            if (stage == 1) {
                dof.listRegions(digitoken, function(body) {
                    console.log(body);

                    for (var i = 0; i < body.regions.length; i++) {
                        module.exports.sendTextMessage(sender, "Name: " + body.regions[i].name + "\nSlug: " + body.regions[i].slug + "\nSizes: " + body.regions[i].sizes + "\nFeatures: " + body.regions[i].features + "\nAvailability: " + body.regions[i].available);
                    }
                    module.exports.empty(sender);
                })
                
            }
        } 

        //List Sizes
        else if (mod == 'lSizes') {
            if (stage == 1) {
                dof.listSizes(digitoken, function(body) {
                    console.log(body);
                    for (var i = 0; i < body.sizes.length; i++) {
                        module.exports.sendTextMessage(sender, "Memory: " + body.sizes[i].slug + "\nVirtual CPU: " + body.sizes[i].vcpus + "\nDisk: " + body.sizes[i].disk + "gb\nMonthly Price: " + body.sizes[i].price_monthly + "$\nHourly Price: " + body.sizes[i].price_hourly + "$\nRegions Available: " + body.sizes[i].regions + "\nAvailability: " + body.sizes[i].available)
                    }
                    module.exports.empty(sender);
                })
                
            }
        } 

        //Delete a Droplet
        else if (mod == 'dDroplet') {
            //TODO remove droplet from database
            if (stage == 1) {
                module.exports.sendTextMessage(sender, "Type \"current droplets\" to list droplets for deleting a droplet");
                sort.states.UserState[sender].stage++;


            } else if (stage == 2) {
                //TODO if user types other than current droplet
                if(text.toLowerCase() == 'current droplets'){
                    module.exports.listDrop(digitoken, callback)
                    sort.states.UserState[sender].stage++;
                }
            } else if (stage == 3) {
                dof.deleteDroplet(digitoken, text, function(body) {
                    //TODO droplet delete success or fail
                    // console.log(body);
                    if(body.id){
                        callback("ID: "+body.id+"\nMessage: "+body.message)
                    }
                    else{
                        callback("Droplet is getting deleted")
                    }
                    module.exports.empty(sender)
                })
                
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
                    for (var i = 0; i < body.regions.length; i++) {
                        regions.push(body.regions[i].slug);
                    }
                    console.log(regions);
                    callback("Enter region from following regions: \n" + regions);
                });
            } else if (stage == 3) {
                sort.data[sender].region = text;
                var size = [];
                sort.states.UserState[sender].stage++;
                dof.listSizes(digitoken, function(body) {
                    for (var i = 0; i < body.sizes.length; i++) {
                        size.push(body.sizes[i].slug);
                    }
                    console.log(size);
                    callback("Enter the size from following sizes: \n" + size);
                });
            } else if (stage == 4) {
                sort.data[sender].size = text;
                var image = [];
                sort.states.UserState[sender].stage++;
                dof.listDistImage(digitoken, function(body) {
                    // console.log(body);
                    for (var i = 0; i < body.images.length; i++) {
                        if (body.images[i].slug != null) {
                            console.log(body.images[i].slug);
                            image.push(body.images[i].slug);
                        }
                    }
                    console.log(image);
                    callback("Choose a image");
                });

            } else if (stage == 5) {
                sort.data[sender].image = text;
                sort.states.UserState[sender].stage++;

                dof.createDroplet(digitoken, sort.data[sender], function(body) {
                    console.log(body);
                    if(body.id){
                        //TODO TEST THIS
                        callback("ID: "+body.id+"\nMessage: "+body.message)
                    }
                    else{
                        callback("Droplet Id: "+body.droplet.id+"\nName: "+body.droplet.name+"\nMemory: "+body.droplet.memory+"\nCreated At: "+body.droplet.created_at)
                    }
                })
                module.exports.empty(sender);

            }

        }


        //Addig domain Module
        else if (mod == 'aDomain') {
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter the name of the domain");
            } else if (stage == 2) {
                sort.data[sender] = { name: text };
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter the IP address");
            } else if (stage == 3) {
                sort.data[sender].ip_address = text;
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Press any key to continue or exit to abort\n" + JSON.stringify(sort.data[sender]))
            } else if (stage == 4) {
                dof.createDomain(digitoken, sort.data[sender], function(body) {
                    if (body.id) {
                        module.exports.sendTextMessage(sender, body.message)
                    } else {
                        module.exports.sendTextMessage(sender, "Domain Added\nName: " + body.domain.name + "\nTTL: " + body.domain.ttl + "\nZone File: " + body.domain.zone_file);
                    }
                    console.log(body);
                    module.exports.empty(sender);
                })
            }

        }


        //Delete Domain Module
        else if (mod == 'dDomain') {
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter the domain you want to delete");
            } else if (stage == 2) {
                sort.data[sender] = { domain: text };
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Press any key to continue or exit to abort\n" + JSON.stringify(sort.data[sender]))
            } else if (stage == 3) {
                dof.deleteDomain(digitoken, sort.data[sender].domain, function(body) {
                    //TODO appropriate message for success and failure
                    console.log(body);
                    module.exports.empty(sender);
                    if (body.id) {
                        module.exports.sendTextMessage(sender, "id: " + body.id + "\nMessage: " + body.message)

                    } else {
                        //TODO check if this is working
                        module.exports.sendTextMessage(sender, "Domain Deleted Successfully")
                    }

                })
            }

        }



        //Action Droplet Module
        else if (mod == 'aDroplet') {

            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter the droplet id for performing Action:");
            } else if (stage == 2) {
                sort.info[sender].id = text;
                sort.states.UserState[sender].stage++;
                // console.log(droplet);
                module.exports.sendTextMessage(sender, "Select an Action \n1. Enable Backup \n2. Disable Backups \n3. Reboot \n4. Power Cycle Droplet \n5. Shutdown Droplet \n6. Power Off Droplet \n7. Power On Droplet \n8. Restore Droplet \n9. Password Reset \n10. Resize Droplet \n11. Rebuild Droplet \n12. Rename Droplet \n13. Enable IPv6 \n14. Enable Private \n15. SnapShot Droplet \n16. Retrieve a Droplet Action");
            } else if (stage == 3) {

                sort.states.UserState[sender].stage++;
                if (text == '1') {
                    console.log("Stage 3")
                    sort.info[sender].actionType = 'eb';
                    sort.info[sender].actionStage = 1;
                } else if (text == 2) {
                    sort.info[sender].actionType = 'db';
                    sort.info[sender].actionStage = 1;
                } else if (text == 3) {
                    sort.info[sender].actionType = 'reb';
                    sort.info[sender].actionStage = 1;
                } else if (text == 4) {
                    sort.info[sender].actionType = 'pcd';
                    sort.info[sender].actionStage = 1;
                } else if (text == 5) {
                    sort.info[sender].actionType = 'shutdd';
                    sort.info[sender].actionStage = 1;
                } else if (text == 6) {
                    sort.info[sender].actionType = 'poff';
                    sort.info[sender].actionStage = 1;
                } else if (text == 7) {
                    sort.info[sender].actionType = 'pon';
                    sort.info[sender].actionStage = 1;
                } else if (text == 8) {
                    sort.info[sender].actionType = 'resd';
                    sort.info[sender].actionStage = 1;
                } else if (text == 9) {
                    sort.info[sender].actionType = 'pr';
                    sort.info[sender].actionStage = 1;
                } else if (text == 10) {
                    sort.info[sender].actionType = 'red';
                    sort.info[sender].actionStage = 1;
                } else if (text == 11) {
                    sort.info[sender].actionType = 'rbd';
                    sort.info[sender].actionStage = 1;
                } else if (text == 12) {
                    sort.info[sender].actionType = 'rd';
                    sort.info[sender].actionStage = 1;
                } else if (text == 13) {
                    sort.info[sender].actionType = 'eip6';
                    sort.info[sender].actionStage = 1;
                } else if (text == 14) {
                    sort.info[sender].actionType = 'epn';
                    sort.info[sender].actionStage = 1;
                } else if (text == 15) {
                    sort.info[sender].actionType = 'sd';
                    sort.info[sender].actionStage = 1;
                } else if (text == 16) {
                    sort.info[sender].actionType = 'da';
                    sort.info[sender].actionStage = 1;
                }
                module.exports.sendTextMessage(sender, "Press Y for Confirm");
                console.log(sort.info[sender].actionType);
            } else if (stage == 4) {
                console.log("Stage 4")
                var action = sort.info[sender].actionType;
                var aStage = sort.info[sender].actionStage;

                //Enable Backup
                if (action == 'eb') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "enable_backups" };
                    // sort.states.UserState[sender].stage++;
                    module.exports.sendTextMessage(sender, "Press any key to continue\n" + JSON.stringify(sort.data[sender]));


                } 

                //Disable Backup
                else if (action == 'db') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "disable_backups" };
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))
                } 

                //Reboot Droplet
                else if (action == 'reb') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "reboot" };
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))

                } 

                // Power cycle of a droplet
                else if (action == 'pcd') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "power_cycle" };
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))
                } 

                // Shut Down a droplet
                else if (action == 'shutdd') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "shutdown" };
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))
                } 

                // Power off a droplet
                else if (action == 'poff') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "power_off" };
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))
                } 

                // Power On a droplet
                else if (action == 'pon') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "power_on" };
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))
                }
                //TODO Restore a Droplet
                else if (action == 'resd') {
                    //TODO backup image retrieve for restore
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "restore" };
                    //TODO
                    // sort.data[sender].image = imageID;
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))
                } 

                //Password reset a droplet
                else if (action == 'pr') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "password_reset" };
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))
                }

                //RESIZE a droplet
                else if (action == 'red') {
                    // sort.states.UserState[sender].stage++;
                    var size = [];
                    if (aStage == 1) {
                        sort.data[sender] = { type: "resize" };
                        sort.info[sender].actionStage++;
                        console.log(sort.info[sender].actionStage)
                        module.exports.sendTextMessage(sender, "Do you also want to resize droplet?");
                    } else if (aStage == 2) {
                        console.log(sort.data[sender])
                        if (text.toLowerCase() == 'yes') {
                            sort.data[sender].disk = true;
                        } else {
                            sort.data[sender].disk = false;
                        }
                        // console.log("working")
                        dof.listSizes(digitoken, function(body) {
                            console.log(body)
                            for (var i = 0; i < body.sizes.length; i++) {
                                // console.log(body.sizes[0].slug)
                                size.push(body.sizes[i].slug);

                            }
                            sort.info[sender].actionStage++;
                            module.exports.sendTextMessage(sender, "Select a size from following sizes: \n" + size);
                        });
                    } else if (aStage == 3) {
                        sort.data[sender].size = text;
                        module.exports.sendTextMessage(sender, "Press any key to continue or exit to abort\n" + JSON.stringify(sort.data[sender]));
                        sort.states.UserState[sender].stage++;
                    }

                } 

                //Rebuild a droplet
                else if (action == 'rbd') {
                    if (aStage == 1) {
                        sort.data[sender] = { type: 'rebuild' };
                        sort.info[sender].actionStage++;
                        module.exports.sendTextMessage(sender, "Enter Image name: ");
                    } else if (aStage == 2) {
                        sort.data[sender].image = text;
                        sort.states.UserState[sender].stage++;
                        module.exports.sendTextMessage(sender, "Press any key to conitnue or exit to abort\n" + JSON.stringify(sort.data[sender]))
                    }


                } 

                // Rename a droplet
                else if (action == 'rd') {
                    if (aStage == 1) {
                        sort.data[sender] = { type: 'rename' };
                        sort.info[sender].actionStage++;
                        module.exports.sendTextMessage(sender, "Enter new name");
                    } else if (aStage == 2) {
                        sort.data[sender].name = text;
                        sort.states.UserState[sender].stage++;
                        module.exports.sendTextMessage(sender, "Press any key to conitnue or exit to abort\n" + JSON.stringify(sort.data[sender]))
                    }
                } 

                // Enable ipv6
                else if (action == 'eip6') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "enable_ipv6" };
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))
                } 

                // Enable Private Networking
                else if (action == 'epn') {
                    sort.states.UserState[sender].stage++;
                    sort.data[sender] = { type: "enable_private_networking" };
                    module.exports.sendTextMessage(sender, "Press any Key to Continue \n" + JSON.stringify(sort.data[sender]))
                } 

                // Take a snapshot of a droplet
                else if (action == 'sd') {
                    if (aStage == 1) {
                        sort.data[sender] = { type: 'snapshot' };
                        sort.info[sender].actionStage++;
                        module.exports.sendTextMessage(sender, "Name of your snapshot");
                    } else if (aStage == 2) {
                        sort.data[sender].name = text;
                        sort.states.UserState[sender].stage++;
                        module.exports.sendTextMessage(sender, "Press any key to conitnue or exit to abort\n" + JSON.stringify(sort.data[sender]))
                    }

                } 


                else if (action == 'da') {
                    if (aStage == 1) {
                        sort.info[sender].actionStage++;
                        module.exports.sendTextMessage(sender, "Enter Action Id");
                    } else if (aStage == 2) {
                        dof.dropletActionR(digitoken, sort.info[sender].id, text, function(body) {
                            module.exports.sendTextMessage(sender, "Action id: " + body.action.id + "\nStatus: " + body.action.status + "\nType: " + body.action.type + "\nStarted At: " + body.action.started_at + "\nCompleted At: " + body.action.completed_at);
                            module.exports.empty(sender)
                        })
                    }
                }
            } else if (stage == 5) {
                console.log("Stage 5: " + sort.info[sender].id + " data" + sort.data[sender])
                dof.dropletActions(digitoken, sort.info[sender].id, sort.data[sender], function(body) {
                    console.log(sort.info[sender].id)
                    console.log(body);
                    if (body.action == undefined) {

                        module.exports.sendTextMessage(sender, body.message);
                    } else {
                        module.exports.sendTextMessage(sender, "Action id: " + body.action.id + "\nAction Status: " + body.action.status);
                    }
                })
                module.exports.empty(sender);
            }
        }
        
        //List Snapshot module
        else if (mod == 'lSnapshots') {
            if (stage == 1) {
                dof.listSnapshots(digitoken, function(body) {
                    console.log(body.snapshots.length)
                    for (var i = 0; i < body.snapshots.length; i++) {
                        module.exports.sendTextMessage(sender, "Id: " + body.snapshots[i].id + "\nName: " + body.snapshots[i].name + "\nReigions: " + body.snapshots[i].regions[0] + "\nResource Type: " + body.snapshots[i].resource_type + "\nSize: " + body.snapshots[i].size_gigabytes + "gb")
                    }
                    module.exports.empty(sender)
                })
            }
        }
        //Delete Snapshot module
        else if (mod == 'dSnapshot') {
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter the snapshot Id");
            } else if (stage == 2) {
                dof.deleteSnapshot(digitoken, text, function(body) {
                    // console.log(body)
                    if (body.id) {
                        module.exports.sendTextMessage(sender, "id: " + body.id + "\nMessage: " + body.message)

                    } else {
                        //TODO check if this is working
                        module.exports.sendTextMessage(sender, "Snapshot Deleted Successfully")
                    }
                    module.exports.empty(sender)
                })
            }
        } 

        // List Image
        else if (mod == 'lImage') {
            if (text.toLowerCase() == 'next') {
                console.log("next chal rha")
                sort.info[sender].count = sort.info[sender].count + 10;
            }
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                dof.listAllImage(digitoken, function(body) {
                    console.log(body)
                    for (var i = 0; i < sort.info[sender].count; i++) {
                        module.exports.sendTextMessage(sender, "Id: " + body.images[i].id + "\nName: " + body.images[i].name + "\nDistribution: " + body.images[i].distribution + "\nSlug: " + body.images[i].slug + "\nType: " + body.images[i].type + "\nSize " + body.images[i].size_gigabytes + "gb")
                    }
                })
            } else if (stage == 2) {
                dof.listAllImage(digitoken, function(body) {
                    if (body.images.length < sort.info[sender].count) {
                        sort.info[sender].count = body.images.length
                    }
                    //TODO fix this
                    if (sort.info[sender].count == 86) {
                        module.exports.sendTextMessage(sender, "All images are finished")
                    } else {
                        for (var i = (sort.info[sender].count - 10); i < sort.info[sender].count; i++) {
                            console.log(i)
                            module.exports.sendTextMessage(sender, "Id: " + body.images[i].id + "\nName: " + body.images[i].name + "\nDistribution: " + body.images[i].distribution + "\nSlug: " + body.images[i].slug + "\nType: " + body.images[i].type + "\nSize " + body.images[i].size_gigabytes + "gb")
                        }
                    }
                })
            }
        }

        // List Distribution Images
         else if (mod == 'lDImage') {
            if (text.toLowerCase() == 'next') {
                console.log("next chal rha")
                sort.info[sender].count = sort.info[sender].count + 10;
            }
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                dof.listDistImage(digitoken, function(body) {
                    console.log(body)
                    for (var i = 0; i < sort.info[sender].count; i++) {
                        module.exports.sendTextMessage(sender, "Id: " + body.images[i].id + "\nName: " + body.images[i].name + "\nDistribution: " + body.images[i].distribution + "\nSlug: " + body.images[i].slug + "\nType: " + body.images[i].type + "\nSize " + body.images[i].size_gigabytes + "gb")
                    }
                })
            } else if (stage == 2) {
                dof.listDistImage(digitoken, function(body) {
                    if (body.images.length < sort.info[sender].count) {
                        sort.info[sender].count = body.images.length
                    }
                    //TODO fix this
                    if (sort.info[sender].count == 86) {
                        module.exports.sendTextMessage(sender, "All images are finished")
                    } else {
                        for (var i = (sort.info[sender].count - 10); i < sort.info[sender].count; i++) {
                            console.log(i)
                            module.exports.sendTextMessage(sender, "Id: " + body.images[i].id + "\nName: " + body.images[i].name + "\nDistribution: " + body.images[i].distribution + "\nSlug: " + body.images[i].slug + "\nType: " + body.images[i].type + "\nSize " + body.images[i].size_gigabytes + "gb")
                        }
                    }
                })
            }
        } 

        // List Application Images
        else if (mod == 'lAImage') {
            if (text.toLowerCase() == 'next') {
                console.log("next chal rha")
                sort.info[sender].count = sort.info[sender].count + 10;
            }
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                dof.listAppImage(digitoken, function(body) {
                    console.log(body)
                    for (var i = 0; i < sort.info[sender].count; i++) {
                        module.exports.sendTextMessage(sender, "Id: " + body.images[i].id + "\nName: " + body.images[i].name + "\nDistribution: " + body.images[i].distribution + "\nSlug: " + body.images[i].slug + "\nType: " + body.images[i].type + "\nSize " + body.images[i].size_gigabytes + "gb")
                    }
                })
            } else if (stage == 2) {
                dof.listAppImage(digitoken, function(body) {
                    if (body.images.length < sort.info[sender].count) {
                        sort.info[sender].count = body.images.length
                    }
                    //TODO fix this
                    if (sort.info[sender].count == 86) {
                        module.exports.sendTextMessage(sender, "All images are finished")
                    } else {
                        for (var i = (sort.info[sender].count - 10); i < sort.info[sender].count; i++) {
                            console.log(i)
                            module.exports.sendTextMessage(sender, "Id: " + body.images[i].id + "\nName: " + body.images[i].name + "\nDistribution: " + body.images[i].distribution + "\nSlug: " + body.images[i].slug + "\nType: " + body.images[i].type + "\nSize " + body.images[i].size_gigabytes + "gb")
                        }
                    }
                })
            }
        }

        // List User Images
         else if (mod == 'lUImage') {
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                dof.listUserImage(digitoken, function(body) {
                    console.log(body)
                    if (body.images.length == 0) {
                        module.exports.sendTextMessage(sender, "No user images");
                    } else {
                        for (var i = 0; i < body.images.length; i++) {
                            module.exports.sendTextMessage(sender, "Id: " + body.images[i].id + "\nName: " + body.images[i].name + "\nDistribution: " + body.images[i].distribution + "\nSlug: " + body.images[i].slug + "\nType: " + body.images[i].type + "\nSize " + body.images[i].size_gigabytes + "gb\nRegions: "+JSON.stringify(body.images[i].regions))
                        }
                    }
                })
            }
        } 

        // Delete image
        else if (mod == 'dImage') {
            if (stage == 1) {
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Enter image ID");
            } else if (stage == 2) {
                dof.deleteImage(digitoken, text, function(body) {
                    console.log(body)
                    if (body.id) {
                        module.exports.sendTextMessage(sender, "id: " + body.id + "\nMessage: " + body.message)

                    } else {
                        //TODO check if this is working
                        module.exports.sendTextMessage(sender, "Domain Deleted Successfully")
                    }
                    module.exports.empty(sender);
                })
            }
        } 

        //Action for User image
        else if (mod == 'aImage') {
            if(stage == 1){
                sort.states.UserState[sender].stage++;
                callback("Enter image ID");
            }
            else if (stage == 2) {
                sort.info[sender].imageID = text;
                sort.states.UserState[sender].stage++;
                module.exports.sendTextMessage(sender, "Select an Action for your image.\n1. Transfer an Image\n2. Convert image to a snapshot\n3. Retrieve an existing Image action")
            } else if (stage == 3) {
                sort.states.UserState[sender].stage++;
                if (text == 1) {
                    sort.info[sender].actionType = 'tI'
                    sort.info[sender].actionStage = 1;
                } else if (text == 2) {
                    sort.info[sender].actionType = 'cI';
                    sort.info[sender].actionStage = 1;
                } else if (text == 3) {
                    console.log("3 typed")
                    sort.info[sender].actionType = 'rI';
                    sort.info[sender].actionStage = 1;
                }
                module.exports.sendTextMessage(sender, "Press any key to continue")
            } else if (stage == 4) {
                console.log(sort.info[sender].actionType)

                // Transfer Image
                if (sort.info[sender].actionType == 'tI') {
                    if (sort.info[sender].actionStage == 1) {
                        sort.data[sender] = { type: "transfer" };
                        sort.info[sender].actionStage++;
                        var regions = [];
                        dof.listRegions(digitoken, function(body) {
                            for (var i = 0; i < body.regions.length; i++) {
                                regions.push(body.regions[i].slug);
                            }
                            console.log(regions);
                            callback("Enter region from following regions: \n" + regions);
                        });
                        // module.exports.sendTextMessage(sender, "Enter the region for your transfer");
                    } 
                else if (sort.info[sender].actionStage == 2) {
                        sort.states.UserState[sender].stage++;
                        sort.data[sender].region = text;
                        callback("Press any key to continue or exit to abort\n"+JSON.stringify(sort.data[sender]))
                    }

                }


                // Convert Image to snapshot
                else if(sort.info[sender].actionType == 'cI'){
                    console.log("working")
                    if(sort.info[sender].actionStage == 1){
                        sort.states.UserState[sender].stage++;
                        sort.data[sender] = { type: "convert"};
                        callback("Press any key to continue or exit to abort\n"+JSON.stringify(sort.data[sender]))

                    }
                }


                // Retrieve Image action
                else if(sort.info[sender].actionType == 'rI'){
                    console.log("working")
                    if(sort.info[sender].actionStage == 1){
                        sort.info[sender].actionStage++;
                        callback("Enter action ID")
                    }
                    else if(sort.info[sender].actionStage == 2){
                        sort.info[sender].actionID = text;
                        dof.imageActionR(digitoken, sort.info[sender].imageID, sort.info[sender].actionID, function(body){
                            //TODO messsage to user
                            console.log(body);
                            callback("Action Id: "+body.action.id+"\nStatus: "+body.action.status+"\nType: "+body.action.type+"\nResource Type: "+body.action.resource_type)
                            module.exports.empty(sender)
                        })
                    }
                }

            }
            else if(stage == 5){
                dof.actionImage(digitoken, sort.info[sender].imageID, sort.data[sender], function(body){
                    console.log(body)
                    if(body.message){
                        callback("ID: "+body.id+"\nMessage: "+body.message)
                        module.exports.empty(sender)
                    }
                    else{
                        callback("Action ID: "+body.action.id+"\nStatus: "+body.action.status+"\nStarted At: "+body.action.started_at+"\nResource Type: "+body.action.resource_type)
                        module.exports.empty(sender)
                    }
                })
            }
        }


        //LIST BLOCK STORAGE
        else if(mod == 'lBlock'){
            if(stage == 1){
                dof.listBlockS(digitoken, function(body){
                    console.log(body);
                    for(var i = 0; i<body.volumes.length; i++){
                        callback("ID: "+body.volumes[i].id+"\nName: "+body.volumes[i].name+"\nRegion: "+JSON.stringify(body.volumes[i].region)+"\nDroplet Ids Associated: "+JSON.stringify(body.volumes[i].droplet_ids)+"\nSize: "+body.volumes[i].size_gigabytes+"gb\nCreate At: "+body.volumes[i].created_at)
                    }
                })
            }
        }

        //CREATE BLOCK STORAGE
        else if(mod == 'cBlock'){
            if(stage == 1){
                sort.states.UserState[sender].stage++;
                callback("Enter the size in Gigabytes");
            }
            else if(stage == 2){
                sort.states.UserState[sender].stage++;
                sort.data[sender] = { size_gigabytes: text };
                callback("Enter the name")
            }
            else if(stage == 3){
                sort.states.UserState[sender].stage++;
                sort.data[sender].name = text;
                callback("Enter a description for storage or skip")
            }
            else if(stage == 4){
                sort.states.UserState[sender].stage++;
                if(text.toLowerCase() != 'skip'){
                    sort.data[sender].description = text;
                }
                var regions = [];
                dof.listRegions(digitoken, function(body) {
                    for (var i = 0; i < body.regions.length; i++) {
                        console.log(body.regions[i].slug)
                        regions.push(body.regions[i].slug);
                    }
                    callback("Enter a region:\n"+regions)
                });
                
            }
            else if(stage == 5){
                sort.states.UserState[sender].stage++
                    sort.data[sender].region = text;
                callback("Press any key to continue or exit "+JSON.stringify(sort.data[sender]))
            }
            else if(stage == 6){
                dof.createStorage(digitoken, sort.data[sender], function(body){
                    console.log(body)
                    if(body.id){
                        callback("Id: "+body.id+"\nMessage: "+body.message)
                    }
                    else{
                        callback("Id: "+body.volume.id+"\nRegion name: "+body.volume.region.name+"\nSizes: "+JSON.stringify(body.volume.region.sizes)+"\nFeatures: "+JSON.stringify(body.volume.region.features)+"\nAvailability: "+body.volume.region.available+"\nName: "+body.volume.name+"\n Size: "+body.volume.size_gigabytes+"gb\n Create At: "+body.volume.created_at)
                    }
                    module.exports.empty(sender);
                })
            }
        }


        //Create Snapshot from volume
        else if(mod == 'cBlockSnap'){
            if(stage == 1){
                sort.states.UserState[sender].stage++;
                callback("Enter the id of your storage")
            }
            else if(stage == 2){
                sort.states.UserState[sender].stage++;
                sort.info[sender].vID = text;
                callback("Enter the name of your snapshot")
            }
            else if(stage == 3){
                sort.states.UserState[sender].stage++;
                sort.data[sender] = {name: text};
                callback("press any key to continue\n"+JSON.stringify(sort.data[sender]))
            }
            else if(stage == 4){
                dof.createSnapshotStorage(digitoken, sort.info[sender].vID, sort.data[sender], function(body){
                    console.log(body)
                    if(body.id){
                        callback("Id: "+body.id+"\nMessage: "+body.message)
                    }
                    else{
                        callback("Snaphot is being create.\nID: "+body.snapshot.id+"\nName: "+body.snapshot.name+"\nRegions: "+JSON.stringify(body.snapshot.regions)+"\nCreate At: "+body.snapshot.created_at+"\nResource Type: "+body.snapshot.resource_type)
                    }
                })
            }
        }

        //Delete volume
        else if(mod == 'dBlock'){
            if(stage == 1){
                sort.states.UserState[sender].stage++
                callback("enter the name of volume")
            }
            else if(stage == 2){
                sort.states.UserState[sender].stage++;
                sort.info[sender].name = text;
                callback("enter the region of volume")
            }
            else if(stage == 3){
                sort.states.UserState[sender].stage++
                sort.info[sender].region = text;
                callback("press any key to continue\n")
            }
            else if(stage == 4){
                dof.deleteVolume(digitoken, sort.info[sender].name, sort.info[sender].region, function(body){
                    // console.log(body)
                    //TODO delete error handling
                    if(body.id){
                        callback("Id: "+body.id+"\nMessage: "+body.message)
                    }
                    else{
                        callback("deleted Successfully")
                    }
                })
            }
        }

        //Volume actions
        else if(mod == 'aStorage'){
            if(stage == 1){
                sort.states.UserState[sender].stage++;
                callback("Select a action\n1. Attach a volume to a droplet\n2. Remove a volume from droplet\n 3. Resize a volume\n4. Retrieve action for volume")
            }
            else if(stage == 2){
                sort.states.UserState[sender].stage++;
                if(text == 1){
                    sort.info[sender].actionType = 'aVD';
                    sort.info[sender].actionStage = 1;
                }
                else if(text == 2){
                    sort.info[sender].actionType = 'rVD';
                    sort.info[sender].actionStage = 1;
                }
                else if(text == 3){
                    sort.info[sender].actionType = 'rV';
                    sort.info[sender].actionStage = 1;
                }
                else if(text == 4){
                    sort.info[sender].actionType = 'rVA';
                    sort.info[sender].actionStage = 1;
                }
                callback("Press any key to continue")
            }
            else if(stage == 3){

                // Attach volume to droplet
                if(sort.info[sender].actionType == 'aVD'){
                    if(sort.info[sender].actionStage == 1){
                        sort.info[sender].actionStage++;
                        sort.data[sender] = {type: 'attach'};
                        callback("Enter the name of the volume")
                    }
                    else if(sort.info[sender].actionStage == 2){
                        sort.info[sender].actionStage++;
                        sort.data[sender].volume_name = text;
                        callback("Enter the name of the region")
                    }
                    else if(sort.info[sender].actionStage == 3){
                        sort.info[sender].actionStage++;
                        sort.data[sender].region = text;
                        
                        callback("Enter the droplet ID to attach volume")
                    }
                    else if(sort.info[sender].actionStage == 4){
                        sort.data[sender].droplet_id = text;
                        sort.states.UserState[sender].stage++;
                        callback("Press any key to continue\n"+JSON.stringify(sort.data[sender]))
                    }

                }
                //Remove volume from droplet
                else if(sort.info[sender].actionType == 'rVD'){
                    if(sort.info[sender].actionStage == 1){
                        sort.info[sender].actionStage++;
                        sort.data[sender] = {type: 'detach'};
                        callback("Enter name of volume")
                    }
                    else if(sort.info[sender].actionStage == 2){
                        sort.info[sender].actionStage++;
                        sort.data[sender].volume_name = text;
                        callback("Enter the name of region")
                    }
                    else if(sort.info[sender].actionStage == 3){
                        sort.info[sender].actionStage++;
                        sort.data[sender].region = text;
                        callback("Enter the droplet id to detach from")
                    }
                    else if(sort.info[sender].actionStage == 4){
                        sort.states.UserState[sender].stage++;
                        sort.data[sender].droplet_id = text;
                        callback("Press any key to continue \n"+JSON.stringify(sort.data[sender]))
                    }
                }

                //Resize volume
                else if(sort.info[sender].actionType == 'rV'){
                    if(sort.info[sender].actionStage == 1){
                        sort.info[sender].actionStage++;
                        sort.data[sender] = {type: 'resize'};
                        callback("enter the name of the volume")
                    }
                    else if(sort.info[sender].actionStage == 2){
                        sort.info[sender].actionStage++;
                        sort.data[sender].volume_name = text;
                        callback("Enter the size to resize")
                    }
                    else if(sort.info[sender].actionStage == 3){
                        sort.info[sender].actionStage++;
                        sort.data[sender].size_gigabytes = text;
                        callback("Enter the region")
                    }
                    else if(sort.info[sender].actionStage == 4){
                        sort.states.UserState[sender].stage++;
                        sort.data[sender].region = text;
                        callback("Press any key to continue\n"+JSON.stringify(sort.data[sender]))
                    }
                }
            }
            else if(stage == 4){
                dof.volumeAction(digitoken, sort.data[sender], function(body){
                    console.log(body)
                    if(body.id){
                        callback("ID: "+body.id+"\nMessage: "+body.message);
                    }
                    else{
                        callback("Action Id: "+body.action.id+"\nStatus: "+body.action.status+"\nType Of Action: "+body.action.type+"\nStarted At: "+body.action.started_at);
                    }
                })
            }

        }

    },




    listDrop: function(digitoken, callback) {
        dof.listDroplets(digitoken, function(body){
            for(var i = 0; i<body.droplets.length; i++){
                callback("Droplet ID: "+body.droplets[i].id+"\nDroplet Name: "+body.droplets[i].name+"\nDroplet Memory: "+body.droplets[i].memory+" mb\nDisk: "+body.droplets[i].disk+" gb\n");
            }
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
        database.User.findOne({ id: sender }, function(err, user) {
            if (err) throw err;
            user.token = text;
            user.save(function(err) {
                if (err) throw err;
                module.exports.sendTextMessage(sender, "Token saved");
            })
        })



    },





    //TODO need to fix the promise for new User
    findToken: function(sender) {
        return new Promise(function(resolve, reject) {
            database.Users.findOne({ id: sender }, function(err, user) {

                if (user != undefined) {
                    console.log("promise");
                    resolve(user.token);
                } else {
                    var newUser = new database.User({
                        id: sender
                    });
                    newUser.save(function(err) {
                        if (err) throw err;

                        // mmodule.exports.sendTextMessage(sender, "New User");
                    })
                    resolve("nothing");
                }

            });
        });

    }

};
