const express = require('express');
const { loginRequired, register, login } = require('../services/UserController');
const { createUser, user } = require('../services/Database/UserDataControls');
const {
  createPost,
  getPostsByUserAndCategory,
  getAllPostsByUser,
  updatePost,
} = require('../services/Database/UserPostControls');
const { request } = require('express');

const router = express.Router();

module.exports = (io) => {
  router.get('/', async (request, response, next) => {
    const login = request.session.user ? true : false;
    try {
      if (login) {
        return response.redirect('/publisher/author');
      }
      return response.render('layout', {
        pageTitle: 'Publisher',
        template: 'publisher',
        login,
      });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/login', async (request, response, next) => {
    try {
      login(request, response, '/publisher/author');
    } catch (error) {
      return next(error);
    }
  });

  router.post('/register', async (request, response, next) => {
    try {
      createUser(request, response);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/author', loginRequired, user);

  router.post('/author', (request, response) => {
    createPost(request.body, (data) => {
      io.of('/').emit('post', data);

      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*', // Allow access from other domains
      });
      response.write(JSON.stringify(data));
      response.end();
    });
    //
    // response.writeHead(200, {
    //   'Content-Type': 'text/plain',
    //   'Access-Control-Allow-Origin': '*', // Allow access from other domains
    // });
    // response.write(JSON.stringify(request.body));
    // response.end();
  });

  router.post('/author/posts', (request, response, next) => {
    try {
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      });
      if (request.body.category != 'all') {
        getPostsByUserAndCategory(request.body.category, request.body.id, (posts) => {
          response.write(JSON.stringify(posts));
          response.end();
        });
      } else {
        getAllPostsByUser(request.body.id, (posts) => {
          response.write(JSON.stringify(posts));
          response.end();
        });
      }
    } catch (error) {
      return next(error);
    }
  });

  router.post('/author/changes', loginRequired, updatePost);

  router.get('/author/logout', loginRequired, async (request, response, next) => {
    // Destroy user session
    request.session = null;
    response.locals = null;
    response.redirect('/');
  });

  router.get('/recovery', async (request, response, next) => {
    try {
      console.log('hello form info recovery');
      response.redirect('/publisher');
    } catch (error) {
      return next(error);
    }
  });

  // router.post('/post', (request, response, next) => {
  //   try {
  //     createPost(io, request.body, response);
  //   } catch (error) {
  //     return next(error);
  //   }
  // });

  // io.on('connection', (socket) => {
  //   socket.on('post', (data) => {
  //     createPost(data, (id) => {
  //       const post = data;
  //       post.post_id = id;
  //       console.log(post);
  //       io.of('/publisher/author').emit('post', post);
  //     });
  //   });
  // });

  return router;
};
