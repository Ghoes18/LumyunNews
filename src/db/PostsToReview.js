const mongoose = require('./init.js');
const { Schema } = mongoose;

const postsToReviewSchema = new Schema({
    title: String,
    image: String,
    category: String,
    content: String,
    description: String,
    slug: String,
    author: String,
}, {collection: 'posts-to-review'});

module.exports = mongoose.model('PostsToReview', postsToReviewSchema);