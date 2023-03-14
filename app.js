var createError = require('http-errors');
var express = require('express');
var app = express()

const routes = require('./routes/routes')

app.use(express.json());
app.use('/',routes);

const port = process.env.port || 5001;

app.listen(port,()=>{
  console.log(`Server started at https://localhost:${port}`)
})

module.exports = app;