const jwt = require('jsonwebtoken');
const db = require('./Database/UserDataControls');
const Pool = require('pg').Pool;

const pool = new Pool(
  process.env.DBURL || {
    user: 'postgres',
    host: 'localhost',
    database: 'brainblogger',
    password: 'H3B3r!',
    port: 5432,
  }
);

const createTables = () => {
  pool.query(
    `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE IF NOT EXISTS public.users (
        id serial,
        uuid uuid DEFAULT uuid_generate_v4 () primary key NOT NULL,
        first varchar(70) NOT NULL,
        last varchar(70) NOT NULL,
        username varchar(150) NOT NULL,
        password varchar(255) NOT NULL,
        email varchar(255) UNIQUE NOT NULL,
        phone varchar(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE TABLE IF NOT EXISTS public.posts (
        id serial primary key,
        uuid uuid DEFAULT uuid_generate_v4 () NOT NULL,
        user_id uuid NOT NULL,
        category varchar(25) not null,
        title varchar(255) not null,
        body text NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS public.feedback (
        id serial primary key,
        first varchar(70) NOT NULL,
        last varchar(70) NOT NULL,
        happy BOOLEAN NOT NULL,
        rating smallint NOT NULL DEFAULT 0,
        description text NOT NULL DEFAULT 'Not Provided'
      );
      CREATE TABLE IF NOT EXISTS public.contacts (
        id serial primary key,
        First varchar(70) not null,
        Last varchar(70) not null,
        email varchar(255) not null, 
        phone varchar(20) not null,
        message text not null
      );
    `
  );
};

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
  createTables,
  loginRequired,
  register,
  login,
};
