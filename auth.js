const UnauthorizedError = require('./unauthorized-error');
const BadRequestError = require('./bad-request-error');

module.exports = auth;
auth.authenticate = authenticate;

function auth(request, response, next) {
  if (!isAuthenticated(request.headers.authorization)) {
    next(new UnauthorizedError());
    return;
  }
  
  next();
}

function authenticate(request, response, next) {
  if (!isAuthenticated(request.body.password)) {
    next(new BadRequestError('Invalid password'));
    return;
  }
  
  response.sendStatus(200);
}

function isAuthenticated(password) {
  return password && password === process.env.AUTH_PASSWORD;
}