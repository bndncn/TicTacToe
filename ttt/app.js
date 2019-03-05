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

var gameSchema = new Schema({
    token: String,
    id: Number,
    start_date: String,
    grid: [String, String, String, String, String, String, String, String, String],
    winner: String
});

var scoreSchema = new Schema({
    token: String,
    human: Number,
    wopr: Number,
    tie: Number
});

var User = mongoose.model('Users', userSchema);
var Game = mongoose.model('Games', gameSchema);
var Score = mongoose.model('Scores', scoreSchema);

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

async function createNewGame(token, id) {
    var game = {
        token: token,
        id: id,
        start_date: ttt.getDate(),
        grid: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        winner: ' '
    }

    console.log('Created a new game');

    var data = new Game(game);
    data.save();     
}

/**
 * 
 * Checks if there's an unfinished game in progress.
 * If there is none, it returns the next game's ID (new game to be created).
 * If there is an unfinished game, it returns -1.
 */
async function getCurrentGame(token) {
    var gamesQuery = Game.find({ token: token });
    var gamesResult = await gamesQuery.exec();
    // No games were ever played
    if (gamesResult.length == 0) {
        return 1;    
    }
    else {
        var lastGame = gamesResult[gamesResult.length - 1];
        // If no one won in the last game, return -1. Else, return the next game's ID.
        return lastGame.winner == ' ' ? -1 : gamesResult.length;
        
    }
}

app.post('/logout', function (req, res) {
    if (req.cookies.token) {
        console.log('clearing cookie');
        res.clearCookie('token');
        res.send(JSON.stringify(OK_STATUS));
    } else {
        console.log('logout without valid cookie');
        res.send(JSON.stringify(ERROR_STATUS));
    }
});

app.get('/ttt', async function (req, res) {
    if (req.cookies.token) {
        console.log('token = ' + req.cookies.token);
        var cookieQuery = User.find({ key: req.cookies.token });
        var cookieResult = await cookieQuery.exec();
        var helloMsg = ttt.createHelloMsg(cookieResult[0].username);
        console.log(helloMsg);
        var currentGame = getCurrentGame(req.cookies.token);
        if (currentGame != -1) {
            res.render('pages/ttt_game', {
                hellomsg: helloMsg,
                cell0: ' ',
                cell1: ' ',
                cell2: ' ',
                cell3: ' ',
                cell4: ' ',
                cell5: ' ',
                cell6: ' ',
                cell7: ' ',
                cell8: ' ',
            });
        }
        else {
            var gamesQuery = Game.find({ token: token });
            var gamesResult = await gamesQuery.exec();
            var grid = gamesResult[gamesResult.length - 1].grid;
            res.render('pages/ttt_game', {
                hellomsg: helloMsg,
                cell0: grid[0],
                cell1: grid[1],
                cell2: grid[2],
                cell3: grid[3],
                cell4: grid[4],
                cell5: grid[5],
                cell6: grid[6],
                cell7: grid[7],
                cell8: grid[8],
            });
        }
    } 
    else {
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

        var emailQuery = User.find({ email: email });
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

app.post('/ttt/play', async function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var token = req.cookies.token;

    if (token) {
        var currentGame = await getCurrentGame(token);
        var moveIndex = req.body.move;
        var currentGrid, winner;
        
        var gamesQuery = Game.find({ token: token });
        var gamesResult = await gamesQuery.exec();

        // If no one won in the last game, continue the game
        if (currentGame == -1) {
            currentGrid = gamesResult[gamesResult.length - 1].grid;
            winner = gamesResult[gamesResult.length - 1].winner;
            currentGame = gamesResult.length;
        }
        else {
            console.log(currentGame);
            createNewGame(token, currentGame);
            currentGrid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
            winner = ' ';
        }

        gamesQuery = Game.find({ token: token });
        gamesResult = await gamesQuery.exec();
        console.log(moveIndex);

        if (moveIndex == null) {
            var json = { "grid": currentGrid, "winner": winner };
            return res.send(JSON.stringify(json));
        }
        else if (currentGrid[moveIndex] != ' ') {
            console.log('Please select an empty square.')
            return res.send(JSON.stringify(ERROR_STATUS));
        }
        else {
            currentGrid[moveIndex] = 'X'; // Make the move

            // If game is done
            if (ttt.isGameDone(currentGrid)) {
                return processGameEnd(currentGrid, gamesResult, token, currentGame, res);
            }

            ttt.bestAIMove(currentGrid);

            if (ttt.isGameDone(currentGrid)) {
                return processGameEnd(currentGrid, gamesResult, token, currentGame, res);
            }
            else {
                var json = { status:"OK", "grid": currentGrid, "winner": ' ' };
                console.log(gamesResult[0].grid)
                console.log(currentGame)
                gamesResult[currentGame - 1].grid = currentGrid;
                gamesResult[currentGame - 1].save();
                console.log(JSON.stringify(json));
                return res.send(JSON.stringify(json));
            }
        }
    }
    else {
        console.log('Please log in to play.');
        return res.send(JSON.stringify(ERROR_STATUS));
    }
});

function processGameEnd(grid, gamesResult, token, id, res) {
    if (ttt.isGameDone(grid)) {
        var winner = ttt.getWinner(grid);
        var json = { status:"OK", "grid": grid, "winner": winner };
        console.log(JSON.stringify(json));
        res.send(JSON.stringify(json));
        gamesResult[id - 1].grid = grid;
        gamesResult[id - 1].winner = winner;
        gamesResult[id - 1].save();
        createNewGame(token, id + 1);
    }    
}

app.listen(port, () => console.log(`Listening on port ${port}!`));
