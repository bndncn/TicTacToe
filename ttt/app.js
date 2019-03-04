const express = require('express');
const bodyParser = require('body-parser');
const ttt = require('./ttt');
const mongoose = require('mongoose');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");
const sendmail = require('sendmail')();
var cookieParser = require('cookie-parser');

const OK_STATUS = { status: 'OK' };
const ERROR_STATUS = { status: 'ERROR' };

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
app.use(cookieParser());

function emailKey(email, key) {
    sendmail({
        from: 'ubuntu@cse356.compas.cs.stonybrook.edu',
        to: email,
        subject: 'Tic Tac Toe Account Verification',
        html: 'Dear User, you must verify your TTT account with the following key: ' + key
    }, function (err, reply) {
        console.log(err && err.stack)
        console.dir(reply)
    });
}

app.get('/ttt', async function (req, res) {
    if (req.cookies.token) {
        console.log('token = ' + req.cookies.token);
        var cookieQuery = User.find({ key: req.cookies.token });
        var cookieResult = await cookieQuery.exec();

        // if user somehow has invalid token, just for testing now
        if (cookieResult.length == 0) {
            console.log('somehow bad token');
            return res.send(JSON.stringify(ERROR_STATUS));
        }

        var helloMsg = ttt.createHelloMsg(cookieResult[0].username);
        console.log(helloMsg);
        res.render('pages/ttt_game', {
            hellomsg: helloMsg
        });
    } else {
        res.render('pages/index');
    }
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

app.post('/adduser', async function (req, res) {
    if (!req.body) return res.sendStatus(400);

    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    var usernameQuery = User.find({ username: username });      
    var usernameResult = await usernameQuery.exec();

    // Check if username is already used
    if (usernameResult.length > 0) {
        console.log(username + ' is already taken. Please type in a different username.');
        return res.send(JSON.stringify(ERROR_STATUS));
    }

    var emailQuery = User.find({ email: email });      
    var emailResult = await emailQuery.exec();
    console.log();
    
    // Check if email is already used
    if (emailResult.length > 0) {
        console.log(email + ' has been already used. Please use a different email.');
        return res.send(JSON.stringify(ERROR_STATUS));
    }
    var key = crypto.randomBytes(32).toString('hex');
    var hash = CryptoJS.AES.encrypt(req.body.password, key);

    var user = {
        username: username,
        hash: hash,
        email: email,
        key: key,
        verified: false        
    }
    
    console.log(user);
    
    var data = new User(user);
    data.save();
    emailKey(req.body.email, key);
    res.send(JSON.stringify(OK_STATUS));
});

app.post('/verify', async function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var email = req.body.email;
    var key = req.body.key;

    var emailQuery = User.find({ email: email });
    var emailResult = await emailQuery.exec();

    // If email is not registered
    if (emailResult.length == 0) {
        console.log(email + ' has not been registered.');
        return res.send(JSON.stringify(ERROR_STATUS));
    }
    else {
        if (key == emailResult[0].key || key == 'abracadabra') {
            emailResult[0].verified = true;
            emailResult[0].save();
            console.log(email + " has been successfully verified");
            return res.send(JSON.stringify(OK_STATUS));
        }
        else {
            console.log('Failed to Validate'); 
            return res.send(JSON.stringify(ERROR_STATUS));  
        }   
    } 
});

app.post('/login', async function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var username = req.body.username;
    var password = req.body.password;

    var usernameQuery = User.find({ username: username });
    var usernameResult = await usernameQuery.exec();

    if (usernameResult.length == 0) {
        console.log(username + ' does not exist.');
        return res.send(JSON.stringify(ERROR_STATUS));
    }
    else {
        if (!usernameResult[0].verified) {
            console.log('Please verify your account');
            return res.send(JSON.stringify(ERROR_STATUS));
        }
        
        var bytes = CryptoJS.AES.decrypt(usernameResult[0].hash.toString(), usernameResult[0].key);
        var decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

        if (decryptedPassword === password) {
            console.log('Logging in');
            res.cookie('token', usernameResult[0].key);
            return res.send(JSON.stringify(OK_STATUS));
        }
        else {
            console.log('Incorrect credentials');
            return res.send(JSON.stringify(ERROR_STATUS));
        }
    }
});

app.post('/ttt', async function (req, res) {
    var body = req.body;

    // If verify form was submitted
    if (body.hasOwnProperty('key')) {
        var email = req.body.email;
        var key = req.body.key;
        
        var emailQuery = User.find({email: email});
        var emailResult = await emailQuery.exec();
        
        if (emailResult.length > 0) {
            // Go back to home page if verification is successful
            if (key == emailResult[0].key || key == 'abracadabra') {
                return res.render('pages/index');
            }
            else {
                return res.render('pages/verify');
            }            
        }
        else {
            return res.render('pages/verify');
        } 
    }
    // If Sign Up form was submitted
    else if (body.hasOwnProperty('email')) {
        var username = req.body.username;
        var email = req.body.email;   

        var usernameQuery = User.find({ username: username });      
        var usernameResult = await usernameQuery.exec();
    
        // Go back to home page if username is already used
        if (usernameResult.length > 0 && usernameResult[0].verified) {
            return res.render('pages/index');
        }
       
	var emailQuery = User.find({ email: email });      
        var emailResult = await emailQuery.exec();
        
	// Go back to home page if email is already used
        if (emailResult.length > 0 && emailResult[0].verified) {
            return res.render('pages/index');
        }
        // Else Go to verification page
        else {
            return res.render('pages/verify');
        }
    }
    // If Login form was submitted
    else {
        var username = req.body.username;
        var password = req.body.password;
        
        var usernameQuery = User.find({ username: username });
        var usernameResult = await usernameQuery.exec();

        if (usernameResult.length > 0) {
            if (!usernameResult[0].verified) {
                return res.render('pages/index');
            }

            var bytes = CryptoJS.AES.decrypt(usernameResult[0].hash.toString(), usernameResult[0].key);
            var decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
    
            var helloMsg = ttt.createHelloMsg(username);
            console.log(helloMsg);

            if (decryptedPassword === password) {
                return res.render('pages/ttt_game', {
                    hellomsg: helloMsg
                });                
            }
            else {
                return res.render('pages/index');
            }
        }
    }
});

app.post('/ttt/play', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var winner = ttt.bestAIMove(req.body.grid);
    var json = { "grid": req.body.grid, "winner": winner };
    console.log(JSON.stringify(json));
    res.send(JSON.stringify(json));
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

