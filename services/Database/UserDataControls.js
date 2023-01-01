const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Pool = require('pg').Pool;
const time = require('moment');
const saltRounds = 10;

const pool = new Pool(
  {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'brainblogger',
    password: process.env.PGPASSWORD || 'H3B3r!',
    port: process.env.PGPOST || 5432,
  }
);

const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getUserById = (uuid, callback) => {
  pool.query(
    'SELECT uuid, first, last, created_at FROM users WHERE uuid = $1',
    [uuid],
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows[0].created_at = time(results.rows[0].created_at).format('MMM Do YY');
      callback(results.rows[0]);
    }
  );
};

function getUser(username, password, fn) {
  if (!module.parent) console.log('authenticating %s:%s', username, password);

  pool.query('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
    if (error) {
      throw error;
    }
    if (results.rows[0] == undefined) {
      return fn(new Error('Authentication failed. No user found!'), null);
    } else {
      bcrypt // Compare the passwords to check if it is the right user
        .compare(password, results.rows[0].password)
        .then(function (result) {
          // result == true
          if (!result) {
            return fn(new Error('Authentication failed. No user found!'), null);
          } else {
            const user = results.rows[0];
            return fn(null, user); // If it is the right user then continue
          }
        })
        .catch((err) => {
          //If there is an error in the execution it will be handled
          return fn(err, null);
        });
    }
  });
}

const createUser = (request, response) => {
  bcrypt.hash(request.body.password, saltRounds, function (err, hash) {
    const { first, last, username, email, phone } = request.body;

    pool.query(
      'INSERT INTO users (first, last, username, password, email, phone) VALUES ($1, $2, $3, $4, $5, $6)',
      [first, last, username, hash, email, phone],
      (error) => {
        if (error) {
          throw error;
        } else {
          pool.query('select * from users order by created_at desc limit 1', (error, results) => {
            if (error) {
              throw error;
            } else {
              const user = results.rows[0];
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
              return response.redirect('/publisher/author');
            }
          });
        }
      }
    );
  });
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

const user = (request, response) => {
  pool.query(
    'SELECT * FROM users WHERE uuid = $1',
    [request.session.currentUser.uuid],
    (error, results) => {
      if (error) {
        throw error;
      }
      const user = results.rows[0];
      pool.query(
        'select s.uuid, s.first, s.last, s.username, s.created_at as date, p.uuid as postid, p.title, p.body, p.created_at as postdate from posts p left join users s on p.user_id = s.uuid where user_id = $1 ORDER BY p.created_at DESC',
        [user.uuid],
        (err, results) => {
          if (err) {
            throw err;
          }
          const posts = results.rows;
          for (let i = 0; i < posts.length; i++) {
            posts[i].date = time(posts[i].date).fromNow();
            posts[i].postdate = time(posts.postdate).fromNow();
          }

          pool.query(
            'select distinct category from posts where user_id = $1 order by category ',
            [user.uuid],
            (err, results) => {
              const login = request.session.user ? true : false;

              return response.render('layout', {
                pageTitle: 'Author',
                template: 'author',
                user,
                login,
                categories: results.rows,
                posts: posts.length > 0 ? posts : null,
              });
            }
          );
        }
      );
    }
  );
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  user,
};
