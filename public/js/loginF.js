'use strict';

$(document).ready(function() {

var loginForm = $('#loginForm'),
	message = $('.messageAuth');

	loginForm.bind('submit', function(e) {
		var dataAuth = loginForm.serializeArray();
		$.ajax({
			type: "POST",
			url: '/login',
			data: dataAuth,
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