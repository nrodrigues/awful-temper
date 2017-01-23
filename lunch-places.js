const BadRequestError = require('./bad-request-error');

const PLACES_LIST_KEY = 'lunchPlaces';
const TODAYS_PLACE_KEY = 'lunchPlaces.today';
const TODAYS_PLACE_REJECTED_KEY = 'lunchPlaces.today.rejected';
const TODAYS_PLACE_VOTERS_KEY = 'lunchPlaces.today.voters';
                      // 8h
const TODAYS_EXPIRE = 8 * 60 * 60;
const MAJORITY_REQUIRED = 3;

module.exports = {
  getRandom,
  getAll,
  add,
  remove,
  getTodaysPlace,
  resetTodaysPlace,
  voteDown,
};

var redis = require('promise-redis')(require("when").promise).createClient({
  url: `redis://${process.env.REDIS_URL}`,
  password: process.env.REDIS_PWD,
});

function resetTodaysPlace() {
  return redis.DEL(TODAYS_PLACE_KEY, TODAYS_PLACE_VOTERS_KEY, TODAYS_PLACE_REJECTED_KEY);
}

function getTodaysPlace() {
  return redis.get(TODAYS_PLACE_KEY)
              .then(checkPlace)
              .then(getMetaData)
              .spread((todaysPlace, rejected, voters, ttl) => ({ todaysPlace, rejected, voters, ttl }));
  
  function getMetaData(place) {
    return [
      place,
      redis.SMEMBERS(TODAYS_PLACE_REJECTED_KEY),
      redis.SMEMBERS(TODAYS_PLACE_VOTERS_KEY),
      redis.TTL(TODAYS_PLACE_KEY),
    ];
  }
  
  function checkPlace(place) {
    if (place === null) {
      return initTodaysPlace();
    }
    
    return place;
  }
}

function voteDown(user) {
  
  return redis.sadd(TODAYS_PLACE_VOTERS_KEY, user)
          .then(added => { if (!added) throw new BadRequestError(`${user} already voted`) })
          .then(() => redis.SCARD(TODAYS_PLACE_VOTERS_KEY))
          .then(checkCount);
  
  function checkCount(count) {
    if (count >= MAJORITY_REQUIRED) {
      return rejectTodaysPlace();
    }
  }
}

function rejectTodaysPlace() {
  return redis.get(TODAYS_PLACE_KEY)
          .then(place => redis.sadd(TODAYS_PLACE_REJECTED_KEY, place))
          .then(() => redis.DEL(TODAYS_PLACE_VOTERS_KEY))
          .then(() => redis.SDIFF(PLACES_LIST_KEY, TODAYS_PLACE_REJECTED_KEY))
          .then(pickNext);
  
  function pickNext(available) {
    return redis.set(TODAYS_PLACE_KEY, getRandomFromList(available));
  }
}

function initTodaysPlace() {
  return getRandom()
          .then(place => {
            return redis.DEL(TODAYS_PLACE_REJECTED_KEY, TODAYS_PLACE_VOTERS_KEY)
                    .then(() => redis.setex(TODAYS_PLACE_KEY, TODAYS_EXPIRE, place))
                    .then(() => place);
          });
  
}

function getRandom() {
  return getAll().then(getRandomFromList);
}

function getAll() {
  return redis.smembers(PLACES_LIST_KEY);
}

function add(place) {
  console.log('Adding "' + place + '"');
  return redis.sadd(PLACES_LIST_KEY, place);
}

function remove(place) {
  console.log('Removing "' + place + '"');
  return redis.srem(PLACES_LIST_KEY, place);
}


function getRandomFromList(places) {
  return places[Math.floor(Math.random() * places.length)];
}