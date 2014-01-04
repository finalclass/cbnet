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
  res.send(500, '500 Internal server error');
});

// ---------------------------
// Socket.IO
// ---------------------------

interface ICoordinates {
  latitude:number;
  longitude:number;
}

class User implements ICoordinates {
  public latitude:number = 0;
  public longitude:number = 0;

  public distanceTo(user:User) {
    return getDistanceFromLatLonInKm(
      this.latitude, this.longitude, 
      user.latitude, user.longitude);
  }
}

function deg2rad(deg:number) : number {
  return deg * (Math.PI/180)
}

function getDistanceFromLatLonInKm (lat1:number,lon1:number,lat2:number,lon2:number) : number {
  var R:number = 6371; // Radius of the earth in km
  var dLat:number = deg2rad(lat2-lat1);  // deg2rad below
  var dLon:number = deg2rad(lon2-lon1); 
  var a:number = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c:number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d:number = R * c; // Distance in km
  return d;
}

io.sockets.on('connection', function (socket) {
  var user:User = new User();
  
  (<any>socket).user = user;
  socket.on('coords', function (coords:ICoordinates) {2
    user.latitude = coords.latitude;
    user.longitude = coords.longitude;
  });
  socket.on('message', function (msg) {
    (<any>io.sockets).clients().forEach(function (client:Socket) {
      var u:User = (<any>client).user;
      if (user.distanceTo(u) < 5) {
        client.emit('message', msg);
      }
    });
  });

});