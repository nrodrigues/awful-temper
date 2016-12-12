const lunchPlaces = require('./lunch-places');
const BadRequestError = require('./bad-request-error');
const slackToken = 'JsWGNR0Y8Cpq1AFCCt9Fbavh';

module.exports = {
  getTodaysPlace: todaysPlaceController,
};

function todaysPlaceController(request, response, next) {
  if (!request.fields || request.fields.token != slackToken) {
    return next(new BadRequestError('failed slack autentication'));
  }
  
  console.log(`Slack command by ${request.fields.user_name}`);
  
  if (request.fields.text === 'reject') {
    return lunchPlaces.voteDown(request.fields.user_name)
              .then(getPlace)
              .catch(err => {
                if (err.name === 'BadRequestError') {
                  response.status(400).send({
                    attachments: [ { text: err.message, color: 'danger' } ],
                  });
                  return;
                }
                next(err);
              });
  }
  return getPlace();

  function getPlace() {
    return getTodaysPlace()
            .then(todays => response.send(todays))
            .catch(next);
  }
}

function getTodaysPlace() {
  return lunchPlaces.getTodaysPlace()
            .then(formatTodaysPlace);
}

function formatTodaysPlace(place) {
  const message = `GET YOUR ASSES TO *${place.todaysPlace}* NOW!!!!!!!!!!!!!!!!!!!\n`;
  const votes = place.voters.length ? `*${getVotersMsgFormat(place.voters)} don't like this idea!*\n` : '';
  const rejected = place.rejected.length ? `${getRejectedMsgFormat(place.rejected)} already rejected for today\n` : '';
  const link = 'https://awful-temper.gomix.me/';

  return {
    // response_type: 'in_channel',
    text: `${message}${votes}${rejected}${link}`,
  };
}

function getRejectedMsgFormat(rejected) {
  return toItemsList(rejected.map(r => `*${r}*`));
}

function getVotersMsgFormat(voters) {
  return toItemsList(voters.map(u => `@${u}`));
}

function toItemsList(list) {
    const len = list.length;
    if (len === 1) {
      return list[0];
    }

    const firsts =  list.slice(0, len - 1);
    const last = list[len -1];
    return [firsts.join(', '), last].join(' and ');
  }