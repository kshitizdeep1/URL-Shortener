"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var AutoIncrement = require("mongoose-sequence")(mongoose);
var dns = require("dns");
var bodyParser = require("body-parser");
var cors = require("cors");
var btoa = require("btoa");
var atob = require("atob");
var app = express();
mongoose.connect(process.env.MONGO_URI);
// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

// mongoose.connect(process.env.DB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//shorten url
var Schema = mongoose.Schema;
const urlList = new Schema({
  url: [String]
});
urlList.plugin(AutoIncrement, { inc_field: "id" });
const UrlList = mongoose.model("UrlList", urlList);

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl/new/", (req, res) => {
  let inputVal = req.body.url;
  let add = inputVal.split("/");
  dns.lookup(add[2], err => {
    if (err === null) {
      UrlList.findOne({ url: inputVal }, (err, u) => {
        if (err) console.log(err);
        if (u) {
          res.json({
            url: inputVal,
            hash: btoa(u.id)
          });
        } else {
          var newemail = new UrlList({ url: inputVal });
          newemail.save((err, p) => {
            if (err) console.log(err);
            res.json({
              url: inputVal,
              hash: btoa(p.id)
            });
          });
        }
      });
    } else {
      res.json({ error: "invalid URL" });
    }
  });
});

app.get("/:hash", function(req, res) {
  var baseid = req.params.hash;
  var id = atob(baseid);
  UrlList.findOne({ id: id }, function(err, doc) {
    if (doc) {
      res.redirect(doc.url);
    } else {
      res.redirect("/");
    }
  });
});
// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
