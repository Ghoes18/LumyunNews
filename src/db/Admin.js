const mongoose = require('./init.js');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    email: String,
    password: String,
    category: String,
    last_login: String,
    name: String,
}, {collection: 'admin'});

const Admin = mongoose.model('Admin', postSchema);

module.exports = Admin;