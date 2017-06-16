var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/bot');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	token: {type: String, required: true, unique: true},
	id: {type: String}
})
var dropletSchema = new Schema({
	dropletId: {type: String, required: true, unique: true},
	dropletName: {type: String, required: true},
	memory: {type: String, required: true},
	disk: {type:String, required: true},
	region:{type:String, required: true},
	id: {type: String, required: true}
})


var domainSchema = new Schema({
	id: {type: String, required: true},
	domainName: {type: String, required: true, unique: true},
	ttl: {type: Number, required: true}
})

var domainRecordSchema = new Schema({
	id: {type: String, required: true},
	domainRecordId: {type: String, required: true, unique: true},
	typeR: {type: String, required: true},
	name: {type: String, required: true}
})

var User = mongoose.model('User', userSchema);
var Droplets = mongoose.model('Droplets', dropletSchema);
var Domains = mongoose.model('Domains', domainSchema);
var domainRecords = mongoose.model('domainRecords', domainRecordSchema);
module.exports = {
	User: User,
	Droplets: Droplets,
	Domains: Domains,
	domainRecords: domainRecords
};