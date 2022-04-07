const express = require('express');

const route = express.Router();

const Posts = require('./db/Posts');

route.get('/', (req, res) => {
    if(req.query.search == null) {
        Posts.find({}).sort({'_id': -1}).exec((err, posts) => {
            posts = posts.map(post => {
                return {
                    title: post.title,
                    image: post.image,
                    category: post.category.toUpperCase(),
                    description: post.content.substring(0, 100),
                    content: post.content,
                    slug: post.slug,
                    created: post.created,
                    description: post.description,
                    author: post.author
                }
            });
            res.render('index', {posts: posts});
        });
    } else {
        res.render('search', {});
    }
});

route.get('/:slug', (req, res) => {
    res.render('single.ejs', {});
});

module.exports = route;