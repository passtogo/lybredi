const { response, request } = require('express');
const express = require('express');
const { login } = require('../services/UserController');
const {
  getPosts,
  getPostById,
  getPostsByCategory,
} = require('../services/Database/UserPostControls');
const socket = require('socket.io-client/lib/socket');

const router = express.Router();

module.exports = (io) => {
  router.get('/', async (request, response) => {
    const login = request.session.user ? true : false;
    getPosts((posts, categories) => {
      return response.render('layout', {
        pageTitle: 'Posts',
        template: 'posts',
        posts,
        categories,
        login,
      });
    });
  });

  router.get('/:id', (request, response) => {
    getPostById(request.params.id, (post, categories) => {
      const login = request.session.user ? true : false;
      return response.render('layout', {
        pageTitle: `Post | ${post.title}`,
        template: 'post',
        post,
        categories,
        login,
      });
    });
  });

  router.post('/:id/login', (request, response) => {
    login(request, response, `/posts/${request.params.id}`);
  });

  router.get('/category/:category', getPostsByCategory);

  io.on('connection', (socket) => {
    socket.on('post', (data) => {
      io.of('/posts').emit('post', data);
    });
  });

  return router;
};
