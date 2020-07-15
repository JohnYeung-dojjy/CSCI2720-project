var mongoose = require("mongoose");
//mongoose.connect('');
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
var bcrypt = require("bcryptjs");
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
                res.status(201).json(e);
            });
    });
    // login
    User.findOne({username: req.body.username}, function (err, user){
        if(err) console.log(err);
        if(!user) console.log("user not found");
        else{
            //hash the input password and check it with the stored hashed password 
            if(bcrypt.compareSync(bcrypt.hashSync(req.body.password), user.password)===false)
                // password not correct
                console.log("incorrect password");
            else{
                //correct password
                //logined
                res.cookie();
            }
        }
    })
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

