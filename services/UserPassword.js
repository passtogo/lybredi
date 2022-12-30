//const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');
//const db = require('../models/index');
//const saltRounds = 10;

function authenticate(firstname, lastname, email, fn) {
  /*if (!module.parent) console.log('authenticating %s:%s:%s');
  db.user
    .findOne({
      where: {
        email: email,
      },
    })
    .then((user) => {
      if (!user) {
        return fn(new Error('Authentication failed. No user found!')); // If user does not exist throw an error
      } else if (user) {
        if (user.firstname == firstname && user.lastname == lastname) {
          return fn(null, user);
        } else {
          return fn(new Error('Authentication failed. No user found!'));
        }
      }
    })
    .catch((err) => {
      //If there is an error in the execution it will be handled
      return fn(err);
    });*/
}

const profileVerification = (request, response, next) => {
  /*let access = false;
  authenticate(request.body.firstname, request.body.lastname, request.body.email, (err, user) => {
    if (user) {
      access = true;
      try {
        return response.render('layout', {
          pageTitle: 'Password Reset',
          template: 'password',
          access: access,
          id: user.uuid,
        });
      } catch (error) {
        return next(error);
      }
    } else {
      request.session.error = 'Athentication failed, try again';
      response.redirect('/password');
    }
  });*/
};

const passwordUpdate = (request, response) => {
  /*if (!module.parent) console.log('authenticating %s', request.body.identif);
  db.user
    .findOne({ where: { uuid: request.body.identif } })
    .then((user) => {
      if (!user) {
        return new Error('Authentication failed. No user found!');
      } else {
        if (request.body.password1 === request.body.password2) {
          bcrypt.hash(request.body.password1, saltRounds, function (err, hash) {
            user.password = hash;
            user.save({ fields: ['password'] });
            return response.redirect('/');
          });
        } else {
          return new Error('Password and password verification did not match.');
        }
      }
    })
    .catch();*/
};

module.exports = {
  profileVerification,
  passwordUpdate,
};
