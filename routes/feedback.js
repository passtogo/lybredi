const express = require('express');
const { feedback } = require('../services/Database/FeedbackContactControls');

const { check, validationResult } = require('express-validator');

const router = express.Router();

//create const validators here for form submittion usage
const validators = [];

module.exports = (params) => {
  //create feedbackservice constant using params

  router.get('/', async (request, response, next) => {
    const login = request.session.user ? true : false;
    try {
      //create feedback constant usind await to get the feedback list

      //create errors constant using request.session.feedback with shorthand ifelse statement
      //this is used for handling input errors on a form

      //create successmessage const using the method above
      //this is use for handling messages related to success submittion of a form

      //request.sessiom.feedback = {};

      return response.render('layout', { pageTitle: 'Feedback', template: 'feedback', login });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', async (request, response, next) => {
    try {
      feedback(request.body);
      response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*', // Allow access from other domains
      });
      response.write(
        JSON.stringify('Feedback was sent successfully! Thank You for your feedback.')
      );
      response.end();
    } catch (err) {
      return next(err);
    }
  });

  /*
router.post('/', validations, async (request, response, next) => {
    try {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.session.feedback = {
          errors: errors.array(),
        };
        return response.redirect('/contact');
      }

      const { name, email, title, message } = request.body;
      await feedbackService.addEntry(name, email, title, message);
      request.session.feedback = {
        message: 'Thank you for contacting us. We will get to you as soon as possible.',
      };
      return response.redirect('/contact');
    } catch (err) {
      return next(err);
    }
  });

router.post('/api', validations, async (request, response, next) => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response.json({ errors: errors.array() });
      }
      const { name, email, title, message } = request.body;
      await feedbackService.addEntry(name, email, title, message);
      const feedback = await feedbackService.getList();
      return response.json({ feedback });
    } catch (err) {
      return next(err);
    }
  });

*/

  return router;
};
