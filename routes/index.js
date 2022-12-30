const express = require('express');
const {
  getPostsAndCategories,
  getAllPosts,
  getPostsByCategory,
} = require('../services/Database/UserPostControls');

const feedbackRoute = require('./feedback');
const postRoute = require('./posts');
const contactusRoute = require('./contact');
const publisherRoute = require('./publisher');
const { response } = require('express');

const router = express.Router();

module.exports = (io) => {
  // Main route to the welcome page
  router.get('/', async (request, response, next) => {
    const login = request.session.user ? true : false;
    try {
      getPostsAndCategories((posts, categories) => {
        return response.render('layout', {
          pageTitle: 'Welcome',
          template: 'index',
          posts: posts,
          categories: categories,
          login,
        });
      });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', async (request, response, next) => {
    try {
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      });
      if (request.body.category == 'all') {
        getAllPosts(null, (posts) => {
          response.write(JSON.stringify(posts));
          response.end();
        });
      } else {
        getPostsByCategory(request.body.category, (posts) => {
          response.write(JSON.stringify(posts));
          response.end();
        });
      }
    } catch (error) {
      return next(error);
    }
  });

  io.on('connection', (socket) => {
    socket.on('post', (data) => {
      io.of('/').emit('post', data);
    });
  });

  router.use('/posts', postRoute(io));
  router.use('/feedback', feedbackRoute(io));
  router.use('/contactus', contactusRoute(io));
  router.use('/publisher', publisherRoute(io));

  return router;
};
