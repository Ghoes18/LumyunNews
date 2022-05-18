const mongoose = require('./init.js');
const { Schema } = mongoose;

const adminSchema = new Schema({
    email: String,
    password: String,
    categorys: [{
        type: Array,
        default: []
    }],
    last_login: String,
    name: String,
}, {collection: 'admin'});

module.exports = mongoose.model('Admin', adminSchema);