const express = require('express');

const route = express.Router();

route.get('/', (req, res) => {
    if(req.query.search == null) {
        res.render('index', {});
    } else {
        res.render('search', {});
    }
});

route.get('/:slug', (req, res) => {
    //res.send(req.params.slug); // localhost:5000/a-notice => a-notice
    res.render('single.ejs', {});
});

module.exports = route;