/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
let mongodb = require('mongodb')
let mongoose = require('mongoose')

const pw = process.env.PW || '%23FssUcdd7Z!cjbT';

let uri = 'mongodb+srv://Panashe3000:' + pw + '@cluster0.mm7xd4f.mongodb.net/issue_tracker?retryWrites=true&w=majority'

module.exports = function (app) {

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  let issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, required: true },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    project: String
  })

  let Issue = mongoose.model('Issue', issueSchema)

  app.route('/api/issues/:project')

    .get(function (req, res) {
      var project = req.params.project;
      let filterObject = Object.assign(req.query)

      filterObject['project'] = project
      Issue.find(
        filterObject,
        (error, arrayOfResults) => {
          if (!error && arrayOfResults) {
            return res.json(arrayOfResults)
          }
        }
      )
    })

    .post(function (req, res) {
      var project = req.params.project;
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({ error: 'required field(s) missing' })
      }

      let date = new Date();

      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        open: true,
        created_on: date.setHours(date.getHours() + 1),
        updated_on: date.toISOString(),
        project: project
      })
      newIssue.save((error, savedIssue) => {
        if (!error && savedIssue) {
          return res.json(savedIssue)
        }
      })

    })

    .put(function (req, res) {
      var project = req.params.project;
      let updateObject = {}
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] != '') {
          updateObject[key] = req.body[key]
        }
      })
      if (!req.body._id) {
        return res.json({ error: 'missing _id' })
      }
      if (Object.keys(updateObject).length < 2) {
        return res.json({ error: 'no update field(s) sent', _id: req.body._id })
      }
      let updatedDate = new Date();
      updateObject['updated_on'] = updatedDate.setHours(updatedDate.getHours() + 1);
      Issue.findByIdAndUpdate(
        req.body._id,
        updateObject,
        { new: true },
        (error, updatedIssue) => {
          if (!error && updatedIssue) {
            return res.json({ result: 'successfully updated', _id: req.body._id })
          } else if (!updatedIssue) {
            return res.json({ error: 'could not update', _id: req.body._id })
          }
        }
      )
    })

    .delete(function (req, res) {
      var project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: 'missing _id' })
      }
      Issue.findByIdAndRemove(req.body._id, (error, deletedIssue) => {
        if (!error && deletedIssue) {
          res.json({ result: 'successfully deleted', _id: req.body._id })
        } else if (!deletedIssue) {
          res.json({ error: 'could not delete', _id: req.body._id })
        }
      })
    });

};