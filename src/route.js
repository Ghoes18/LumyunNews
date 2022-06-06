const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const moment = require("moment");
const slugify = require("slugify");

const route = express.Router();
moment.locale("pt-pt");

const Posts = require("./db/Posts");
const Admin = require("./db/Admin");
const ResetPassword = require("./db/ResetPassword");
const Categories = require("./db/Categories");
const PostsToReview = require("./db/PostsToReview");

const emailSender = require("./nodemailer");

route.use(
    session({
        secret: "safasfcgxgbcvdf124!",
        cookie: {
            maxAge: 1000 * 60 * 60 * 4, // 4 hours
        },
    })
);

route.get("/", (req, res) => {
    if (req.query.search == null) {
        Posts.find({})
            .sort({
                _id: -1,
            })
            .exec((err, posts) => {
                posts = posts.map((post) => {
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
                    };
                });
                Posts.find({})
                    .sort({
                        views: -1,
                    })
                    .limit(4)
                    .exec((err, postsTop) => {
                        postsTop = postsTop.map((post) => {
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
                            };
                        });
                        res.render("index", {
                            posts,
                            postsTop,
                        });
                    });
            });
    } else {
        Posts.find({
            title: {
                $regex: req.query.search,
                $options: "i",
            },
        }).exec((err, posts) => {
            res.render("search", {
                posts,
                counter: posts.length,
            });
        });
    }
});

route.get("/:slug", (req, res) => {
    Posts.findOneAndUpdate({
            slug: req.params.slug,
        }, {
            $inc: {
                views: 1,
            },
        }, {
            new: true,
        },
        (err, post) => {
            if (post != null) {
                Posts.find({})
                    .sort({
                        views: -1,
                    })
                    .limit(4)
                    .exec((err, postsTop) => {
                        postsTop = postsTop.map((post) => {
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
                            };
                        });
                        res.render("single", {
                            post,
                            postsTop,
                        });
                    });
            } else {
                res.redirect("/");
            }
        }
    );
});

route.get("/admin/login", (req, res) => {
    if (req.session.login) {
        res.render("admin-panel", {
            moment,
            login: req.session.login,
        });
    } else {
        res.render("admin-login");
    }
});

route.post("/admin/login", async (req, res) => {
    const login = await Admin.findOne({
        email: req.body.email,
        password: req.body.password,
    });
    if (login != null) {
        req.session.login = login.name;
        // register last login
        Admin.findOneAndUpdate({
            email: req.body.email,
        }, {
            last_login: moment().format("LLLL"),
        });
        res.redirect("/admin/login");
    } else {
        req.session.login = false;
        res.redirect("/admin/login?error=true");
    }
});

route.get("/admin/logout", (req, res) => {
    req.session.login = false;
    res.redirect("/admin/login");
});

route.get("/admin/forgot-password", (req, res) => {
    if (req.session.login) {
        res.redirect("/admin/login");
        return;
    }
    res.render("admin-forget-password");
});

route.post("/admin/forgot-password", async (req, res) => {
    const {
        email
    } = req.body;
    const user = await Admin.findOne({
        email,
    });
    if (user != null) {
        // generate the hash with 20 characters
        const hash = crypto.randomBytes(20).toString("hex");
        // verify if in database exists a hash equal to the hash generated
        let verifyHash = await ResetPassword.findOne({
            token: hash,
        });
        while (verifyHash != null) {
            const hash = crypto.randomBytes(20).toString("hex");
            verifyHash = await ResetPassword.findOne({
                hash,
            });
        }
        const resetPassword = new ResetPassword({
            email: user.email,
            token: hash,
            name: user.name,
        });
        await resetPassword.save();
        // send email
        emailSender.sendEmailToAdmin(user.email, user.name, hash);
        res.redirect("/admin/login");
    } else {
        res.redirect("forgot-password?error=true");
    }
});

route.get("/admin/reset-password/:token", async (req, res) => {
    const {
        token
    } = req.params;
    // search in the database if exists a hash equal to the token
    const user = await ResetPassword.findOne({
        token,
    });
    if (user != null) {
        // render the reset password page with the necessary data
        res.render("admin-reset-password", {
            user: user.name,
            email: user.email,
        });
    } else {
        res.redirect("/admin/login");
    }
});

