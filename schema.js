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

var User = mongoose.model('User', userSchema);
var Droplets = mongoose.model('Droplets', dropletSchema);

module.exports = {
	User: User,
	Droplets: Droplets
};