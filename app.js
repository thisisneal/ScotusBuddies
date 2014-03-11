'use strict';
var express = require('express');
var app = express();
var core = require(__dirname + '/setup.js');
var PORT = 3000;

var oneDay = 86400000;

core.setup(function (db_obj) {
  //console.log(db_obj);
  console.log('Starting webserver.');
  // Express serves html/css/js and json db, caching and compression on
  app.use(express.compress());
  app.use(express.static(__dirname + '/public', { maxAge: oneDay }));
  app.listen(PORT);
});
