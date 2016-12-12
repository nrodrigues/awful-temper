// server.js
// where your node app starts

// init project
const express = require('express');
const bodyParser = require('body-parser');
const formidable = require('express-formidable');
const app = express();

const controllers = require('./controllers');
const slack = require('./slack');
const BadRequestError = require('./bad-request-error');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", controllers.getPage);

// api
app.get("/lunch-places", controllers.getPlaces);
app.get('/lunch-places/random', controllers.getRandomPlace);

app.post("/lunch-places", bodyParser.json(), controllers.addPlace);
app.delete("/lunch-places/:place", controllers.deletePlace);

app.get('/lunch-places/todays', controllers.getTodaysPlace);
// app.post('/lunch-places/todays/votedown', bodyParser.json(), controllers.voteDown);
app.get('/lunch-places/todays/reset', controllers.resetTodaysPlace);

// slack
app.post('/slack/lunch-places/todays', formidable(), slack.getTodaysPlace);

// Error handling
app.use((error, request, response, next) => {
  if (error.name === 'BadRequestError') {
    response.status(400).send({ message: error.message });
    return;
  }
  
  console.error(error);
  next('something went wrong!!!!');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  for (const key in process.env) {
    console.log(`process.env[${key}]: ${process.env[key]}`);
  }
  
  console.log('Your app is listening on port ' + listener.address().port);
});
