const express = require('express');
const session = require('express-session');

const route = express.Router();

const Posts = require('./db/Posts');
const Admin = require('./db/Admin');

route.use(session({
    secret: 'safasfcgxgbcvdf124!',
    cookie: {
        maxAge: 1000 * 60 * 60 * 4 // 4 hours
    }
}));


route.get('/', (req, res) => {
    if (req.query.search == null) {
        Posts.find({}).sort({
            '_id': -1
        }).exec((err, posts) => {
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
            Posts.find({}).sort({
                'views': -1
            }).limit(4).exec((err, postsTop) => {
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
        Posts.find({
            title: {
                $regex: req.query.search,
                $options: 'i'
            }
        }).exec((err, posts) => {
            res.render('search', {
                posts,
                counter: posts.length
            });
        });
    }
});

route.get('/:slug', (req, res) => {
    Posts.findOneAndUpdate({
        slug: req.params.slug
    }, {
        $inc: {
            views: 1
        }
    }, {
        new: true
    }, (err, post) => {
        if (post != null) {
            Posts.find({}).sort({
                'views': -1
            }).limit(4).exec((err, postsTop) => {
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
                res.render('single', {
                    post,
                    postsTop
                });
            });
        } else {
            res.redirect('/');
        }
    });
});

route.get('/admin/login', (req, res) => {
    if(req.session.login == true) {
        res.render('admin-panel');
    } else {
        res.render('admin-login');
    }
});

route.post('/admin/login', async (req, res) => {
    const login = await Admin.findOne({
        email: req.body.email,
        password: req.body.password
    });
    if (login != null) {
        req.session.login = true;
        res.redirect('/admin/login');
    } else {
        req.session.login = false;
        res.redirect('/admin/login?error=true');
    }
});

route.get('/admin/logout', (req, res) => {
    req.session.login = false;
    res.redirect('/admin/login');
});

route.get('/admin/forgot-password', (req, res) => {
    
});

route.get('/admin/profile', (req, res) => {
    res.render('admin-profile');
});

module.exports = route;