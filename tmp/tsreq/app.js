/// <reference path="server.d.ts" />
var express = require('express');
var http = require('http');
var socketIO = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketIO.listen(server);


server.listen(process.env.CBNET_PORT || 8787);

// ---------------------------
// Express.JS
// ---------------------------
app.use(express.static(__dirname + '/../client'));
app.use(app.router);
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Something broke!');
});

// ---------------------------
// Socket.IO
// ---------------------------
io.sockets.on('connection', function (socket) {
    socket.on('message', function (msg) {
        io.sockets.emit('message', msg);
    });
});
module.exports = app;
