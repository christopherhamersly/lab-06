'use strict'

const express = require('express')

const app = express();

require('dotenv').config();

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT||3001;

// app.use(express.static('./public'));
// app.get('/', function (request, response){ 
//   request.send('Hello World')
// })

// app.get
// app.listen(PORT, () => {
//   console.log(`listening on ${PORT}`);
// })

app.get('/location', (request, response) => {
  try{
    let search_query = request.query.city;

    let geoData = require('/.data/location.json');

    let returnObj = new Location(search_query, geoData[0]);

    console.log(returnObj);

    response.status(200).send(returnObj);

  } catch(err) {
    console.log('Error', err);
    response.status(500).send('sorry, we messed up');
  }
})

function Location(searchQuery, obj){
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})

// turn on the lights - move into the house - start the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
