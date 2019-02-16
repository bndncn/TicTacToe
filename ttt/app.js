const express = require('express')
const app = express()
const port = 80

app.get('/ttt', (req, res) => res.sendFile('index.html', { root: __dirname}))
app.get('/css/styles.css', function(req, res) {
  res.sendFile("css/styles.css", { root: __dirname})
})


app.post('/ttt', (req, res) => {
  console.log(req)
})





app.listen(port, () => console.log(`Example app listening on port ${port}!`))


