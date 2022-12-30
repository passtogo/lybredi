const express = require('express');
const { contact } = require('../services/Database/FeedbackContactControls');

const router = express.Router();

module.exports = () => {
  router.get('/', async (request, response, next) => {
    const login = request.session.user ? true : false;
    try {
      return response.render('layout', { pageTitle: 'Contact Us', template: 'contactus', login });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', async (request, response, next) => {
    try {
      contact(request.body);
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*', // Allow access from other domains
      });
      response.write(
        JSON.stringify('Contact info was sent successfully! Thank You for reaching out.')
      );
      response.end();
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
