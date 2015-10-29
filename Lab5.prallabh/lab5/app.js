var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    Survey = require('./controllers/Survey'),
    app = express(),
    mongoose = require('mongoose'),
    format = require('util').format;

var path = require('path');

// express middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


// enable cross origin resource sharing
// for our REST API
// http://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS, HEAD');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// Mongoose connection best practices
// https://gist.github.com/suissa/1058f338ee628d7c60e2
var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : 27017;

// Create the database connection
mongoose.connect(format("mongodb://%s:%s/rbparekh_prallabh_lab5", host, port));
 
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose connected');
});
 
// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});
 
// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});
 
// When the connection is open
mongoose.connection.on('open', function () {
  console.log('Mongoose default connection is open');
});
 
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});


// routes
app.get('/',function (req, res) {
   Survey.getEndpoints(req, res);
});

app.get('/question/:id?', function (req, res) {
    Survey.getQuestion(req, res);
});

app.post('/question', function (req, res){
  Survey.postQuestion(req, res);
});

app.delete('/question/:id', function (req, res){
  Survey.deleteQuestion(req, res);
});

app.head('/user/:username', function (req, res){
  Survey.headUser(req, res);
});

app.post('/user/:username', function (req, res){
  Survey.postUser(req, res);
});

app.put('/answer', function (req, res){
  Survey.putAnswer(req, res);
});

app.get('/matches/:username', function (req, res) {
    Survey.getMatches(req, res);
});

app.listen(8008);