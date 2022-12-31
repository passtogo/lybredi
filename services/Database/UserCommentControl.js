const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Pool = require('pg').Pool;
const time = require('moment');

const saltRounds = 10;

const pool = new Pool(
  process.env.DBURL || {
    user: 'postgres',
    host: 'localhost',
    database: 'brainblogger',
    password: 'H3B3r!',
    port: 5432,
  }
);

const getComments = (request, response) => {
  pool.query('select id from users where uuid = $1', [request.body.user], (err, results) => {
    if (err) {
      throw err;
    }
    const query = `
    select c.created_at, c.body, c.uuid as commentid,
    u.id, u.first, u.last, u.uuid as userid,
    exists(select 1 from commentlikes l where
    l.comment_id = c.id and l.user_id = $1 limit 1) as liked,
    (select count(distinct l.user_id) from commentlikes l where l.comment_id = c.id) as countlikes
    from posts p 
    right join comments c on p.id = c.post_id
	  left join users u on c.user_id=u.id
    where p.uuid = $2
    ORDER BY c.created_at DESC LIMIT 16`;
    pool.query(query, [results.rows[0].id, request.body.post], (error, results) => {
      if (error) {
        throw error;
      }
      for (let i = 0; i < results.rows.length; i++) {
        results.rows[i].created_at = time(results.rows[i].postdate).fromNow();
      }
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*', // Allow access from other domains
      });
      response.write(
        JSON.stringify({
          comments: results.rows,
          info: request.body.info,
          postid: request.body.post,
        })
      );
      response.end();
    });
  });
};

const getCommentById = (request, response) => {
  pool.query(
    'SELECT p.uuid, p.msg, p.likes, p.created_at as date FROM posts p WHERE uuid = $1;',
    [request.body.post],
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows[0].date = time(results.rows[0].date).fromNow();
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*', // Allow access from other domains
      });
      response.write(JSON.stringify({ post: results.rows[0], info: request.body.info }));
      response.end();
    }
  );
};

const createComment = (data, callback) => {
  pool.query('SELECT * FROM users WHERE uuid = $1;', [data.userid], (error, results) => {
    if (error) {
      throw error;
    }
    const user = results.rows[0];
    pool.query('SELECT * FROM posts WHERE uuid = $1;', [data.postid], (error, results) => {
      if (error) {
        throw error;
      }
      const post = results.rows[0];

      pool.query(
        'INSERT INTO comments (post_id, user_id, body) VALUES ($1, $2, $3);',
        [post.id, user.id, data.comment],
        (error) => {
          if (error) {
            throw error;
          }
          console.log('Comment was added successfully!');
          pool.query(
            `SELECT * FROM comments ORDER BY created_at DESC LIMIT 1;`,
            (error, results) => {
              if (error) {
                throw error;
              }
              data.commentid = results.rows[0].uuid;
              data.date = time(results.rows[0].created_at).fromNow();
              callback(data);
            }
          );
        }
      );
    });
  });
};

const updateComment = (socket) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3;',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const deleteComment = (socket) => {
  const id = parseInt(request.params.id);

  pool.query('DELETE FROM users WHERE id = $1;', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

const commentLike = (data) => {
  pool.query('SELECT id FROM comments WHERE uuid = $1;', [data.comment], (err, results) => {
    if (err) {
      throw err;
    }
    const comment = results.rows[0];

    pool.query('SELECT id FROM users WHERE uuid = $1;', [data.user], (err, results) => {
      if (err) {
        throw err;
      }
      if (data.like) {
        pool.query(
          'INSERT INTO commentlikes (comment_id, user_id) VALUES ($1, $2);',
          [comment.id, results.rows[0].id],
          (err) => {
            if (err) {
              throw err;
            }
            console.log('Liked Successful');
          }
        );
      } else {
        pool.query(
          'DELETE FROM commentlikes WHERE comment_id = $1 AND user_id = $2;',
          [comment.id, results.rows[0].id],
          (err) => {
            if (err) {
              throw err;
            }
            console.log('Unliked Successful');
          }
        );
      }
    });
  });
};

module.exports = {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  commentLike,
};
