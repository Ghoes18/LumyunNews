const express = require('express');
const session = require('express-session');
const crypto = require('crypto');

const route = express.Router();

const Posts = require('./db/Posts');
const Admin = require('./db/Admin');
const ResetPassword = require('./db/ResetPassword');

const emailSender = require('./nodemailer');

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
    if (req.session.login == true) {
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
    if (req.session.login == true) {
        res.redirect('/admin/login');
        return;
    }
    res.render('admin-forget-password');
});

route.post('/admin/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await Admin.findOne({
        email
    });
    if (user != null) {
        // generate the hash with 20 characters
        const hash = crypto.randomBytes(20).toString('hex');
        // verify if in database exists a hash equal to the hash generated
        let verifyHash = await ResetPassword.findOne({
            token: hash
        });
        while (verifyHash != null) {
            const hash = crypto.randomBytes(20).toString('hex');
            verifyHash = await ResetPassword.findOne({
                hash
            });
        }
        const resetPassword = new ResetPassword({
            email: user.email,
            token: hash,
            name: user.name
        });
        await resetPassword.save();
        // send email
        emailSender.sendEmailToAdmin(user.email, user.name, hash);
        res.redirect('/admin/login');
    } else {
        res.redirect('forgot-password?error=true');
    }
});

route.get('/admin/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    // search in the database if exists a hash equal to the token
    const user = await ResetPassword.findOne({
        token
    });
    if (user != null) {
        // render the reset password page with the necessary data
        res.render('admin-reset-password', {
            user: user.name,
            email: user.email,
        });
    } else {
        res.redirect('/admin/login');
    }
});

route.post('/admin/reset-password/:token', async (req, res) => {
    if (req.body.submit == 'accpet') {
        const { token } = req.params;
        const user = await ResetPassword.findOne({
            token
        });
        if (user != null) {
            // generate a random password with length of 8
            const password = crypto.randomBytes(8).toString('hex');
            // update the password
            await Admin.findOneAndUpdate({
                email: user.email
            }, {
                password
            });
            // send the email to the user
            emailSender.sendEmailToUser(user.email, user.name, password, true);
            // delete the token from the database
            await ResetPassword.findOneAndRemove({
                token
            });
            res.redirect('/admin/login');
        }
    } else if (req.body.submit == 'cancel') {
        const { token } = req.params;
        const user = await ResetPassword.findOne({
            token
        });
        if (user != null) {
            // send a email
            emailSender.sendEmailToUser(user.email, user.name, null, false);
            res.redirect('/admin/login');
            // delete the token from the database
            await ResetPassword.findOneAndDelete({
                token
            });
        }
    }
});

route.get('/admin/profile', (req, res) => {
    res.render('admin-profile');
});

module.exports = route;