'use strict';

// express library sets up our server
const express = require('express');
// initalizes our express library into our variable called app
const app = express();

// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// bodyguard of our server - tells who is ok to send data to
const cors = require('cors');
app.use(cors());


// bring in the PORT by using process.env.variable name
const PORT = process.env.PORT || 3001;

app.get('/location', (request, response) => {
  try{
    // query: { city: 'seattle' },
    console.log(request.query.city);
    let search_query = request.query.city;

    let geoData = require('./data/location.json');

    let returnObj = new Location(search_query, geoData[0]);

    console.log(returnObj);

    response.status(200).send(returnObj);

  } catch(err){
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }

})

function Location(searchQuery, obj){
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

// turn on the lights - move into the house - start the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})

app.get('/weather', (request, response) => {
  try{
    let weatherData = require('./data/weather.json');
    // console.log(`${weatherData.data[0].valid_date}`);
    const weatherArr = weatherData.data.map(value => {
      return new Weather(value);

    // console.log(`${value[0]}`)
    });
    console.log (`${weatherArr}`);
    // weatherData.data.forEach(weatherLoop => weatherArr.push(new Weather(weatherLoop)));

    response.status(200).send(weatherArr);

  } catch(err){
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }

})
app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})

function Weather(obj){
  // this.formatted_query = obj.display_name;
  this.forecast = obj.weather.description;
  this.time = new Date(obj.valid_date).toDateString();
}
