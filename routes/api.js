/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose')

const CONNECTION_STRING = process.env.DB || 'mongodb://issue-user:issue123456@ds229108.mlab.com:29108/project-issuetracker'; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err) => {
    if (err) return console.log('Connect mongo fail')
    console.log('Connect mongo success')
})

const thingSchema = new mongoose.Schema({}, { strict: false });
const Issue = mongoose.model('Issue', thingSchema);


module.exports = function (app) {

    app.route('/api/issues/:project')

        .get(function (req, res) {
            let { query = {} } = req;
            if (!query.open) query.open = false

            Issue.find(query)
                .lean()
                .exec()
                .then(data => res.json(data))
        })

        .post(function (req, res) {
            let {
                issue_title,
                issue_text,
                created_by,
                assigned_to = '',
                status_text = '',
            } = req.body

            if (!issue_title || !issue_text || !created_by)
                return res.json({ error: 'invalid input' });

            let issue = new Issue({
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text,
                created_on: new Date(),
                updated_on: new Date(),
                open: true,
            })

            issue.save().then(data => res.json(data))
        })

        .put(function (req, res) {
            const { _id } = req.body;
            const update = { $set: {} };
            const noFieldSent = true;
            const keys = Object.keys(req.body).filter(key => key !== '_id');
            keys.forEach((key) => {
                if (req.body[key] !== '') {
                    update.$set[key] = req.body[key];
                    noFieldSent = false;
                }
            })

            if (!req.body.open) {
                update.$set.open = false;
                noFieldSent = false;
            }

            if (noFieldSent) return res.send('no updated field sent');

            update.$set.updated_on = new Date();
            Issue.findOneAndUpdate({ _id }, update)
                .then(doc => res.json({ status: 'success' }))

        })

        .delete(function (req, res) {
            if (!req.body.open) req.body.open = false;
            const { _id } = req.body;
            Issue.findOneAndDelete({ _id })
                .then(() => res.json({ status: 'succes' }))
        });

};
