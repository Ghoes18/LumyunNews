const mongoose = require('./init.js');
const { Schema } = mongoose;

const postSchema = new Schema({
    name: String,
}, {collection: 'categories'});

module.exports = mongoose.model('Categories', postSchema);