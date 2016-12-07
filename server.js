// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var redis = require('promise-redis')().createClient({
  url: `redis://${process.env.REDIS_URL}`,
  password: process.env.REDIS_PWD,
});

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/lunch-places", function (request, response) {
  redis.smembers('lunchPlaces')
  .then((lunchPlaces) => response.status(200).send({ lunchPlaces }))
  .catch((error) => response.status(500).send(error));
});

app.post("/lunch-places", bodyParser.json(), function (request, response) {
  if (!request.body || !request.body.place) {
    response.sendStatus(400);
    return;
  }
  console.log('request: ', request.body);
  
  redis.sadd('lunchPlaces', request.body.place)
  .then(() => response.sendStatus(200))
  .catch((error) => response.status(500).send(error));
});

app.get('/lunch-places/random', function (request, response) {
  redis.srandmember('lunchPlaces')
  .then((randomPlace) => response.status(200).send({ randomPlace }))
  .catch((error) => response.status(500).send(error));
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  for (const key in process.env) {
    console.log(`process.env[${key}]: ${process.env[key]}`);
  }
  
  console.log('Your app is listening on port ' + listener.address().port);
});
