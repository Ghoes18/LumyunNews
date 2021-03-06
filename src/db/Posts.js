const mongoose = require('./init.js');
const { Schema } = mongoose;

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
    views: {
        type: Number,
        default: 0
    },
}, {collection: 'posts'});

module.exports = mongoose.model('Post', postSchema);