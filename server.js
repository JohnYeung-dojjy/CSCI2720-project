var mongoose = require("mongoose");
const https = require('https');
const url = require('url');
//mongoose.connect('');
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
var bcrypt = require("bcryptjs");
app.use(bodyParser.urlencoded({extended: false}));
import {Event, User, Favourite_event, Comment} from "./schema.js";
import Flush_data from "./functions.js";

app.post('', function(req, res) { 
    
    // Creating new events

    Event.findOne({ event_id: { $gt: 0 }}, null)
    .sort({ event_id: -1 })
    .exec(function (err, count) {
        if (err) console.log(err);
        var e = new Event({
            event_id: count.event_id + 1,
            event_desc: req.body['desc'], // marked for changes
            event_summary: req.body['summary'], //
            event_location: req.body['location'], //
            event_org: req.body['org'], //
            event_date: req.body['date'] //
        });

        e.save(function (err) {
            if (err) console.log(err);
            res.status(201).json(e);
        });
    });

   
});

app.get('/event', function (req, res) { // Retrieve all events
    Event.find({}, function (err, events) {
        res.json(events);
    });
});

app.route('/event/:eventid')
.get(function (req, res) { // Retrieving single event
    Event.findOne({ event_id: { $eq: req.params['eventid'] }}, null)
    .exec(function (err, e) {
        if (err) res.send(err);
        else res.json(e);
    });
})
.put(function (req, res) { // updating events
    var condition = { event_id : { $eq: req.params['eventid'] }},
        update = { $set: { event_desc: req.body['desc'],
        event_summary: req.body['summary'],
        event_location: req.body['location'],
        event_org: req.body['org'],
        event_date: req.body['date'] }};

    Event.update(condition, update, function(err) {
        if (err) console.log(err);
        else res.send('Event is successfully updated');
    });

})
.delete(function (req, res) { // Deleting events
    Event.findOne({ event_id: { $eq: req.params['eventid'] }}, null)
    .remove()
    .exec(function (err) {
        if (err) res.send(err);
        else res.send('Event ' + req.params['eventid'] + ' has been removed.');
    });
});



var server = app.listen(2020);

