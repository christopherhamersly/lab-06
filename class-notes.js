import { response } from "express";

app.get('/location', locationHandler);
app.get('/restaurants', restaurantHandler);



//all of it.  In case someone tries to create and delete.  This is a catch all.  A just in case.
app.use('*', handleNotFound)

// .get
// .post
// .delete
// .update

function locationHandler(request, response){
  let city = request.query.city
  let url = let url =  'https://us1.locationiq.com/v1/search.php';
  const queryParams = {
    key: process.env.GEO_DATA_API_KEY, 
    q: city, 
    format:'json',
    limit:1
    //order does not matter for the query
  }

  superagent.get(url)
    .query(queryParams)
    .then(data => {
      console.log('results from superagent')
      const geoData = data.body[0];
      const location = new Location (city, geoData);

      response.status(200).send(location);
    });
    //HAVE TO SET A HEADER HERE FOR THE LAB FOR YELP.  DIVE INTO THE DOCS TO FIGURE IT OUT.  Yelp requires you to put a key in the header.  

};


function restaurantHandler (request, response) => {
console.log('this is our restaurant Route', request.query );


const page = request.query.page;
const numPerPage = 5;
const start = (page -1) * numPerPage; // this may not be the correct formula, we may have to refactor it. 

//this is the number of results of that are shown on the page, 1-5 rendering on the first set, and then 6-10, 11-15
const url = 'https://developers.zomato.com/api/v2.1/search'

const queryParams ={
  lat: request.query.latitude,
  start: start, 
  count: numPerPage, 
  lng: request.query.longitude
}

superagent.get(url)
.set('user-key', process.env.ZOMATO_API_KEY)
//  search yelp how to send the key in the header for right now.
.query(queryParams)
.then(data => {
  console.log('data from super agent', data.body)
  let restaurantArray = data.body.restaurants;

  const finalRestaurants = restaurantArray.map(eatery => {
    return new restaurantArray(eater);
  })
  response.status(200).send(finalRestaurants);
}).catch( //insert a parameter into here. )
}






function Location(searchQuery, obj){
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;

function handleNotFound(request, response){
  response.status(404).send('this route does not exist');
}

function Restaurant(obj){
this.restaurant = obj.restaurant.display_name;
this.cuisines = obj.restaurant.cuisines;
this.locality = obj.restaurant.locality;
}