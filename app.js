#!/usr/bin/env node

var express = require('express');

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// needs to be dynamically updated when we check ftp
var mirror_list = [

	{
		name: "4.8",
		url: "ftp://ftp.openbsd.org/pub/OpenBSD/4.8"
	},

	{
		name: "4.9",
		url: "ftp://ftp.openbsd.org/pub/OpenBSD/4.9"
	},

	{
		name: "snapshots",
		url: "ftp://ftp.openbsd.org/pub/OpenBSD/snapshots"
	},
];

var curr_mirr = [
	{ 
		id: 1,
		version: "4.9",
		url: "http://ftp.openbsd.org/pub/OpenBSD/4.9",
		last_update: "2010-01-01",
		next_check: "2011-01-01",
		active: false,
	},
	{ 
		id: 2,
		version: "snapshots",
		url: "http://ftp.openbsd.org/pub/OpenBSD/snapshots",
		last_update: "2010-01-01",
		next_check: "2011-01-01",
		active: true,
	}
];

app.get('/', function(req, res){
	res.render('index', {
		title: 'Mirr',
		subtit: 'The OpenBSD Auto-Mirrorer',
		mirrors: mirror_list,
		curr_mirr: curr_mirr
	});
});

app.listen(3000);
