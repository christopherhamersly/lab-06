'use strict'

const express = require('express')

const app = express();

require('dotenv').config();

app.use(express.static('./public'));
const PORT = process.env.PORT;

// app.get('/', function (request, response){ 
//   request.send('Hello World')
// })

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})