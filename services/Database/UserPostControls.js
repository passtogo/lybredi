const bcrypt = require('bcrypt');
const { request } = require('express');
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

const getPostsAndCategories = (callback) => {
  pool.query(
    'select p.uuid, p.title, p.body, p.created_at as date, u.username from posts p left join users u on u.uuid = p.user_id order by p.created_at desc',
    (error, results) => {
      if (error) {
        callback(null, null);
        return;
      }
      const posts = results.rows;
      pool.query('SELECT DISTINCT category FROM posts order by category', (error, results) => {
        if (error) {
          throw error;
        }
        const categories = results.rows;
        for (let i = 0; i < posts.length; i++) {
          posts[i].date = time(posts[i].date).fromNow();
        }
        callback(posts, categories);
      });
    }
  );
};

const getAllPosts = (callback) => {
  pool.query(
    'SELECT p.uuid, p.title, p.body, p.created_at as date, u.username FROM posts p left join users u on u.uuid = p.user_id order by p.created_at desc',
    (err, results) => {
      if (err) {
        throw err;
      }
      const posts = results.rows;
      for (let i = 0; i < posts.length; i++) {
        posts[i].date = time(posts[i].date).fromNow();
      }
      callback(posts);
    }
  );
};

const getPostsByCategory = (category, callback) => {
  pool.query(
    'SELECT p.uuid, p.title, p.body, p.created_at as date, u.username FROM posts p left join users u on u.uuid = p.user_id where p.category = $1 order by p.created_at desc',
    [category],
    (err, results) => {
      if (err) {
        throw err;
      }
      const posts = results.rows;
      for (let i = 0; i < posts.length; i++) {
        posts[i].date = time(posts[i].date).fromNow();
      }
      callback(posts);
    }
  );
};

const getPostById = (id, callback) => {
  console.log(id);
  pool.query(
    'SELECT p.uuid, p.category, p.title, p.body, p.created_at as date, u.uuid as user, u.first, u.last, u.username FROM posts p inner join users u on p.user_id = u.uuid WHERE p.uuid = $1;',
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows[0].date = time(results.rows[0].date).fromNow();
      const post = results.rows[0];

      pool.query('SELECT DISTINCT category FROM posts order by category', (error, results) => {
        if (error) {
          throw error;
        }
        const categories = results.rows;
        callback(post, categories);
      });
    }
  );
};

const createPost = (data, callback) => {
  pool.query(
    'INSERT INTO posts (user_id, category, title, body) VALUES ($1, $2, $3, $4);',
    [data.user_id, data.list, data.title, data.body],
    (error) => {
      if (error) {
        throw error;
      }
      console.log('Post was added successfully!');
      pool.query(
        'select uuid, user_id, category, title, body, created_at as date from posts order by created_at desc limit 1',
        (err, results) => {
          if (err) {
            throw err;
          }
          const post = {
            username: data.username,
            user_id: results.rows[0].user_id,
            category: results.rows[0].category,
            title: results.rows[0].title,
            post_id: results.rows[0].uuid,
            body: results.rows[0].body,
            date: results.rows[0].date,
          };

          callback(post);
          // const info = results.rows[0];
          // console.log(info);
          // info.username = data.username;
        }
      );
    }
  );
};

const updatePost = (request, response, next) => {
  pool.query(
    'UPDATE posts SET body = $1, title = $2 WHERE uuid = $3;',
    [request.body.paragraph, request.body.title, request.body.postid],
    (error, results) => {
      if (error) {
        throw error;
      }
      // response.writeHead(200, {
      //   'Content-Type': 'text/plain',
      //   'Access-Control-Allow-Origin': '*', // Allow access from other domains
      // });
      // response.write(JSON.stringify(request.body.body));
      // response.end();
    }
  );
};

const deletePost = (socket) => {
  const id = parseInt(request.params.id);

  pool.query('DELETE FROM users WHERE id = $1;', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

const postLike = (data) => {
  pool.query('SELECT id FROM posts WHERE uuid = $1;', [data.post], (err, results) => {
    if (err) {
      throw err;
    }
    if (data.type == 'Like') {
      pool.query(
        'INSERT INTO postlikes (post_id, uuid) VALUES ($1, $2);',
        [results.rows[0].id, data.user],
        (err) => {
          if (err) {
            throw err;
          }
          console.log('Liked Successful');
        }
      );
    } else if (data.type == 'Unlike') {
      pool.query(
        'DELETE FROM postlikes WHERE post_id = $1 AND uuid = $2;',
        [results.rows[0].id, data.user],
        (err) => {
          if (err) {
            throw err;
          }
          console.log('Unliked Successful');
        }
      );
    }
  });
};

const getPostsByUserAndCategory = (category, user, callback) => {
  pool.query(
    'SELECT p.uuid, p.title, p.body, p.created_at as date, u.username FROM posts p left join users u on u.uuid = p.user_id where p.category = $1 and p.user_id = $2 order by p.created_at desc',
    [category, user],
    (err, results) => {
      if (err) {
        throw err;
      }
      for (let post of results.rows) {
        post.date = time(post.date).fromNow();
      }
      callback(results.rows);
    }
  );
};

const getAllPostsByUser = (user, callback) => {
  pool.query(
    'SELECT p.uuid, p.title, p.body, p.created_at as date, u.username FROM posts p left join users u on u.uuid = p.user_id where u.uuid = $1 order by p.created_at desc',
    [user],
    (err, results) => {
      if (err) {
        throw err;
      }
      const posts = results.rows;
      for (let i = 0; i < posts.length; i++) {
        posts[i].date = time(posts[i].date).fromNow();
      }
      callback(posts);
    }
  );
};

module.exports = {
  getPostsAndCategories,
  getAllPosts,
  getPostsByCategory,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  postLike,
  getPostsByUserAndCategory,
  getAllPostsByUser,
};