route.post("/admin/reset-password/:token", async (req, res) => {
    if (req.body.submit == "accpet") {
        const {
            token
        } = req.params;
        const user = await ResetPassword.findOne({
            token,
        });
        if (user != null) {
            // generate a random password with length of 8
            const password = crypto.randomBytes(8).toString("hex");
            // update the password
            await Admin.findOneAndUpdate({
                email: user.email,
            }, {
                password,
            });
            // send the email to the user
            emailSender.sendEmailToUser(user.email, user.name, password, true);
            // delete the token from the database
            await ResetPassword.findOneAndRemove({
                token,
            });
            res.redirect("/admin/login");
        }
    } else if (req.body.submit == "cancel") {
        const {
            token
        } = req.params;
        const user = await ResetPassword.findOne({
            token,
        });
        if (user != null) {
            // send a email
            emailSender.sendEmailToUser(user.email, user.name, null, false);
            res.redirect("/admin/login");
            // delete the token from the database
            await ResetPassword.findOneAndDelete({
                token,
            });
        }
    }
});

route.get("/admin/make-post", async (req, res) => {
    const userPermission = await Admin.findOne({
        name: req.session.login,
    });
    if (req.session.login && userPermission.permissions.write == true) {
        const posts = await PostsToReview.find({
            author: req.session.login,
        }).then((posts) => {
            // only posts that needs to be changed
            return posts.filter((post) => {
                return post.toChange.needToChange == true;
            });
        });
        res.render("admin-post", {
            login: req.session.login,
            posts,
        });
    } else {
        res.redirect("/admin/login");
    }
});

route.get("/admin/make-post/new", async (req, res) => {
    const userPermission = await Admin.findOne({
        name: req.session.login,
    });
    if (req.session.login && userPermission.permissions.write == true) {
        const categories = await Categories.find({});
        res.render("admin-make-post", {
            login: req.session.login,
            categories,
        });
    } else {
        res.redirect("/admin/login");
    }
});

route.get("/admin/make-post/reviews/:slug", async (req, res) => {
    const userPermission = await Admin.findOne({
        name: req.session.login,
    });
    if (req.session.login && userPermission.permissions.write == true) {
        const categories = await Categories.find({});
        const post = await PostsToReview.findOne({
            slug: `reviews/${req.params.slug}`,
        });
        let p = post.content.match(/<p>.*<\/p><h2>/g);
        let h2 = post.content.match(/<h2>.*<\/h2>/g);
        let secondP = post.content.match(/<\/h2><p>.*<\/p>/g);
        // remove the html tags from the strings
        p = p.toString().replace(/(<([^>]+)>)/gi, "");
        h2 = h2.toString().replace(/(<([^>]+)>)/gi, "");
        secondP = secondP.toString().replace(/(<([^>]+)>)/gi, "");
        res.render("admin-edit-post", {
            login: req.session.login,
            categories,
            post,
            h2,
            p,
            secondP,
        });
    } else {
        res.redirect("/admin/login");
    }
});

