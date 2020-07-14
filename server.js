var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
import {Event, User, Favourite_event, Comment} from "./schema.js";
