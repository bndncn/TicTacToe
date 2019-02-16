const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 80;
app.set('view engine', 'ejs');
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

// app.get('/ttt', (req, res) => res.sendFile('pages/index.ejs', {
//   root: __dirname
// }));

app.get('/ttt', function (req, res) {
  res.render('pages/index')
})

app.get('/css/styles.css', function (req, res) {
  res.sendFile('css/styles.css', {
    root: __dirname
  })
});

app.get('/controllers/board_controller.js', function (req, res) {
  res.sendFile('/controllers/board_controller.js', {
    root: __dirname
  })
});

app.post('/ttt', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  var helloMsg = createHelloMsg(req.body.name);
  console.log(helloMsg);
  res.render('pages/ttt_game', {
    hellomsg: helloMsg
  })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function getDate() {
  var date = new Date();
  var year = date.getFullYear();
  var month = (date.getMonth() + 1 < 10) ? ('0' + (date.getMonth() + 1)) : date.getMonth() + 1;
  var day = (date.getDate() < 10) ? ('0' + date.getDate()) : date.getDate();
  return year + '-' + month + '-' + day;
}

function createHelloMsg(name) {
  return `Hello $${name}, $` + getDate();
}