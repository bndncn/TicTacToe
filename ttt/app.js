const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 80;

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/ttt', (req, res) => res.sendFile('index.html', { root: __dirname}));

app.get('/css/styles.css', function(req, res) {
  res.sendFile('css/styles.css', { root: __dirname})
});

app.post('/ttt', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  console.log(createHelloMsg(req.body.name));
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