const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');

const route = require('./route');

const app = express();

app.use(bodyParser.json());  // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));  // support URL-encoded bodies

app.engine('html', require('ejs').renderFile); // html engine
app.set('view engine', 'ejs'); // set ejs engine
app.use('/public', express.static(path.join(__dirname, '../public'))); // set where static files are located
app.set('views', path.join(__dirname, 'pages')); // set where views are located
app.use(favicon(path.join(__dirname, '../public/images', 'favicon.ico'))); // set favicon
app.use(route); // set route


app.listen(3000, () => {
    console.log('http://localhost:3000');
});