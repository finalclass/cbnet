/// <reference path="server.d.ts" />

import express = require('express');
import http = require('http');
import socketIO = require('socket.io');

var app:express.Application = express();
var server = http.createServer(<any>app);
var io = socketIO.listen(server);

export = app;

server.listen(process.env.CBNET_PORT || 8787);

// ---------------------------
// Express.JS
// ---------------------------

app.use(express.static(__dirname + '/../client'));
app.use(app.router);
app.use(function (err:any, req:express.Request, res:express.Response, next:Function) {
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

