/*
============================================
; Title: api-security-questions
; Author: Troy Martin
; Date: 01/08/2019
; Modified By: Troy Martin
; Description: Security Questions API
;===========================================
*/
// start program
const express = require('express');
const SecurityQuestion = require('../db-models/security-question')

// declare the express router object
const router = express.Router();

/*
; Params: none
; Response: all security questions
; Description: FindAll - finds all security questions that are not disabled
*/
router.get('/', (request, response) => {

  // Using the find method of the security question model return all questions that are not disabled
  SecurityQuestion.find({ isDisabled: false }, (err, res) => {
    // if there is an error
    if (err) {
      // log the error to the console
      console.log('An error occurred finding the security questions', err);
      // return an http status code 500, server error and the error
      response.status(500).send(err);
    } else {
      // set the status code to 200, OK and return the response
      response.status(200).send(res);
    }
  });
});

/*
; Params: id: security question id
; Response: all security questions
; Description: UpdateSecurityQuestions - updates an existing security question
;   does not update disabled questions or the isDisabled flag
;   to delete a security question use the delete method
*/
router.put('/:id', (request, response) => {
  // Declare the question id and get the value off the url if it exists
  var questionId = request.params && request.params.id ? request.params.id : null;

  // if the questionId was not defined then return a bad request response
  if (!questionId) {
    // set the status code to 400, bad request and send a message
    response.status(400).send('Request has invalid or missing the question id.');
  } else {
    // Using the findOne method of the security question model search for a matching question id
    // could include a filter for isDisabled to ensure they are not updated?
    SecurityQuestion.findOne({ _id: questionId, isDisabled: false }, (err, res) => {
      // if there is an error
      if (err) {
        // log the error to the console
        console.log('An error occurred finding the security question', err);
        // return an http status code 500, server error and the error
        response.status(500).send(err);
      } else {
        // if a matching question is not found res will be null
        if (!res) {
          // set the status code to 404, not found and return a message
          response.status(404).send('Invalid question, not found.');
        } else {
          // ignore isDisabled and use delete to soft delete the question
          res.text = request.body.text;

          // save the question
          res.save(null, (err, doc) => {
            // if there is an error
            if (err) {
              // log the error to the console
              console.log('An error occurred updating security question', err);
              // set the status code to 400, bad request and send the error message
              response.status(400).send(err.message);
            } else {
              // set the status code to 200, OK and return the updated question
              response.status(200).send(doc.toJSON());
            }
          });
        }
      }
    });
  }

});

// export the router
module.exports = router;

// end program