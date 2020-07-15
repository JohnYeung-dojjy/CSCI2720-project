var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const Schema = mongoose.Schema;
app.use(bodyParser.urlencoded({extended: false}));

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
    user_id: {type: Number, unique: true},
    event_id: {type: Number, unique: true}
});

var CommentSchema = new Schema({
    comment_id: {type:String, unique: true, uuid: true},
    event_id: {type: Number},
    user_id: {type: Number},
    comment_content: {type:String}
});


export const Event = mongoose.Model("Event", EventSchema);
export const User = mongoose.Model("User", UserSchema);
export const Favourite_event =mongoose.Model("Favourite event", Favourite_eventSchema);
export const Comment = mongoose.Model("Comment", CommentSchema);

