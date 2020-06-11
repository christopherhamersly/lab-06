
'use strict'

const express = require('express');
const app = express ();
const cors = require('cors');
const superagent = require ('superagent')
const pg = require('pg');
require('dotenv').config();

app.use(cors());
const PORT = process.env.PORT || 3001;

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

//add event handlers here for all of the pages.  
app.get('/location', locationHandler);
app.get('/yelp', restaurantHandler);
app.get('/trails', trailHandler);
app.get('/weather', weatherHandler);
app.get('/movies', movieHandler);
app.get('/*', handlenotFound);




function locationHandler (request, response) {
  try{
    let city = request.query.city;
    let url =  `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

    let sqlQuery = 'SELECT * FROM location WHERE search_query =$1;'
    let safeValue = [city];

    client.query(sqlQuery, safeValue)
      .then(sqlResults =>{
        if (sqlResults.rowCount){
          response.status(200).send(sqlResults.rows[0]);
        } else {
          superagent.get(url).then(resultsFromSuperAgent =>{
            let citySearch = new Location(city, resultsFromSuperAgent.body[0]);
            let sqlQuery = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
            let safeValue = [city, citySearch.formatted_query, citySearch.latitude, citySearch.longitude];
            client.query(sqlQuery, safeValue)
            response.status(200).send(citySearch);
          })
        }})

  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, there is an error on location');
  }
}

function weatherHandler (request, response) {
  try{
    let search_query = request.query.search_query;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${process.env.WEATHER_DATA_API_KEY}&days=8`;

    superagent.get(url).then(resultsFromSuperAgent => {
      const data = resultsFromSuperAgent.body.data;
      const weatherResults = data.map(value => new Weather(value));
      response.status(200).send(weatherResults);
    })
  } catch(err){
    console.log('ERROR', err);
    response.status(500).send('sorry there is an error on weather');
  }
  function Weather(obj){
    this.forecast = obj.weather.description
    this.time = new Date(obj.valid_date).toDateString();
  }
}

function trailHandler (request, response) {
  try {
    const {latitude, longitude} = request.query;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.HIKING_PROJECT_API_KEY}`;
    console.log(request.query);

    superagent.get(url).then(resultsFromSuperAgent => {
      const data = resultsFromSuperAgent.body.trails;
      const results = data.map(item => new Trail(item));
      response.status(200).send(results);
    })
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we meesed up');
  }
}

function movieHandler (request, response) {
  try {
   
    let city = request.query.search_query;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_DATABASE_API_KEY}&query=${city}`;
    
   
    superagent.get(url).then(resultsFromSuperAgent => {
     
      const data = resultsFromSuperAgent.body.results;
      const results = data.map(item => new Movies(item));
      // console.log(results);
      response.status(200).send(results);
    })
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we meesed up');
  }
}

function restaurantHandler (request, response) {
  console.log('this is our restaurant Route', request.query );
  const page = request.query.page;
  const numPerPage = 5;
  const start = (page -1) * numPerPage;
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${request.query.latitude}&longitude=${request.query.longitude}`;

  const queryParams ={
    // count: numPerPage,
    start: start,
    // lat: request.query.latitude,
    // lon: request.query.longitude,
  }

  superagent.get(url)
    .set('Authorization',`Bearer ${process.env.YELP_API_KEY}`)
  //  search yelp how to send the key in the header for right now.
    .query(queryParams)
    .then(data => {
      // console.log('data from super agent', data.body)
      let restaurantArray = data.body.businesses;

      const finalRestaurants = restaurantArray.map(eatery => {
        return new Restaurant(eatery);
      })
      // page += 1;
      response.status(200).send(finalRestaurants);
    })
    .catch(
    )
}

//CONSTRUCTOR FUNCTIONS


function Trail(obj){
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  this.condition_date = new Date(obj.condtionDate).toDateString();
  this.condition_time = obj.conditionDate.slice(11);
}

function Location(searchQuery, obj){
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Movies(obj){
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = obj.poster_path;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}

function Restaurant(obj){
  this.name = obj.name
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url
}

function handlenotFound (request, response){
  response.status(404).send('sorry, this route does not exist here');
}

client.connect()
  .then(()=> {
    app.listen(PORT, () =>{
      console.log(`hello, you are on ${PORT}`);
    })
  })

