/// <reference path="./typings/tsd.d.ts" />
"use strict";
var path = require('path');
var express = require('express');
var connect = require('connect');
var http = require('http');
var config = require('config');
var SlambySdk = require('slamby-sdk');
var Guid = require('guid');
var bodyParser = require('body-parser');
var MailListener = require("mail-listener2");
var isDeveloping = process.env.NODE_ENV !== 'production';
var port = isDeveloping ? 3000 : 3000;
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(port);
io.sockets.on('connection', function (socket) {
    console.log("browser joined");
});
console.log("Connect to the email address...");
var mailListener = new MailListener({
    username: "groupama@slamby.com",
    password: "<password>",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    connTimeout: 10000,
    authTimeout: 5000,
    //debug: console.log, // Or your custom function with only one incoming argument. Default: null
    //mailbox: "INBOX", // mailbox to monitor
    searchFilter: ["UNSEEN"],
    tlsOptions: { rejectUnauthorized: false },
    markSeen: true,
    fetchUnreadOnStart: true,
    mailParserOptions: { streamAttachments: true },
    attachments: true,
    attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});
mailListener.on("server:connected", function () {
    console.log("Connection established!");
});
mailListener.on("server:disconnected", function () {
    console.log("Connection interrupted!");
});
mailListener.on("error", function (err) {
    console.error(err);
});
mailListener.on("mail", function (mail, seqno, attributes) {
    // do something with mail object including attachments
    var mailFrom = mail.from;
    var mailSubject = mail.subject;
    var mailBody = mail.text;
    var objToSend = {
        from: mailFrom,
        subject: mailSubject,
        body: mailBody,
        tags: []
    };
    getCategories(mailBody).then(function (data) {
        data.forEach(function (item) {
            //console.log(item.TagId + " " + item.Score + " " + item.Tag.Name);
            objToSend.tags.push({ "id": item.TagId, "score": item.Score, "name": item.Tag.Name });
        });
        io.emit('notification', objToSend);
    });
});
mailListener.start(); // start listening
function getCategories(textToAnalyse) {
    var client = new SlambySdk.ApiClient();
    client.basePath = "https://europe.slamby.com/profession/";
    client.defaultHeaders = {
        "Authorization": "Slamby <secret>"
    };
    var apiInstance = new SlambySdk.ClassifierServiceApi(client);
    var id = "category_position"; // String | 
    var opts = {
        'request': new SlambySdk.ClassifierRecommendationRequest() // ClassifierRecommendationRequest | 
    };
    opts.request.text = textToAnalyse;
    opts.request.count = 3;
    opts.request.useEmphasizing = false;
    opts.request.needTagInResult = true;
    return apiInstance.classifierRecommendService(id, opts);
}
console.log("Server URL is: http://localhost:8080");
//gzip enabled
app.use(connect.compress());
//Body Parsing.
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//Cache enabled
app.set('view cache', true);
//Static folders
app.use('/build', express.static(__dirname + '/build'));
app.use('/app', express.static(__dirname + '/app'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
