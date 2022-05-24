const mongoose = require('./init.js');
const { Schema } = mongoose;

const adminSchema = new Schema({
    email: String,
    password: String,
    permissions: {
        write: Boolean,
        review: Boolean,
    },
    last_login: String,
    name: String,
}, {collection: 'admin'});

module.exports = mongoose.model('Admin', adminSchema);