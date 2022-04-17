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
                    author: post.author,
                    views: post.views,
                }
            });
            Posts.find({}).sort({'views': -1}).limit(4).exec((err, postsTop) => {
                postsTop = postsTop.map(post => {
                    return {
                        title: post.title,
                        image: post.image,
                        category: post.category.toUpperCase(),
                        description: post.content.substring(0, 100),
                        content: post.content,
                        slug: post.slug,
                        created: post.created,
                        description: post.description,
                        author: post.author,
                        views: post.views,
                    }
                });
                res.render('index', {
                    posts,
                    postsTop,
                });
            });
        });
    } else {
        Posts.find({title: {$regex: req.query.search, $options: 'i'}}).exec((err, posts) => {
            res.render('search', {posts, counter: posts.length});
        });
    }
});

route.get('/:slug', (req, res) => {
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc: {views: 1}}, {new: true}, (err, post) => {
        if(post != null) {
            Posts.find({}).sort({'views': -1}).limit(4).exec((err, postsTop) => {
                postsTop = postsTop.map(post => {
                    return {
                        title: post.title,
                        image: post.image,
                        category: post.category.toUpperCase(),
                        description: post.content.substring(0, 100),
                        content: post.content,
                        slug: post.slug,
                        created: post.created,
                        description: post.description,
                        author: post.author,
                        views: post.views,
                    }
                });
            res.render('single', {post, postsTop});
            });
        } else {
            res.redirect('/');
        }
    });
});

module.exports = route;