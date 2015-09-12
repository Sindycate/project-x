'use strict';
// функция запускается, когда страница готова

$(document).ready(function() {

	var mainSettings = $('#mainSettings'),
		personalSettings = $('#personalSettings'),
		additionalSettings = $('#additionalSettings');

	mainSettings.click(function() {
		var settingsContent = $(this).children('.settings-content');

		if (settingsContent.css('display') == 'none') {
			settingsContent.show();
		} else {
			settingsContent.hide();
		}
	});

	personalSettings.click(function() {
		var settingsContent = $(this).children('.settings-content');

		if (settingsContent.css('display') == 'none') {
			settingsContent.show();
		} else {
			settingsContent.hide();
		}
	});

	additionalSettings.click(function() {
		var settingsContent = $(this).children('.settings-content');

		if (settingsContent.css('display') == 'none') {
			settingsContent.show();
		} else {
			settingsContent.hide();
		}
	});

});