route.post("/admin/create-post", async (req, res) => {
    const userPermission = await Admin.findOne({
        name: req.session.login,
    });
    if (req.session.login && userPermission.permissions.write == true) {
        const {
            title,
            description,
            image,
            category,
            content,
            subtitle,
            subcontent,
        } = req.body;

        const slug = slugify(title, {
            replacement: "_",
            remove: /[*+~.()'"!:@]/g,
            lower: true,
        });
        const finalSlug = `reviews/${slug}`;

        const finalContent = `<p>${content}</p><h2>${subtitle}</h2><p>${subcontent}</p>`;

        PostsToReview.create({
            title,
            description,
            image,
            category,
            content: finalContent,
            slug: finalSlug,
            author: req.session.login,
        });

        res.redirect("/admin/make-post");
    } else {
        res.redirect("/admin/login");
    }
});

route.post("/admin/make-post/reviews/:slug", async (req, res) => {
    const userPermission = await Admin.findOne({
        name: req.session.login,
    });
    if (req.session.login && userPermission.permissions.write == true) {
        //verify if the user wants to update the post or delete it
        if (req.body.submit == "update") {
            const {
                title,
                description,
                image,
                category,
                content,
                subtitle,
                subcontent,
            } = req.body;
            //verify if post already exists
            const post = await PostsToReview.findOne({
                slug: `reviews/${req.params.slug}`,
            });
            if (post != null) {
                //update the post
                const slug = slugify(title, {
                    replacement: "_",
                    remove: /[*+~.()'"!:@]/g,
                    lower: true,
                }); 
                const finalSlug = `reviews/${slug}`;
                const finalContent = `<p>${content}</p><h2>${subtitle}</h2><p>${subcontent}</p>`;
                await PostsToReview.findOneAndUpdate({
                    slug: `reviews/${req.params.slug}`,
                }, {
                    title,
                    description,
                    image,
                    category,
                    content: finalContent,
                    slug: finalSlug,
                    toChange: {
                        needToChange: false,
                        reason: "",
                    },
                });
            }
            res.redirect("/admin/make-post");
        } else if (req.body.submit == "delete") {
            //delete the post
            await PostsToReview.findOneAndDelete({  
                slug: `reviews/${req.params.slug}`,
            });
            res.redirect("/admin/make-post");
        }
    } else {
        res.redirect("/admin/login");
    }
});

route.get("/admin/reviews", async (req, res) => {
    const userPermission = await Admin.findOne({
        name: req.session.login,
    });
    if (req.session.login && userPermission.permissions.review == true) {
        const posts = await PostsToReview.find({
            toChange: {
                needToChange: false,
                reason: "",
            },
        }).then((posts) => {
            return posts.map((post) => {
                return {
                    title: post.title,
                    description: post.description,
                    image: post.image,
                    category: post.category,
                    content: post.content,
                    slug: post.slug,
                    author: post.author,
                };
            });
        });
        res.render("admin-review", {
            login: req.session.login,
            posts,
        });
    } else {
        res.redirect("/admin/login");
    }
});

route.get("/admin/reviews/:slug", async (req, res) => {
    const userPermission = await Admin.findOne({
        name: req.session.login,
    });
    if (req.session.login && userPermission.permissions.review == true) {
        const {
            slug
        } = req.params;
        const searchSlug = `reviews/${slug}`;
        const post = await PostsToReview.findOne({
            slug: searchSlug,
        });
        res.render("admin-single", {
            login: req.session.login,
            post,
        });
    } else {
        res.redirect("/admin/login");
    }
});

route.post("/admin/reviews/:slug", async (req, res) => {
    const userPermission = await Admin.findOne({
        name: req.session.login,
    });
    if (req.session.login && userPermission.permissions.review == true) {
        if (req.body.decision == "Publicar") {
            // put the 'post to review' in 'posts', and delete it from the 'posts to review'
            const {
                slug
            } = req.params;
            const searchSlug = `reviews/${slug}`;
            const post = await PostsToReview.findOne({
                slug: searchSlug,
            });
            Posts.create({
                title: post.title,
                description: post.description,
                image: post.image,
                category: post.category,
                content: post.content,
                slug: post.slug,
                author: post.author,
            });
            await PostsToReview.findOneAndDelete({
                slug: searchSlug,
            });
            res.redirect("/admin/reviews");
        } else if (req.body.decision == "Remover") {
            // delete the post from the review
            const {
                slug
            } = req.params;
            const searchSlug = `reviews/${slug}`;
            await PostsToReview.findOneAndDelete({
                slug: searchSlug,
            });
            res.redirect("/admin/reviews");
        } else if (req.body.decision == "Enviar") {
            // send a email to the author with the link to the post to update it
            const {
                slug
            } = req.params;
            const searchSlug = `reviews/${slug}`;
            const post = await PostsToReview.findOneAndUpdate({
                slug: searchSlug,
            }, {
                // change 'reviews/' from slug to 'make-post/'
                toChange: {
                    needToChange: true,
                    reason: req.body.emailContent,
                },
            });
            // search the email of the author
            const author = await Admin.findOne({
                name: post.author,
            });
            // search the email of the user (reviewer)
            const reviewer = await Admin.findOne({
                name: req.session.login,
            });
            const finalSlug = `http://localhost:3000/admin/make-post/${req.params.slug}`;
            emailSender.sendEmailToAuthor(
                author.email,
                reviewer.email,
                req.session.login,
                post.title,
                req.body.emailContent,
                finalSlug
            );
            res.redirect("/admin/reviews");
        }
    } else {
        res.redirect("/admin/login");
    }
});

route.get("/admin/profile", (req, res) => {
    res.render("admin-profile");
});

module.exports = route;