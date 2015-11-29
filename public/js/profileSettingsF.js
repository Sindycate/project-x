'use strict';
// функция запускается, когда страница готова

$(document).ready(function() {

  var mainSettings = $('#mainSettings'),
    personalSettings = $('#personalSettings'),
    additionalSettings = $('#additionalSettings'),
    loginSettings = $('#loginSettings'),
    socialLogin = $('#socialLogin'),
    emailSettings = $('#emailSettings'),
    oldPassword = $('#oldPassword'),
    newPassword = $('#newPassword'),
    firstPassword = $('#firstPassword'),
    btnMainSet = $('.btnMainSet'),
    btnHalfMainSet = $('.btnHalfMainSet'),
    btnPersonalSet = $('.btnPersonalSet'),
    btnImg = $('.btnImg'),
    imgBlock = $('.userImg'),
    deleteImg = $('.deleteImg'),
    newPersonalMessage = $('.newPersonalMessage'),
    newMainMessage = $('.newMainMessage'),
    newHalfMainMessage = $('.newHalfMainMessage'),
    disabledInputs = $('.disabledInputs'),
    profilePage = $('.profile-page'),
    nameSettings = $('#nameSettings'),
    lastNameSettings = $('#lastNameSettings'),
    aboutSettings = $('#aboutSettings');

  var userImg = '';

  var keysAccess = {login: true, email: true, newPassword: true, oldPassword: false, socialLogin: true, firstPassword: true};

  var blockMessages = {
    mainSet: {
      defaultMessage: function () {
        newMainMessage.text('Будьте внимательны при изменении основных данных');
      },
      showNewMessage: function(message) {
        newMainMessage.text(message);
      }
    },
    halfMainSet: {
      defaultMessage: function () {
        newHalfMainMessage.text('Будьте внимательны при изменении основных данных');
      },
      showNewMessage: function(message) {
        newHalfMainMessage.text(message);
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
  var mainInfo = {login: loginSettings.val(), email: emailSettings.val(), socialLogin: socialLogin.val(), firstPassword: firstPassword.val()};
  var personalInfoUpdate = {name: '', lastName: '', about: ''};

  loginSettings.change(function() {
    if (keysAccess.oldPassword) {
      if (loginSettings.val() == '' && keysAccess.email && keysAccess.newPassword) {
        blockMessages.mainSet.defaultMessage();
        btnMainSet.removeAttr('disabled');
      } else if (loginSettings.val() == '') {
        blockMessages.mainSet.defaultMessage();
        keysAccess.login = true;
      } else if (!(/^[\-\_a-zA-Z0-9]{4,15}$/.test(loginSettings.val()))) {
        blockMessages.mainSet.showNewMessage('Логин должен содержать от 4 до 15 символов, разрешены только следующие специальные символы: (-,_)');
        keysAccess.login = false;
        btnMainSet.attr('disabled', '');
      } else if (loginSettings.val() == mainInfo.login) {
        keysAccess.login = true;
        blockMessages.mainSet.showNewMessage('Логин останется прежним');
      } else {
        var parameters = {type: 'login', value: loginSettings.val()};

        checkForDuplicate(parameters, function(result) {
          if (result) {
            blockMessages.mainSet.showNewMessage('Логин свободен');
            keysAccess.login = true;
            if (keysAccess.email && keysAccess.newPassword) {
              btnMainSet.removeAttr('disabled');
            }
          } else {
            blockMessages.mainSet.showNewMessage('Данный логин уже занят');
            keysAccess.login = false;
            btnMainSet.attr('disabled', '');
          }
        });
      }
    } else {
      console.log('error');
    }
  });

  socialLogin.change(function() {

    if (!(/^[\-\_a-zA-Z0-9]{4,15}$/.test(socialLogin.val()))) {
      blockMessages.halfMainSet.showNewMessage('Логин должен содержать от 4 до 15 символов, разрешены только следующие специальные символы: (-,_)');
      keysAccess.socialLogin = false;
    } else if (socialLogin.val() == mainInfo.socialLogin) {
      keysAccess.socialLogin = true;
      blockMessages.halfMainSet.showNewMessage('Логин останется прежним');
    } else {
      var parameters = {type: 'login', value: socialLogin.val()};

      checkForDuplicate(parameters, function(result) {
        if (result) {
          blockMessages.halfMainSet.showNewMessage('Логин свободен');
          keysAccess.socialLogin = true;
        } else {
          blockMessages.halfMainSet.showNewMessage('Данный логин уже занят, попробуйте другой');
          keysAccess.socialLogin = false;
        }
      });
    }
  });

  emailSettings.change(function() {
    if (keysAccess.oldPassword) {
      if (emailSettings.val() == '' && keysAccess.login && keysAccess.newPassword) {
        blockMessages.mainSet.showNewMessage('Почта останется прежней');
        btnMainSet.removeAttr('disabled');
      } else if (emailSettings.val() == '') {
        blockMessages.mainSet.defaultMessage();
        keysAccess.email = true;
      } else if (!(/^[\-\.\_a-zA-Z0-9]+@[a-zA-Z0-9\-]+\.[a-zA-Z]+\.?[a-zA-Z]*$/.test(emailSettings.val()))) {
        blockMessages.mainSet.showNewMessage('Проверьте правильность введённой вами почты');
        keysAccess.email = false;
        btnMainSet.attr('disabled', '');
      } else {
        var parameters = {type: 'email', value: emailSettings.val()};
        checkForDuplicate(parameters, function(result) {
          if (result) {
            blockMessages.mainSet.showNewMessage('Почта свободна');
            keysAccess.email = true;
            if (keysAccess.login && keysAccess.newPassword) {
              btnMainSet.removeAttr('disabled');
            }
          } else {
            blockMessages.mainSet.showNewMessage('Данная почта уже занята');
            keysAccess.email = false;
            btnMainSet.attr('disabled', '');
          }
        });
      }
    } else {
      console.log('error');
    }
  });

  oldPassword.change(function() {
    if (oldPassword.val() == '') {
      btnMainSet.attr('disabled', '');
      blockMessages.mainSet.defaultMessage();
      disabledInputs.attr('disabled', '');
      keysAccess.oldPassword = false;
    }
    checkPassword(oldPassword.val(), function(result) {
      if (result) {
        btnMainSet.removeAttr('disabled');
        disabledInputs.removeAttr('disabled');
        keysAccess.oldPassword = true;
        blockMessages.mainSet.showNewMessage('Доступ к изменению данных открыт');
      } else {
        btnMainSet.attr('disabled', '');
        keysAccess.oldPassword = false;
        blockMessages.mainSet.showNewMessage('Пароль не подходит');
        disabledInputs.attr('disabled', '');
      }
    });
  });

  newPassword.change(function() {
    if (newPassword.val() == '' && keysAccess.login && keysAccess.email) {
      blockMessages.mainSet.defaultMessage();
      btnMainSet.removeAttr('disabled');
      keysAccess.newPassword = true;
      blockMessages.mainSet.showNewMessage('Пароль останется прежним');
    } else if (newPassword.val() == '') {
      blockMessages.mainSet.defaultMessage();
      keysAccess.newPassword = true;
    } else if (!(/^.{6,20}$/.test(newPassword.val()))) {
      blockMessages.mainSet.showNewMessage('Пароль должен содержать от 6 до 20 символов');
      keysAccess.newPassword = false;
      btnMainSet.attr('disabled', '');
    } else {
      blockMessages.mainSet.showNewMessage('Новый пароль прошёл проверку');
      keysAccess.newPassword = true;
      if (keysAccess.login && keysAccess.email) {
        btnMainSet.removeAttr('disabled');
      }
    }
  });

  firstPassword.change(function() {
    if (!(/^.{6,20}$/.test(firstPassword.val()))) {
      blockMessages.halfMainSet.showNewMessage('Пароль должен содержать от 6 до 20 символов');
      keysAccess.firstPassword = false;
    } else {
      blockMessages.halfMainSet.showNewMessage('Новый пароль прошёл проверку');
      keysAccess.firstPassword = true;
    }
  });

  btnMainSet.click(function() {
    console.log(keysAccess);
    var getString = '';
    if (keysAccess.oldPassword && keysAccess.login && keysAccess.newPassword && keysAccess.email) {
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
          oldPassword.val('');
          disabledInputs.attr('disabled', '');
          blockMessages.mainSet.showNewMessage('Ваши данные были успешно изменены!');
        } else {
          console.log('error');
        }
      });
    }
  });

  btnHalfMainSet.click(function() {
    console.log(mainInfo.firstPassword);
    if (mainInfo.firstPassword == '') {
      var getString = '';
      if (socialLogin.val() != '' || firstPassword.val() != '') {
        if (keysAccess.socialLogin && keysAccess.firstPassword) {
          getString = 'login=' + socialLogin.val() + '&';
          var newLogin = socialLogin.val();
        }
        if (keysAccess.socialLogin && firstPassword.val() != '' && keysAccess.firstPassword) {
          getString += 'password=' + firstPassword.val() + '&';
        }
        $.getJSON('/settings?mainSettingsChange=1&' + getString, function(response) {
          if (response.success) {
            profilePage.children('a').attr('href', newLogin).text(newLogin);
            mainInfo.firstPassword = firstPassword.val();
            blockMessages.halfMainSet.showNewMessage('Ваши данные были успешно изменены!');
          } else {
            console.log('error');
          }
        });
      } else {
        blockMessages.halfMainSet.showNewMessage('Вы не заполнили ни одного поля');
      }
    } else {
      location.reload();
    }
  });

  nameSettings.change(function() {

    if (nameSettings.val().length > 40) {
      personalInfoUpdate.name = false;
      blockMessages.personalSet.showNewMessage('Имя не должно занимать больше 40 символов');
    } else if (personalInfo.name != nameSettings.val()) {
      blockMessages.personalSet.showNewMessage('При сохранении имя будет изменено');
      personalInfoUpdate.name = nameSettings.val();
    } else {
      personalInfoUpdate.name = false;
      blockMessages.personalSet.showNewMessage('Введённое имя останется без изменений');
    }
  });

  // lastNameSettings.change(function() {
  //   if (personalInfo.lastName != lastNameSettings.val()) {
  //     blockMessages.personalSet.showNewMessage('При сохранении фамилия будет изменена');
  //     personalInfoUpdate.lastName = lastNameSettings.val();
  //   } else {
  //     personalInfoUpdate.lastName = false;
  //     blockMessages.personalSet.showNewMessage('Введённая фамилия останется без изменений');
  //   }
  // });

  aboutSettings.change(function() {
    if (aboutSettings.val().length > 120) {
      personalInfoUpdate.about = false;
      blockMessages.personalSet.showNewMessage('Поле "информация о себе" не должно содержать больше 120 символов');
    } else if (personalInfo.about != aboutSettings.val()) {
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
    getInfo = (
      ((personalInfoUpdate.name)     ? ('name=' + personalInfoUpdate.name + '&') : '') +
      ((personalInfoUpdate.lastName) ? ('lastName=' + personalInfoUpdate.lastName + '&') : '') +
      ((personalInfoUpdate.about)    ? ('about=' + personalInfoUpdate.about + '&') : '') +
      ((userImg != '')               ? ((userImg == 'deleted') ? ('userImg=deleted' + '&') : ('userImg=' + userImg + '&')) : ''));
    console.log(getInfo);
    if (getInfo == '') {
      blockMessages.personalSet.showNewMessage('Данные не будут изменены');
    } else {
      $.getJSON('/settings?personalSettingsChange=1&' + getInfo, function(response) {
        if (response.success) {
          if (loginSettings.val() == '' && response.data.name != '') {
            profilePage.children('a').attr('href', response.data.id).text(response.data.name);
          }
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

  deleteImg.click(function() {
    var curItem = $(this);
    curItem.hide();
    curItem.prev().children('img').attr('src', '../images/noimage.png');
    console.log(curItem.parent('div').prev().children('div').children('ul').children('li').children('.fileInputText').val('Изображение удалено'));
    userImg = 'deleted';
    // curItem.prev().parent('div').prev().prev().children('ul').children('li').children('.fileInputText').val('Изображение удалено');
  });

  btnImg.click(function() {
    btnImg.parent('div').hide();
    imgBlock.show();
  })

  $('.fileInput').on('change', function() {
    var newVal  = $(this).val().split('\\');
    $(this).parent('li').prev('li').children('input').val(newVal[newVal.length -1]);
  });

  function refreshUploadForm() {
    $('.uploadForm').off('click');
    $('.uploadForm').submit(function() {

      var curItem = $(this);
      curItem.children('div').children('ul').children('li').children('.fileInputText').val('Идёт загрузка...');
      // curItem.children('.status').empty().text("File is uploading...");

      $(this).ajaxSubmit({
        error: function(xhr) {

          curItem.children('.status').empty().text('Такой формат не поддерживается');
          // status('Error: ' + xhr.status);
        },
        success: function(response) {
          if (response.access) {
            curItem.next('.imgBlock').children('.deleteImg').show();
            curItem.children('div').children('ul').children('li').children('.fileInputText').val('Загружено');
          } else {
            var errorMessage = '';
            if (response.errorType == 'notFound') {
              errorMessage = 'Ошибка загрузки';
            } else if (response.errorType == 'oversize') {
              errorMessage = 'Размер превышает 2Мб';
            } else {
              errorMessage = 'Неверный формат';
            }
            curItem.children('div').children('ul').children('li').children('.fileInputText').val(errorMessage);
          }

          if (response.imgName == 'userIcon') {
            userImg = response.imgPath;
          }

          if (response.imgName) {
            $('.' + response.imgName).attr('src', response.imgPath);
          }
        }
      });

      //Very important line, it disable the page refresh!
      return false;
    });
  }
  refreshUploadForm();


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