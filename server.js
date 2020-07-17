var serverURL = 'mongodb://thcheun8:x38541@localhost/thcheun8';
const express = require("express");
var mongoose = require("mongoose");
const https = require('https');
const url = require('url');
const bodyParser = require("body-parser");
const app = express();
var bcrypt = require("bcryptjs");

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});
//import {Event, User, Favourite_event, Comment} from "./schema.js";
//import Flush_data from "./functions.js";

mongoose.Promise = global.Promise;
mongoose.connect(serverURL);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open', function () {
    console.log("Connection is open...");
});

var EventSchema = mongoose.Schema({
    event_id: { type: Number, unique: true },
    //event description
    event_desc: { type: String },
    event_summary: { type: String },
    event_location: { type: String },
    //event organizer
    event_org: { type: String },
    event_date: { type: String }
});

var UserSchema = mongoose.Schema({
    user_id: { type: Number, unique: true },
    username: { type: String, unique: true },
    password: { type: String }
});

var Favourite_eventSchema = mongoose.Schema({
    user_id: { type: Number },
    // event_id: {type: Number},
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    }
});

var CommentSchema = mongoose.Schema({
    comment_id: { type: Number, unique: true },
    event_id: { type: Number },
    // user_id: { type: Number },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    comment_content: { type: String },
    comment_date: { type: Date, default: Date.now }
});

const Event = mongoose.model("Event", EventSchema);
const User = mongoose.model("User", UserSchema);
const Favourite_event = mongoose.model("FavouritEvent", Favourite_eventSchema);
const Comment = mongoose.model("Comment", CommentSchema);

app.get('/flush', function (req, res) {
    var data = {}

    https.get(url.format("https://ogcef.one.gov.hk/event-api/eventList"), res => {
        var body = [];
        res.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            const json = JSON.parse(body);
            data = json;
            Event.remove({}, (err) => {
                if (err) console.log(err);
            });
            Comment.remove({}, (err) => {
                if (err) console.log(err);
            });
            Favourite_event.remove({}, (err) => {
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
    return res.send()
});

app.post('/event', function (req, res) {

    // Creating new events

    Event.findOne({ event_id: { $gt: 0 } }, null)
        .sort({ event_id: -1 })
        .exec(function (err, count) {
            if (err) {
                console.log(err);
                res.status(500).json({ error: err })
            }
            var e = new Event({
                event_id: count.event_id + 1,
                event_desc: req.body['desc'], // marked for changes
                event_summary: req.body['summary'], //
                event_location: req.body['location'], //
                event_org: req.body['org'], //
                event_date: req.body['date'] //
            });

            e.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: err })
                }
                return res.status(201).json(e);
            });
        });


});

app.get('/event', function (req, res) { // Retrieve all events
    Event.find({}, function (err, events) {
        if (err) {
            return res.status(500).json({ error: err })
        }
        if (!events || !events.length) {
            return res.json([])
        }
        res.json(events);
    });
});

app.route('/event/:eventid')
    .get(function (req, res) { // Retrieving single event
        Event.findOne({ event_id: { $eq: req.params['eventid'] } }, null)
            .exec(function (err, e) {
                if (err) {
                    return res.status(500).json({ error: err })
                }
                console.log(e)
                if (!e) {
                    return res.json({})
                }
                else res.json(e);
            });
    })
    .put(function (req, res) { // updating events
        var condition = { event_id: { $eq: req.params['eventid'] } },
            update = {
                $set: {
                    event_desc: req.body['desc'],
                    event_summary: req.body['summary'],
                    event_location: req.body['location'],
                    event_org: req.body['org'],
                    event_date: req.body['date']
                }
            };

        Event.update(condition, update, function (err) {
            if (err) {
                return res.status(500).json({ error: err })
            }
            else res.status(202).json({ message: 'Event is successfully updated' });
        });
    })
    .delete(function (req, res) { // Deleting events
        Event.findOne({ event_id: { $eq: req.params['eventid'] } }, null)
            .remove()
            .exec(function (err) {
                if (err) {
                    return res.status(500).json({ error: err })
                }
                else res.status(202).send('Event ' + req.params['eventid'] + ' has been removed.');
            });
    });

