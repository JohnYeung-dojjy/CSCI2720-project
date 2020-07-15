var mongoose = require("mongoose");
//mongoose.connect('');
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
import {Event, User, Favourite_event, Comment} from "./schema.js";

app.post('', function(req, res) { // Creating new events

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
                res.status(201).send("Event Cretaed!");
            });
    });
});

app.get('', function(req, res) { // Retrieving events

    
});

app.put('', function(req, res) { // updating events

});

app.delete('', function(req, res) { // Deleting events

});

