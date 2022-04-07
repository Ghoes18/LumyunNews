const mongoose = require('./init.js');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: String,
    image: String,
    category: String,
    content: String,
    slug: String,
    created: {
        type: Date,
        default: Date.now
    },
    description: String,
    author: String,
}, {collection: 'posts'});

const Posts = mongoose.model('Posts', postSchema);

module.exports = Posts;

