'use strict';
// функция запускается, когда страница готова

$(document).ready(function() {

	var mainSettings = $('#mainSettings'),
		personalSettings = $('#personalSettings'),
		additionalSettings = $('#additionalSettings'),
		loginSettings = $('#loginSettings'),
		emailSettings = $('#emailSettings'),
		oldPassword = $('#oldPassword'),
		newPassword = $('#newPassword'),
		btnMainSet = $('.btnMainSet'),
		btnPersonalSet = $('.btnPersonalSet'),
		newPersonalMessage = $('.newPersonalMessage'),
		newMainMessage = $('.newMainMessage'),
		disabledInputs = $('.disabledInputs'),
		profilePage = $('.profile-page'),
		nameSettings = $('#nameSettings'),
		lastNameSettings = $('#lastNameSettings'),
		aboutSettings = $('#aboutSettings');

	var keysAccess = {login: true, email: true, newPassword: true, oldPassword: false};
	var blockMessages = {
		mainSet: {
			defaultMessage: function () {
				newMainMessage.text('Будьте внимательны при изменении основных данных');
			},
			showNewMessage: function(message) {
				newMainMessage.text(message);
			}
		},
		personalSet: {
			defaultMessage: function () {
				newPersonalMessage.text('Данная ифнормация будет отображаться в профиле пользователя');
			},
			showNewMessage: function(message) {
				newPersonalMessage.text(message);
			}
		}
	}
	var personalInfo = {name: nameSettings.val(), lastName: lastNameSettings.val(), about: aboutSettings.val()};
	var personalInfoUpdate = {name: '', lastName: '', about: ''};

	loginSettings.change(function() {
		if (keysAccess.oldPassword) {
			if (loginSettings.val() == '' && keysAccess.email && keysAccess.newPassword) {
				blockMessages.mainSet.defaultMessage();
				btnMainSet.removeClass('disabled');
			} else if (loginSettings.val() == '') {
				blockMessages.mainSet.defaultMessage();
				keysAccess.login = true;
			} else if (!(/^[\-\_a-zA-Z0-9]{4,20}$/.test(loginSettings.val()))) {
				blockMessages.mainSet.showNewMessage('Логин должен содержать от 4 до 20 символов, разрешены только следующие специальные символы: (-,_)');
				keysAccess.login = false;
				btnMainSet.addClass('disabled');
			} else {
				var parameters = {type: 'login', value: loginSettings.val()};

				checkForDuplicate(parameters, function(result) {
					if (result) {
						blockMessages.mainSet.showNewMessage('Логин свободен');
						keysAccess.login = true;
						if (keysAccess.email && keysAccess.newPassword) {
							btnMainSet.removeClass('disabled');
						}
					} else {
						blockMessages.mainSet.showNewMessage('Данный логин уже занят');
						keysAccess.login = false;
						btnMainSet.addClass('disabled');
					}
				});
			}
		} else {
			console.log('error');
		}
	});

	emailSettings.change(function() {
		if (keysAccess.oldPassword) {
			if (emailSettings.val() == '' && keysAccess.login && keysAccess.newPassword) {
				blockMessages.mainSet.defaultMessage();
				btnMainSet.removeClass('disabled');
			} else if (emailSettings.val() == '') {
				blockMessages.mainSet.defaultMessage();
				keysAccess.email = true;
			} else if (!(/^[\-\.\_a-zA-Z0-9]+@[a-zA-Z0-9\-]+\.[a-zA-Z]+\.?[a-zA-Z]*$/.test(emailSettings.val()))) {
				blockMessages.mainSet.showNewMessage('Проверьте правильность введённой вами почты');
				keysAccess.email = false;
				btnMainSet.addClass('disabled');
			} else {
				var parameters = {type: 'email', value: emailSettings.val()};
				checkForDuplicate(parameters, function(result) {
					if (result) {
						blockMessages.mainSet.showNewMessage('Почта свободна');
						keysAccess.email = true;
						if (keysAccess.login && keysAccess.newPassword) {
							btnMainSet.removeClass('disabled');
						}
					} else {
						blockMessages.mainSet.showNewMessage('Данная почта уже занята');
						keysAccess.email = false;
						btnMainSet.addClass('disabled');
					}
				});
			}
		} else {
			console.log('error');
		}
	});

	oldPassword.change(function() {
		if (oldPassword.val() == '') {
			btnMainSet.addClass('disabled');
			blockMessages.mainSet.defaultMessage();
			disabledInputs.attr('disabled', '');
			keysAccess.oldPassword = false;
		}
		checkPassword(oldPassword.val(), function(result) {
			if (result) {
				btnMainSet.removeClass('disabled');
				disabledInputs.removeAttr('disabled');
				keysAccess.oldPassword = true;
				blockMessages.mainSet.showNewMessage('Доступ к изменению данных открыт');
			} else {
				btnMainSet.addClass('disabled');
				keysAccess.oldPassword = false;
				blockMessages.mainSet.showNewMessage('Пароль не подходит');
				disabledInputs.attr('disabled', '');
			}
		});
	});

	newPassword.change(function() {
		if (newPassword.val() == '' && keysAccess.login && keysAccess.newPassword) {
			blockMessages.mainSet.defaultMessage();
			btnMainSet.removeClass('disabled');
		} else if (newPassword.val() == '') {
			blockMessages.mainSet.defaultMessage();
			keysAccess.newPassword = true;
		} else if (!(/^.{6,20}$/.test(newPassword.val()))) {
			blockMessages.mainSet.showNewMessage('Пароль должен содержать от 6 до 20 символов');
			keysAccess.newPassword = false;
			btnMainSet.addClass('disabled');
		} else {
			blockMessages.mainSet.showNewMessage('Новый пароль прошёл проверку');
			keysAccess.newPassword = true;
			if (keysAccess.login && keysAccess.email) {
				btnMainSet.removeClass('disabled');
			}
		}
	});

	btnMainSet.click(function() {
		console.log(keysAccess);
		var getString = '';
		if (keysAccess.oldPassword) {
			if (keysAccess.login && loginSettings.val() != '') {
				getString = 'login=' + loginSettings.val() + '&';
				var newLogin = loginSettings.val();
			}
			if (keysAccess.newPassword && newPassword.val() != '') {
				getString += 'password=' + newPassword.val() + '&';
			}
			if (keysAccess.email && emailSettings.val() != '') {
				getString += 'email=' + emailSettings.val();
			}
			$.getJSON('/settings?mainSettingsChange=1&' + getString, function(response) {
				if (response.success) {
					profilePage.children('a').attr('href', newLogin).text(newLogin);
					disabledInputs.attr('disabled', '');
					blockMessages.mainSet.showNewMessage('Ваши данные были успешно изменены!');
				} else {
					console.log('error');
				}
			});
		}
	});

	nameSettings.change(function() {
		if (personalInfo.name != nameSettings.val()) {
			blockMessages.personalSet.showNewMessage('При сохранении имя будет изменено');
			personalInfoUpdate.name = nameSettings.val();
		} else {
			personalInfoUpdate.name = false;
			blockMessages.personalSet.showNewMessage('Введённое имя останется без изменений');
		}
	});

	lastNameSettings.change(function() {
		if (personalInfo.lastName != lastNameSettings.val()) {
			blockMessages.personalSet.showNewMessage('При сохранении фамилия будет изменена');
			personalInfoUpdate.lastName = lastNameSettings.val();
		} else {
			personalInfoUpdate.lastName = false;
			blockMessages.personalSet.showNewMessage('Введённая фамилия останется без изменений');
		}
	});

	aboutSettings.change(function() {
		if (personalInfo.about != aboutSettings.val()) {
			blockMessages.personalSet.showNewMessage('Информация в поле "О себе" при сохранении будет изменена');
			personalInfoUpdate.about = aboutSettings.val();
		} else {
			personalInfoUpdate.about = false;
			blockMessages.personalSet.showNewMessage('Поле "О себе" останется без изменений');
		}
	});

	aboutSettings.focus(function() {
		blockMessages.personalSet.showNewMessage('В поле "О себе" вы также можете оставить ссылки на профили в социальных сетях');
	});

	btnPersonalSet.click(function() {
		var getInfo = '';
		((personalInfoUpdate.name)     ? getInfo = 'name=' + personalInfoUpdate.name + '&' : '');
		((personalInfoUpdate.lastName) ? getInfo += 'lastName=' + personalInfoUpdate.lastName + '&' : '');
		((personalInfoUpdate.about)    ? getInfo += 'about=' + personalInfoUpdate.about + '&' : '');
		console.log(getInfo);
		if (getInfo == '') {
			blockMessages.personalSet.showNewMessage('Данные не будут изменены');
		} else {
			console.log(getInfo);
			$.getJSON('/settings?personalSettingsChange=1&' + getInfo, function(response) {
				if (response.success) {
					blockMessages.personalSet.showNewMessage('Персональные данные успешно обновлены');
				} else {
					blockMessages.personalSet.showNewMessage('Произошёл сбой, данные не обновлены');
				}
			});
		}
	});

	mainSettings.click(function() {
		var settingsContent = $(this).next('.settings-content');

		if (settingsContent.css('display') == 'none') {
			settingsContent.show();
		} else {
			settingsContent.hide();
		}
	});

	personalSettings.click(function() {
		var settingsContent = $(this).next('.settings-content');

		if (settingsContent.css('display') == 'none') {
			settingsContent.show();
		} else {
			settingsContent.hide();
		}
	});

	additionalSettings.click(function() {
		var settingsContent = $(this).next('.settings-content');

		if (settingsContent.css('display') == 'none') {
			settingsContent.show();
		} else {
			settingsContent.hide();
		}
	});


	function checkForDuplicate(parameters ,callback) {
		$.getJSON('/settings?checkDuplicate=1&' + parameters.type + '=' + parameters.value, function(response) {
			if (response.success) {
				callback(true);
			} else {
				callback(false);
			}
		});
	};

	function checkPassword(password, callback) {
		$.getJSON('/settings?checkPassword=1&password=' + password, function(response) {
			if (response.success) {
				callback(true);
			} else {
				callback(false);
			}
		});
	}

});