app.route('/comment/:eventid/:userid/')
    .post(async function (req, res) {
        var user = await User.findOne({ user_id: req.params.userid })
        Comment.findOne({ comment_id: { $gt: 0 } }, null)
            .sort({ comment_id: -1 })
            .exec(function (err, count) {
                if (err) return res.status(500).json({ error: err });
                if (count == null) max_comment = 0;
                else max_comment = count.comment_id;

                var e = new Comment({
                    comment_id: +max_comment + 1,
                    event_id: req.params['eventid'],
                    // user_id: req.params['userid'],
                    user: user._id,
                    comment_content: req.body['comment']
                });
                e.save((err) => {
                    if (err) {
                        return res.status(500).json({ error: err })
                    }
                    res.status(201).json(e);
                });
            });
    });

app.get('/comment/:eventid', async (req, res) => {
    await Comment.find({ event_id: req.params.eventid })
        .populate('user')
        .exec((err, e) => {
            if (err) {
                return res.status(404).json({ message: err })
            }
            if (!e || !e.length) {
                return res.json([])
            }
            console.log(e)
            return res.json(e)
        })
})

app.route('/favourite/:userid')
    .post(async function (req, res) {
        var event = await Event.findOne({ event_id: req.query['eventid'] });
        Favourite_event.findOne({ user_id: { $eq: req.params['userid'] }, event_id: { $eq: req.query['eventid'] } }, null)
            .exec(function (err, fe) {
                if (err) {
                    return res.status(500).json({ error: err })
                }
                if (fe == null) {
                    var e = new Favourite_event({
                        user_id: req.params['userid'],
                        // event_id: req.query['eventid']
                        event: event._id
                    });
                    e.save((err) => {
                        if (err) {
                            return res.status(500).json({ error: err })
                        }
                        res.status(201).json(e);
                    });
                }
                else res.json({ message: "Favaorite is added!" });
            });
    })
    .get(function (req, res) {
        Favourite_event.find({ user_id: { $eq: req.params['userid'] } }, null)
            .populate('event')
            .exec(function (err, e) {
                if (err) {
                    return res.status(500).json({ error: err })
                }
                else {
                    if (!e || !e.length) {
                        return res.json([])
                    }
                    res.send(e);
                }
            });
    })
    .delete(async function (req, res) {
        var event = await Event.findOne({ event_id: req.query['eventid'] });
        Favourite_event.findOne({ user_id: { $eq: req.params['userid'] }, event: { $eq: event._id } }, null)
            .remove()
            .exec(function (err, e) {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                else res.status(202).json({ message: "Removed" });
            });
    });

app.post('/register', (req, res) => {
    // var user = await User.findOne({ user_id: req.params.userid })
    User.findOne({ user_id: { $gt: 0 } }, null)
        .sort({ user_id: -1 })
        .exec(function (err, count) {
            if (err) {
                console.log(err);
                res.status(500).json({ error: err })
            }
            console.log(req.body.password)
            var hash = bcrypt.hashSync(req.body.password, 10);
            var e = new User({
                user_id: count.user_id + 1,
                username: req.body['username'],
                password: hash
            });
            e.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: err })
                }
                return res.status(201).json(e);
            });
        });
})

app.post('/login', (req, res) => {
    // login
    User.findOne({ username: req.body['username'] })
        .exec((err, user) => {
        if (err) {
            res.status(401).send();
        }
        else {
            //hash the input password and check it with the stored hashed password
            console.log(req.body.password)
            var hash = bcrypt.hashSync(req.body.password, 10);
            console.log(hash);
            if (!bcrypt.compareSync(req.body.password, user.password))
                // password not correct
                res.status(401).send()
            else {
                //correct password
                //logined
                console.log(user)
                res.json({login: true, username: user.username, user_id: user.user_id})
            }
        }
    });
});

var server = app.listen(2020);