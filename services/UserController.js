const jwt = require('jsonwebtoken');
const db = require('./Database/UserDataControls');

const loginRequired = (request, response, next) => {
  if (request.session.user) {
    next();
  } else {
    request.session.error = 'Access denied!';
    return response.redirect('/');
  }
};

const register = db.createUser;

const login = (request, response, page) => {
  db.getUser(request.body.username, request.body.password, (err, user) => {
    if (user) {
      response.locals.currentUser = user;
      // Regenerate session
      if (!request.session.user) {
        // Add it to the session
        request.session.currentUser = {
          uuid: user.uuid,
          first: user.first,
          last: user.last,
          username: user.username,
          date: user.created_at,
        };
        request.session.user = {
          token: jwt.sign(
            {
              _uuid: user.uuid,
              first: user.first,
              last: user.last,
              username: user.username,
              email: user.email,
              date: user.created_at,
            },
            'userAPI'
          ),
        };
        request.session.success = 'Authentication successful!';
      }
      return response.redirect(page);
    } else {
      request.session.error = 'Authentication failed, try again';
      return response.redirect('/');
    }
  });
};

module.exports = {
  loginRequired,
  register,
  login,
};
