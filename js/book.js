var endsWith = function(str,suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var month = ['Januar', 'Febuar', 'Marts', 'April', 'May', 'Juni', 'Juli', 'August', 'September', 'November', 'December'];
var daynames = ['Sondag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lordag'];

var ider = {
	toDate: function(id) {
		var s = id.split('-');
		return new Date(s[1] + ' ' + s[0] + ' ' + s[2]);	
	}
}
ider.niceDate = function(id) {
	var date = ider.toDate(id);	
	return daynames[date.getDay()] + ' ' + date.getDate() + ' ' + month[date.getMonth()];
};
ider.add = function(id) {
	if(id.split('-')[3] === '0') {
		return id.substring(0,id.length - 1) + '1';
	}
	console.log(ider.toDate(id));
	console.log(addDay(ider.toDate(id),1));
	return dateId(addDay(ider.toDate(id),1)) + '-0';
};

var dateId = function(date) {
return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
};

var addDay = function(date, days) {
	return new Date(date.getTime() + (days || 0)*24*60*60*1000);
};

var getMonday = function(d) {
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

var booking = false;

var days = function(stop) {
	var date = getMonday(new Date());
	var today = new Date();
	var rows = '';

	// rest
	while(true) {
		for (var i = 0; i < 7; i++) {
			if (dateId(date) === dateId(stop)) bail = true;

			var time = '';
			if (date >= today) {
				rows += "<div class='day cirle " +time+"' id='"+dateId(date)+"'><div class='morning half present' id='"+dateId(date)+"-0'></div><div class='afternoon half present' id='"+dateId(date)+"-1'></div><div class='clear'></div><div id='num'>"+ date.getDate() +"</div></div>";
			} else {
				rows += "<div class='day cirle past" +time+"'><div class='morning half'></div><div class='afternoon half'></div><div class='clear'></div><div id='num'>"+ date.getDate() +"</div></div>";
			}

			date = addDay(date, 1);
		}

		rows += "<div class='clear'></div>";

		if (date >= stop) break;
	}
	return rows;	
};

/*var period = {
	enabled: false,
	start: null
};*/

var book = function(id) {
	if (!booking) {
		return;
	}

	var color = $('#' + id).css('background');
	$('#' + id).css({'background':'yellow'});
	
	$.get(window.location.pathname + '/book?date=' + id + '&notes=' + notes, function(data) {
		if (data.taken) {
			$('#' + id).css({'background':color});
			$.modal('Den tid er allerede booket');
			period.enabled = false;
			return;
		}

		$('#' + id).css({'background':'green'});
		$('#' + id).unbind('click');
		$('#' + id).click(function() {
			unbook($('#' + id).attr('id'));
		});		
	}).error(function() {
		$('#' + id).css({'background':'orange'});
		setTimeout(function() {
			$('#' + id).css({'background':color});
		}, 1000);
	})
};

var unbook = function(id) {
	var color = $('#' + id).css('background');
	$('#' + id).css({'background':'yellow'});
	
	$.get(window.location.pathname + '/unbook?date=' + id, function(data) {
		if (endsWith(id,'0')) {
			$('#' + id).css({'background':'#C2C2C2'});
		} else {
			$('#' + id).css({'background':'#9C9C9C'});
		}
		
		$('#' + id).unbind('click');
		$('#' + id).click(function() {
			book($('#' + id).attr('id'));
		});
	}).error(function() {
		$('#' + id).css({'background':'orange'});
		setTimeout(function() {
			$('#' + id).css({'background':color});
		}, 1000);
	})
};

var fetch = function(user) {
	console.log('fetching...');
	$.get('/bookings', function(bookings) {
		$.each(bookings, function(i, booking) {
			$('#' + booking.bookingId).unbind('click');
			console.log(booking);
			if (booking.user.name === user) {
				$('#' + booking.bookingId).css({'background':'green'});	
				$('#' + booking.bookingId).click(function() {
					unbook(booking.bookingId);
				});
			} else {
				$('#' + booking.bookingId).css({'background':'red'});
				$('#' + booking.bookingId).click(function() {
					// todo add super nice sms and email link subject.
					var subject = 'Booking ' + ider.niceDate(booking.bookingId);

					$.modal(booking.user.fullname + ' har booket den tid. <br>Bemaerkninger:<br>' + (booking.notes || '') + '<br><br> Kontakt ham pa:<br>tlf: <a href="tel:'+booking.user.phone+'">'+booking.user.phone+'</a><br>mail: <a href="mailto:'+booking.user.email+'?subject='+subject+'">'+booking.user.email+'</a><br>');
				});
			}
		});
	});
};

$(function() {
	var user = window.location.pathname.match(/\/user\/(\w+)/)[1];

	$('#boat .days').html(days(addDay(new Date(), 60)));

	$('#book').click(function() {
		$.modal('<p>Hvor mange skal i vaere<br>og andre bemaerkninger</p>'
			+'<textarea></textarea>'
			+'<div id="start">Start</div>');
		$('#start').click(function() {
			booking = true;
			notes = $('textarea').val();
			$.modal.close();
		});
	});

	$.each($('.half'), function(i,half) {
		$(half).click(function() {
			book($(half).attr('id'));
		});
	});

	fetch(user);
});

// todo style web - landscape and past days
// add booking logic with timeouts for making reservation
// last one wins so no conflicts, if you manage to make the call you win

// server fetch readings trigger events on click  hover 
// 

// add login - username - password - cookie remember - this might take time since i havent done it before

// start by book/user
