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

https.get(url.format("https://ogcef.one.gov.hk/event-api/eventList"), res => {

    // Store the gov data into our db

    var body = [];
    res.on('data', (chunk) => {
            body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        const json = JSON.parse(body);

        Event.remove({}, (err) => {
            if (err) console.log(err);
        });
        
        for (i = 0; i < json.length; i++) {                                                                     
            Event.create({                                   
                event_id: json[i].event_id,
                event_desc: json[i].event_desc,                                                                                         
                event_summary: json[i].event_summary,                                                                                   
                event_location: json[i].event_location,                                                                                 
                event_org: json[i].event_org,                                                                                           
                event_date: json[i].event_date                                                                                  
            }, (err) => {                                                                                                             
                if (err) console.log(err);
            });
        }
    });
});

app.post('', function(req, res) { 
    
    // Creating new events

    Event.findOne({ event_id: { $gt: 0 }}, null)
    .sort({ event_id: -1 })
    .exec(function (err, count) {
        if (err) console.log(err);
        var e = new Event({
            event_id: count + 1,
            event_desc: req.body[''], // marked for changes
            event_summary: req.body[''], //
            event_location: req.body[''], //
            event_org: [''], //
            event_date: [''] //
        });

        e.save(function (err) {
            if (err) console.log(err);
            res.status(201).json(e);
        });
    });

   
});

app.get('/event', function (req, res) { // Retrieve all events
    Event.find({}, function (err, events) {
        res.json(allEvents);
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
        update = { $set: { event_desc: req.body[''] },
        $set: { event_summary: req.body[''] },
        $set: { event_location: req.body[''] },
        $set: { event_org: req.body[''] },
        $set: { event_date: req.body[''] }};

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
        else res.send('Event ' + req.params['eventid'] + 'has been removed.');
    });
});



var server = app.listen(2020);

