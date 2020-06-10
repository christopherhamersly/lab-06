'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());


app.get('/location', (request, response) => {
  try{
    let city = request.query.city;

    let url =  `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

    superagent.get(url).then(resultFromSuperAgent => {
      let finalObj = new Location(city, resultFromSuperAgent.body[0])
      response.status(200).send(finalObj);
    })

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

app.get('/weather', (request, response) => {
  try{
    let search_query = request.query.search_query;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${process.env.WEATHER_DATA_API_KEY}&days=8`;

    superagent.get(url).then(resultsFromSuperAgent => {
      const data = resultsFromSuperAgent.body.data;
      const weatherResults = data.map(value => new Weather(value));
      response.status(200).send(weatherResults);
    })
  } catch(err){
    response.status(500).send('sorry there is an error on weather');
  }
  function Weather(obj){
    this.forecast = obj.weather.description
    this.time = new Date(obj.datetime).toDateString();
  }
})



app.get('/trails', (request, response) => {
  try {
    const {latitude, longitude} = request.query;
    const key = process.env.HIKING_PROJECT_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${key}`;
    console.log(request.query);

    superagent.get(url)
      .then(resultsFromSuperAgent => {
        const data = resultsFromSuperAgent.body.trails;
        const results = data.map(item => new Trail(item));
        console.log(results);
        response.status(200).send(results);
      })
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we meesed up');
  }
})
function Trail(obj){
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  this.condition_date = new Date(obj.condtionDate).toDateString;
  this.condition_time = obj.conditionDate;

}


app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist here');
})
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
