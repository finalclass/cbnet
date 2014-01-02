/// <reference path="server.d.ts" />

import express = require('express');

var app:express.Application = express();

app.use(express.static(__dirname + '/../client'));
app.use(app.router);
app.use(function (err:any, req:express.Request, res:express.Response, next:Function) {
  console.error(err.stack);
  res.send(500, 'Something broke!');
});

export = app;