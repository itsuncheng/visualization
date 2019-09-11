var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser= require('body-parser')
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.engine('js', require('ejs').renderFile)

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
