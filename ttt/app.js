const express = require('express');
const bodyParser = require('body-parser');
const ttt = require('./ttt');
const mongoose = require('mongoose');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");

var dbURL = 'mongodb://localhost:27017/ttt';
mongoose.connect(dbURL, { useNewUrlParser: true });

var Schema = mongoose.Schema;
var userSchema = new Schema({
    username: String,
    hash: String,
    email: String,
    key: String,
    verified: Boolean
});

var User = mongoose.model('Users', userSchema);

const app = express();
const port = 80;

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var sendmail = require('sendmail')();

sendmail({
  from: 'ubuntu@cse356.compas.cs.stonybrook.edu',
  to: 'hee2gs+b71ibvc0sh2x0@sharklasers.com',
  subject: 'Tic Tac Toe Account Verification',
  html: 'Dear User, you must verify your TTT account with the following key'
}, function (err, reply) {
  console.log(err && err.stack)
  console.dir(reply)
})

app.get('/ttt', function (req, res) {
    res.render('pages/index');
});

app.get('/css/styles.css', function (req, res) {
    res.sendFile('css/styles.css', {
        root: __dirname
    });
});

app.get('/controllers/form_controller.js', function (req, res) {
    res.sendFile('/controllers/form_controller.js', {
        root: __dirname
    });
});

app.get('/controllers/board_controller.js', function (req, res) {
    res.sendFile('/controllers/board_controller.js', {
        root: __dirname
    });
});

app.get('/node_modules/jquery/dist/jquery.min.js', function (req, res) {
    res.sendFile('node_modules/jquery/dist/jquery.min.js', {
      root: __dirname
    });
});

app.post('/adduser', function (req, res) {
    if (!req.body) return res.sendStatus(400);

    // Check if username is already used
    User.find({username: req.body.username})
        .then(function(user){
            console.log(user)
        })
        .catch();

    // Check if email is already used
    User.find({email: req.body.email})
        .then(function(user){
            console.log(user)
        })
        .catch();

    var key = crypto.randomBytes(32).toString('hex');
    var hash = CryptoJS.AES.encrypt(req.body.password, key).toString();
    
    var user = {
        username: req.body.username,
        hash: hash,
        email: req.body.email,
        key: key,
        verified: false        
    }
    console.log(user);
    var data = new User(user);
    data.save();
});

app.post('/verify', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var email = req.body.email;
    var key = req.body.key;

    User.find({email: email})
        .then(function(user){
            if (key == user[0].key) {
                user[0].verified = true;
                user[0].save();
                console.log(email + " has been successfully verified")
            }
            else 
                console.log('Failed to Validate');
        })
        .catch(err => console.log('Unable to find email'));
});

app.post('/ttt', function (req, res) {
    var body = req.body;

    if (body.hasOwnProperty('key')) {
        var email = req.body.email;
        var key = req.body.key;
        User.find({email: email})
        .then(function(user){
            if (key == user[0].key) {
                res.render('pages/index');
            }
        })
        .catch();
    }
    else if (body.hasOwnProperty('email')) {
        res.render('pages/verify');
    }
});

app.post('/ttt/play', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var winner = ttt.bestAIMove(req.body.grid);
    var json = {"grid": req.body.grid, "winner": winner};
    console.log(JSON.stringify(json));
    res.send(JSON.stringify(json));
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

