const express = require('express');
const bodyParser = require('body-parser');
const ttt = require('./ttt');

const app = express();
const port = 80;

app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/ttt', function (req, res) {
    res.render('pages/index');
});

app.get('/css/styles.css', function (req, res) {
    res.sendFile('css/styles.css', {
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

app.post('/ttt', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var helloMsg = ttt.createHelloMsg(req.body.name);
    console.log(helloMsg);
    res.render('pages/ttt_game', {
        hellomsg: helloMsg
    });
});

app.post('/ttt/play', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var winner = ttt.bestAIMove(req.body.grid);
    var json = {"grid": req.body.grid, "winner": winner};
    console.log(JSON.stringify(json));
    res.send(JSON.stringify(json));
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
