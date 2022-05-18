const mongoose = require('./init.js');
const { Schema } = mongoose;

const resetSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, {collection: 'reset-password'});

module.exports = mongoose.model('ResetPassword', resetSchema);