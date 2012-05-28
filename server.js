var server = require('router').create();
var buffoon = require('buffoon');
var _ = require('underscore');
var aejs = require('async-ejs');
var common = require('common');
var file = require('./lib/file').file;
var db = require('mongojs').connect('mongodb://root:root@staff.mongohq.com:10084/vedbaek-booking',['booking']);

// add more than one resource to book. mark months in html. When hovering over a taken spot see all other spots be that person highlighted.

var port = process.argv[2] || 8080;
var users = {
	ian : {
		name: 'ian',
		fullname: 'Ian Jorgensen',
		email: 'jorgensen.ian@gmail.com',
		phone: '004542834101'
	},
	mads: {
		name: 'mads',
		fullname: 'Mads Ring',
		email: 'd7519@yahoo.dk',
		phone: '004526244067'
	},
	henning : {
		name: 'henning',
		fullname: 'Henning Bundgaard',
		email: 'henningbundgaard@dadlnet.dk',
		phone: '26112290'
	},
	claus : {
		name: 'claus',
		fullname: 'Claus Jul Andersen',
		email: 'clausjulandersen@hotmail.com',
		phone: '26393763'
	},
	iben : {
		name: 'iben',
		fullname: 'Iben Nordmark Støckler',
		email: 'ibenns000@hotmail.com',
		phone: '31370777'
	},
	anders : {
		name: 'anders',
		fullname: 'Anders Jørgensen',
		email: 'andjor81@gmail.com',
		phone: '29720065'
	},
	jesper : {
		name: 'jesper',
		fullname: 'Jesper Schmidt',
		email: 'Jesper_schmidt@hotmail.com',
		phone: '49112705'
	},
	jens : {
		name: 'jens',
		fullname: 'Jens Holm',
		email: 'Jholm@frederikssund.dk',
		phone: '24693712'
	}
};

var respond = function(response, data, status) {
	response.writeHead(status || 200, {'content-type':'application/json'});
	response.end(JSON.stringify(data, null, '\t'));			
};

server.get('/user/{user}', function(request, response) {
	if(users[request.params.user]) {
		file('./html/book.html')(request, response)
	} else {
		response.end('Den bruger findes ikke');
	}
});

server.get('', file('./html/book.html'));

server.get('/bookings', function(request, response) {
	db.booking.find(function(err, data) {
		if(err) {
			respond(response,{err:err.message},500);
			return;
		}
		respond(response, data);
	});
});
server.get('/users', function(request, response) {
	respond(response, users);
});
server.get('/user/{user}/book', function(request, response) {
	if (!request.query.date) {
		respond(response, {err:'no date'}, 500);
	}
	db.booking.findOne({bookingId: request.query.date}, common.fork(function(err) {
		respond(response, {err:'no date'}, 500);
	}, function(booking) {
		if (booking) {
			respond(response, {taken:1}, 200);
			return;
		}
		db.booking.save({bookingId: request.query.date, notes: request.query.notes,user: users[request.params.user]}, common.fork(function(err) {
			respond(response, {err:'no date'}, 500);
		}, function(data) {
			respond(response, {}, 200);
		}));
	}));
});
server.get('/user/{user}/unbook', function(request, response) {
	if (!request.query.date) {
		respond(response, {err:'no date'}, 500);
	}

	db.booking.remove({bookingId: request.query.date}, common.fork(function(err) {
		respond(response, {err:'no date'}, 500);
	}, function(data) {
		respond(response, {}, 200);
	}));
});
server.get('/remove', function(request, response) {
	db.booking.remove(function(err) {
		respond(response, {}, err ? 500: 200);
	});
});
server.get('/js/*', file('./js/{*}'));
server.get('/css/*', file('./css/{*}'));
server.all('*', function(request, response) {
	response.writeHead(404);
	response.end('404');
});

server.listen(port);

console.log('server running on port',port);

process.on('uncaughtException', function(err) { console.log(err.stack) });