var mongoose = require("mongoose");
//mongoose.connect('');
const https = require('https');
const url = require('url');
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
var bcrypt = require("bcryptjs");
app.use(bodyParser.urlencoded({extended: false}));
import {Event, User, Favourite_event, Comment} from "./schema.js";

//user
export function login(username, password)
{
    // login
    User.findOne({username: username}, function (err, user){
        if(err) console.log(err);
        if(!user) alert("user not found");
        else{
            //hash the input password and check it with the stored hashed password 
            if(bcrypt.compareSync(bcrypt.hashSync(password), user.password)===false)
                // password not correct
                alert("incorrect password");
            else{
                //correct password
                //logined
                return res.cookie();
            }
        }
    });
}

export function logout()
{

}

export function Flush_data()
{
    https.get(url.format("https://ogcef.one.gov.hk/event-api/eventList"), res => {
        var body = [];
        res.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            const json = JSON.parse(body);
            //clear the database
            Event.remove({}, (err) => {
                if (err) console.log(err);
            });
            //replace the database with the default gov database
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
}

//Favourite events
export function add_favourite(user_id, event_id)
{
    var e = new Favourite_event({
        user_id: user_id,
        event_id: event_id
    });
    e.save((err)=>{
        if(err) console.log(err);
        res.status(201).json(e);
    });
    console.log("favourite event added");
} 

export function remove_favourite(user_id, event_id)
{
    Favourite_event.findOneAndRemove({user_id: user_id, event_id: event_id}, (err, e)=>{
        if(err) console.log(err);
        if(!e) 
        {
            console.log("favourite event not exist");
            return;
        }
        console.log("removed favourite successfully");
    });
}

//Event
export function get_all_Events()
{
    Event.find().exec((err, e)=>{
        if(err) console.log(err);
        //e is an array of events
        return res.json(e);
    });
}

export function get_event(id)
{
    Event.findOne({eventid: id}).exec((err, e)=>{
        if(err) console.log(err);
        if(!e) 
        {
            console.log("event does not exist");
            return;
        }
        return res.json(e);
    });
}

export function add_new_event(desc, summary, location, organizer, date)
{
    //find max id
    Event.find().sort({event_id: -1}).limit(1).exec((err, max_event)=>{
        if(err) console.log(err);
        var e = new Event({
            event_id: max_event[0].event_id + 1,
            event_desc: desc,
            event_summary: summary,
            event_location: location,
            event_org: organizer,
            event_date: date
        });

        e.save(function (err) {
            if (err) console.log(err);
            res.status(201).json(e);
        });
    });
}

export function edit_event(id, edit_dist, content)
{
    //edit_dist is a string represending the name of element that you would like to change
    //content is the desired updated content of that element
    if(edit_dist==="event_desc")
    {
        Event.findOneAndUpdate({event_id: id}, {event_desc: content}).exec((err, e)=>{
        if(err) console.log(err);
        if(!e)
        {
            console.log("event does not exist");
            return;
        }

        });
    }
    else if(edit_dist==="event_summary")
    {
        Event.findOneAndUpdate({event_id: id}, {event_summary: content}).exec((err, e)=>{
        if(err) console.log(err);
        if(!e)
        {
            console.log("event does not exist");
            return;
        }

        });
    }
    else if(edit_dist==="event_location")
    {
        Event.findOneAndUpdate({event_id: id}, {event_location: content}).exec((err, e)=>{
        if(err) console.log(err);
        if(!e)
        {
            console.log("event does not exist");
            return;
        }

        });
    }
    else if(edit_dist==="event_organizer")
    {
        Event.findOneAndUpdate({event_id: id}, {event_organizer: content}).exec((err, e)=>{
        if(err) console.log(err);
        if(!e)
        {
            console.log("event does not exist");
            return;
        }

        });
    }
    else if(edit_dist==="event_date")
    {
        Event.findOneAndUpdate({event_id: id}, {event_date: content}).exec((err, e)=>{
        if(err) console.log(err);
        if(!e)
        {
            console.log("event does not exist");
            return;
        }

        });
    }
}

export function delete_event(id)
{
    Event.findOneAndRemove({event_id: id}).exec((err, e)=>{
        if(err) console.log(err);
        if(!e)
        {
            console.log("Event does not exist");
            return;
        }
    });
}

//Comment
export function add_New_Comment(user_id, event_id, new_comment)
{
    //find max Comment id
    Comment.find().sort({event_id: -1}).limit(1).exec((err, max_comment)=>{
        if(err) console.log(err);
        var e = new Comment({
            comment_id: max_comment[0].comment_id + 1,
            event_id: event_id,
            user_id: user_id,
            comment_content: new_comment
        });
    
        e.save((err)=>{
            if(err) console.log(err);
            res.status(201).json(e);
        });
    });

}

export function edit_Comment(comment_id, content)
{
    comment_id.findOneAndUpdate({comment_id: comment_id}, {comment_content: content}, (err, e)=>{
        if(err) console.log(err);
        if(!e)
        {
            console.log("Comment does not exist");
            return;
        }
    });
}