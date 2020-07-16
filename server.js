const express = require("express");
var mongoose = require("mongoose");
const https = require('https');
const url = require('url');
//mongoose.connect('');
const bodyParser = require("body-parser");

const app = express();
var bcrypt = require("bcryptjs");
app.use(bodyParser.urlencoded({extended: false}));
//import {Event, User, Favourite_event, Comment} from "./schema.js";
//import Flush_data from "./functions.js";

var EventSchema = new Schema({
    event_id: {type: Number, unique: true},
    //event description
    event_desc: {type: String},
    event_summary: {type: String},
    event_location: {type: String},
    //event organizer
    event_org: {type: String},
    event_date: {type: String}
});

var UserSchema = new Schema({
    user_id: {type: Number, unique: true},
    username: {type: String, unique: true},
    password: {type: String}
});

var Favourite_eventSchema = new Schema({
    user_id: {type: Number},
    event_id: {type: Number}
});

var CommentSchema = new Schema({
    comment_id: {type:String, unique: true, uuid: true},
    event_id: {type: Number},
    user_id: {type: Number},
    comment_content: {type:String}
});

const Event = mongoose.model("Event", EventSchema);
const User = mongoose.model("User", UserSchema);
const Favourite_event =mongoose.model("Favourite event", Favourite_eventSchema);
const Comment = mongoose.model("Comment", CommentSchema);

app.METHOD('', function(req, res) {

    https.get(url.format("https://ogcef.one.gov.hk/event-api/eventList"), res => {
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
});

app.post('/event', function(req, res) { 
    
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

app.route('/:userid/:eventid/comment')
.post(function (req, res) {
    Comment.findOne({ event_id: { $gt: 0 }}, null)
    .sort({ event_id: -1 })
    .exec(function (err, count) {
        if(err) console.log(err);
        if (count == null) max_comment = 0;
        else max_comment = count.comment_id;
        var e = new Comment({
            comment_id: max_comment + 1,
            event_id: req.params['eventid'],
            user_id: req.params['userid'],
            comment_content: req.body['comment']
        });
        e.save((err)=>{
            if(err) console.log(err);
            res.status(201).json(e);
        });
    });
});

app.route('/:userid/favourite')
.post(function (req, res) {
    Favourite_event.findOne({ user_id: { $eq: req.params['userid'] }, event_id: { $eq: req.query['eventid'] }}, null)
    .exec(function (err, fe) {
        if (err) console.log(err);
        if (fe == null) {
            var e = new Favourite_event({
            user_id: req.params['userid'],
            event_id: req.query['eventid']
            });
            e.save((err)=>{
                if(err) console.log(err);
                res.status(201).json(e);
            });
        }
        else res.send("Favaorite is added!");
    });
})
.get(function (req, res) {
    Favourite_event.find({ user_id: { $eq: req.params['userid'] }}, null)
    .exec(function (err, e) {
        if (err) res.send(err);
        else {
            res.send(e);
        }
    });
})
.delete(function (req, res) {
    Favourite_event.findOne({ user_id: { $eq: req.params['userid'] }, event_id: { $eq: req.query['eventid'] }}, null)
    .remove()
    .exec(function (err, e) {
        if (err) res.send(err);
        else res.send("Removed");
    });
});
var server = app.listen(2020);