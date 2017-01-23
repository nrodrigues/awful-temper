const lunchPlaces = require('./lunch-places');

module.exports = {
  getPage,
  getPlaces,
  getRandomPlace,
  getTodaysPlace,
  addPlace,
  deletePlace,
  resetTodaysPlace,
  voteDown,
};

function getPage(request, response) {
  response.sendFile(__dirname + '/views/index.html');
}

function getPlaces(request, response, next) {
  lunchPlaces.getAll()
    .then(lunchPlaces => response.send({ lunchPlaces }))
    .catch(next);
}

function addPlace(request, response, next) {
  if (!request.body || !request.body.place) {
    response.sendStatus(400);
    return;
  }
  
  lunchPlaces.add(request.body.place)
    .then(() => response.sendStatus(200))
    .catch(next);
}

function deletePlace(request, response, next) {
  lunchPlaces.remove(request.params.place)
    .then(() => response.sendStatus(200))
    .catch(next);
}

function getRandomPlace(request, response, next) {
  lunchPlaces.getRandom()
    .then(randomPlace => response.send({ randomPlace }))
    .catch(next);
}

function getTodaysPlace(request, response, next) {
  lunchPlaces.getTodaysPlace()
    .then(todays => response.send(todays) )
    .catch(next);
}

function resetTodaysPlace(request, response, next) {
  lunchPlaces.resetTodaysPlace()
    .then(() => response.sendStatus(200))
    .catch(next);
}

function voteDown(request, response, next) {
  if (!request.body || !request.body.user) {
    response.sendStatus(400);
    return;
  }

  lunchPlaces.voteDown(request.body.user)
    .then(() => response.sendStatus(200))
    .catch(next)
}