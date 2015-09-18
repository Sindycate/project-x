'use strict';

$(document).ready(function() {

var regForm = $('#registrationForm'),
	message = $('#messageRegistr');

	regForm.bind('submit', function(e) {
		var dataReg = regForm.serializeArray();
		$.ajax({
			type: "POST",
			url: '/registration',
			data: dataReg,
			success: function(response) {
				if (response.success) {
					location.pathname = '/' + response.userLogin;
				}
				message.text(response.message);
			},
			dataType: 'json'
		});
		e.preventDefault();
	});

});