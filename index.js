const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');

const app = express();

app.use(bodyParser.json());  // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));  // support URL-encoded bodies

app.engine('html', require('ejs').renderFile); // html engine
app.set('view engine', 'ejs'); // set html engine
app.use('/public', express.static(path.join(__dirname, 'public'))); // set where static files are located
app.set('views', path.join(__dirname, '/pages')); // set where views are located
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico'))); // set favicon


// Routes
app.get('/', (req, res) => {
    if(req.query.search == null) {
        res.render('index', {});
    } else {
        res.send('You searched for: ' + req.query.search);
    }
});

app.get('/:slug', (req, res) => {
    res.send(req.params.slug); // localhost:5000/a-notice => a-notice
});

app.listen(3000, () => {
    console.log('http://localhost:3000');
});