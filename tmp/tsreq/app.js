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
    res.send(500, '500 Internal server error');
});


var User = (function () {
    function User() {
        this.latitude = 0;
        this.longitude = 0;
    }
    User.prototype.distanceTo = function (user) {
        return getDistanceFromLatLonInKm(this.latitude, this.longitude, user.latitude, user.longitude);
    };
    return User;
})();

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

io.sockets.on('connection', function (socket) {
    var user = new User();

    socket.user = user;

    socket.on('coords', function (coords) {
        2;
        user.latitude = coords.latitude;
        user.longitude = coords.longitude;
        console.log('setting coords', coords);
    });
    socket.on('message', function (msg) {
        io.sockets.clients().forEach(function (client) {
            var u = client.user;
            console.log('user', u);
            console.log('Distance:', user.distanceTo(u));
            if (user.distanceTo(u) < 5) {
                client.emit('message', msg);
            }
        });
    });
});
module.exports = app;
