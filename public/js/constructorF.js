'use strict';
// функция запускается, когда страница готова
$(document).ready(function() {

  var constructorBegin  = $('.constructorBeginning'),
    constructorComplete = $('.constructorComplete'),
    message             = $('.messageConstructor'),
    messageText         = $('.messageConstructorText'),
    counter             = $('.counter'),
    btnStep1            = $('.btn-step1'),
    btnStep2            = $('.btn-step2'),
    postName            = $('.postNameConstructor'),
    postDesc            = $('.postDescConstructor'),
    itemCopy            = $('.itemCopy'),
    postStep3           = $('#postStep3'),
    fullStructureItems  = $('.fullStrItems'),
    shortStructureItems = $('.shortStrItems'),
    addItem             = $('.addItem'),
    addItem             = $('.addItem'),
    messageSettings     = $('.newSettingsMessage'),
    countVotesForEnd    = $('#countVotesForEnd'),
    timeForEndHours     = $('#timeForEndHours'),
    timeForEndDate      = $('#timeForEndDate'),
    hoursCheckbox       = $('#hoursCheckbox'),
    dateCheckbox        = $('#dateCheckbox'),
    onlyForReg          = $('#onlyForReg'),
    savePost            = $('.savePost'),
    titleSettings       = $('.titleSettings'),
    goToSettings        = $('.goToSettings'),
    openSettings        = $('.openSettings').parent('div'),
    postLink            = $('.postLink').children('span'),
    goToPost            = $('.goToPost');

  var countItems = 2;
  var typeOfStructureItems = 'full';
  var postSettings = {countVotesForEnd: '', timeForEndHours: '', timeForEnd: true, regOnly: false},
      postImg = '',
      postId  = 0;

  function createItem(typeOfStructureItems, countItems) {
    var itemStr = '';
    if (typeOfStructureItems == 'full') {
      itemStr = '<div class="text-center item col-md-6 col-md-offset-0 col-sm-6 col-sm-offset-0 col-xs-10 col-xs-offset-1"><div style="display: none;" class="col-md-1 col-sm-1 col-xs-1 delItemShort delItem"></div><div class="thumbnail fullItem"><form enctype="multipart/form-data" action="/upload/image" method="post" class="itemForm uploadForm" style="display: block;"><div class="mask-wrapper"><ul class="list-inline mask"><li class="col-md-8 col-sm-8 col-xs-8"><input type="text" disabled="" value="Файл не выбран" class="fileInputText"></li><li class="col-md-2 col-sm-2 col-xs-2"><input type="file" name="itemImg' + (countItems + 1) + '" class="fileInput"><div id="inputMask"></div></li><li class="col-md-2 col-sm-2 col-xs-2"><input type="submit" value="" name="submit" class="download-image"></li></ul></div><input type="hidden" name="itemsImage" class="itemsImagePath"><div class="col-md-12 col-sm-12 col-xs-12"><p class="alignmentItemsImg"><img src="../images/noimage.png" alt="Mountain View" class="itemImg' + (countItems + 1) + '"></p></div></form><div class="caption"><p><input name="itemsName" placeholder="Название" type="text" maxlength="85" class="form-control itemName"></p><p class="itemDescribe" style="display: block;"><textarea name="itemsDescription" maxlength="200" placeholder="Краткое описание" cols="40" rows="3" type="text" class="form-control"></textarea></p></div></div><div class="col-md-12 col-sm-12 col-xs-12 delItemFull delItem" style="display: block;"></div></div>';
    } else if (typeOfStructureItems == 'short') {
      itemStr = '<div class="text-center item col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1"><div style="" class="col-md-1 col-sm-1 col-xs-1 delItemShort delItem"></div><div class="thumbnail itemBody col-md-10 col-sm-10 col-xs-10"><form enctype="multipart/form-data" action="/upload/image" method="post" class="itemForm uploadForm" style="display: none;"><div class="mask-wrapper"><ul class="list-inline mask"><li class="col-md-8 col-sm-8 col-xs-8"><input type="text" disabled="" value="Файл не выбран" class="fileInputText"></li><li class="col-md-2 col-sm-2 col-xs-2"><input type="file" name="itemImg' + (countItems + 1) + '" class="fileInput"><div id="inputMask"></div></li><li class="col-md-2 col-sm-2 col-xs-2"><input type="submit" value="" name="submit" class="download-image"></li></ul></div><input type="hidden" name="itemsImage" class="itemsImagePath"><div class="col-md-12 col-sm-12 col-xs-12"><p class="alignmentItemsImg"><img src="../images/noimage.png" alt="Mountain View" class="itemImg' + (countItems + 1) + '"></p></div></form><div class="caption"><p><input name="itemsName" placeholder="Название" type="text" maxlength="85" class="form-control itemName"></p><p class="itemDescribe" style="display: none;"><textarea name="itemsDescription" maxlength="200" placeholder="Краткое описание" cols="40" rows="3" type="text" class="form-control"></textarea></p></div></div><div class="col-md-12 col-sm-12 col-xs-12 delItemFull delItem" style="display: none;"></div></div>';
    }
      $('.group-items').append(itemStr);
  }

  var changeType = {
    fullStructureItems: function() {
      $('.item').removeClass('col-md-10 col-md-offset-1 col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0').addClass('col-md-6 col-md-offset-0 col-sm-6 col-sm-offset-0 col-xs-10 col-xs-offset-1');
      $('.itemForm').show();
      $('.delItemShort').hide();
      $('.thumbnail').removeClass('itemBody col-md-10 col-md-offset-0 col-sm-10 col-sm-offset-0 col-xs-10 col-xs-offset-1').addClass('fullItem');
      $('.itemImg').show();
      $('.itemDescribe').show();
      $('.delItemFull').show();
      shortStructureItems.removeAttr('id', 'activeStr');
      fullStructureItems.attr('id', 'activeStr');
    },
    shortStructureItems: function() {
      $('.item').removeClass('col-md-6 col-md-offset-0 col-sm-6 col-sm-offset-0 col-xs-10 col-xs-offset-1').addClass('col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0');
      $('.itemForm').hide();
      $('.delItemShort').show();
      $('.thumbnail').removeClass('fullItem').addClass('itemBody col-md-10 col-md-offset-0 col-sm-10 col-sm-offset-0 col-xs-10 col-xs-offset-0');
      $('.itemImg').hide();
      $('.itemDescribe').hide();
      $('.delItemFull').hide();
      fullStructureItems.removeAttr('id', 'activeStr');
      shortStructureItems.attr('id', 'activeStr');
    }
  };

  function activateDelete() {
    $('.delItem').off( "click" );
    $('.delItem').click(function() {
      $(this).parent('.item').remove();
      countItems--;
      counter.text(countItems);
    });
  }
  activateDelete();


  fullStructureItems.click(function() {
    if (countItems < 5) {
      typeOfStructureItems = 'full';
      changeType.fullStructureItems();
      message.hide();
    } else {
      message.show();
      messageText.text('У вас должно быть не более 4-ёх объектов, чтобы перейти в полный режим.');
    }
  });

  shortStructureItems.click(function() {
    typeOfStructureItems = 'short';
    changeType.shortStructureItems();
    message.hide();
  });

  addItem.click(function() {
    if (countItems < 4 && typeOfStructureItems == 'full') {
      createItem(typeOfStructureItems, countItems);
      countItems++;
      counter.text(countItems);
      activateDelete();
      refreshUploadForm();
    } else if (typeOfStructureItems == 'short') {
      createItem(typeOfStructureItems);
      countItems++;
      counter.text(countItems);
      activateDelete();
      refreshUploadForm();
    } else {
      message.show();
      messageText.text('Данный режим поддерживает только 4 объекта, чтобы создать больше нужно перейти к списку.');
    }
  });

  countVotesForEnd.keydown(function (e) {
      // Allow: backspace, delete, tab, escape, enter and .
      if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
         // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
         // Allow: Ctrl+C
        (e.keyCode == 67 && e.ctrlKey === true) ||
         // Allow: Ctrl+X
        (e.keyCode == 88 && e.ctrlKey === true) ||
         // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
             // let it happen, don't do anything
             return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault();
      }

      if (countVotesForEnd.val().length > 10) {
        e.preventDefault();
      }
  });

  timeForEndHours.keydown(function (e) {
      // Allow: backspace, delete, tab, escape, enter and .
      if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
         // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
         // Allow: Ctrl+C
        (e.keyCode == 67 && e.ctrlKey === true) ||
         // Allow: Ctrl+X
        (e.keyCode == 88 && e.ctrlKey === true) ||
         // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
             // let it happen, don't do anything
             return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault();
      }

      if (timeForEndHours.val().length > 4) {
        e.preventDefault();
      }
  });

  countVotesForEnd.change(function() {
    if (countVotesForEnd.val() != '') {
      postSettings.countVotesForEnd = countVotesForEnd.val();
      // messageSettings.text('Ограничение на количество голосов будет установлено при завершении');
    } else if (countVotesForEnd.val() == '') {
      postSettings.countVotesForEnd = '';
      // messageSettings.text('Лимит на количество голосов убран');
    }
  });

  onlyForReg.change(function() {
    if(onlyForReg.prop("checked")) {
      messageSettings.text('Ограничение для пользователей будет установлено');
      postSettings.regOnly = true;
    } else {
      messageSettings.text('Внимание, ограничение для пользователей снятно. Позволяя незарегистрированным пользователям голосовать, появляется риск накрутки голосов.');
      postSettings.regOnly = false;
    }
  });

  countVotesForEnd.focus(function() {
    messageSettings.text('Ограничение по количеству голосов не должно быть меньше 10');
  });

  // hoursCheckbox.is(':checked');

  hoursCheckbox.change(function() {
    // hoursCheckbox.val($(this).is(':checked'));
    timeForEndHours.removeAttr('disabled');
    timeForEndDate.attr('disabled', '');
    postSettings.timeForEndDate = '';
    postSettings.timeForEndHours = timeForEndHours.val();
  });

  dateCheckbox.change(function() {
    // dateCheckbox.val($(this).is(':checked'));
    timeForEndDate.removeAttr('disabled');
    timeForEndHours.attr('disabled', '');
    postSettings.timeForEndHours = '';
    postSettings.timeForEndDate = timeForEndDate.val();
  });

  // timeForEndHours.focus(function() {
  //   if (!timeForEndHours.val()) {
  //     messageSettings.text('Ограничение по времени можно сделать либо по часам, либо по конкретной дате');
  //   }
  // });

  // timeForEndDate.focus(function() {
  //   if (!timeForEndDate.val()) {
  //     messageSettings.text('Ограничение по времени можно сделать либо по часам, либо по конкретной дате');
  //   }
  // });

  timeForEndHours.change(function() {
    if (timeForEndHours.val() != '' && hoursCheckbox.is(':checked')) {
      postSettings.timeForEndHours = timeForEndHours.val();
      postSettings.timeForEnd = true;
    }
  });

  timeForEndDate.change(function() {
    if (timeForEndDate.val() != '' && dateCheckbox.is(':checked')) {
      postSettings.timeForEndDate = timeForEndDate.val();
      postSettings.timeForEnd = true;
    }
  });

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
            curItem.children('div').children('ul').children('li').children('.fileInputText').val('Загружено');
            // curItem.children('.status').empty().text('Success');
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
            // curItem.children('.status').empty().text('Error');
          }
          if (response.imgName == 'postImg') {
            postImg = response.imgPath;
          } else {
            curItem.children('.itemsImagePath').val(response.imgPath);
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


  savePost.click(function(e) {

    // savePost.off('click');

    checkPostValues(typeOfStructureItems, countItems, function(checkResult) {
      if (checkResult.response) {
        var dataPostForm = $('#postForm :input').serializeArray();

        dataPostForm.push({ name: "postImg", value: postImg });
        dataPostForm.push({ name: "typeOfStructureItems", value: typeOfStructureItems });

        checkPostSettings(function(resultSettings) {
          if (resultSettings.access) {
            dataPostForm.push({ name: "postSettings", value: true });

            if (resultSettings.countVotesForEnd) {
              dataPostForm.push({ name: "countVotesForEnd", value: resultSettings.countVotesForEnd });
            }
            if (resultSettings.timeForEndHours) {
              dataPostForm.push({ name: "timeForEndHours", value: resultSettings.timeForEndHours });
            }
            if (resultSettings.timeForEndDate) {
              dataPostForm.push({ name: "timeForEndDate", value: resultSettings.timeForEndDate });
            }
            if (resultSettings.regOnly) {
              dataPostForm.push({ name: "regOnly", value: resultSettings.regOnly });
            }
          } else {
            return;
          }
        });

        $.ajax({
          type: "POST",
          url: '/constructer',
          data: dataPostForm,
          success: function (response) {
            if (response.success) {
              console.log('success add post');
              // constructorBegin.toggle('slow');
              constructorBegin.hide("slide", { direction: "right" }, 500);
              constructorComplete.delay(500).show("slide", { direction: "left" }, 500);
              postId = response.postId;
              postLink.text('optioption.com/post/' + postId);
              $('#shareVk').click(function() {
                return shareBox('http://vk.com/share.php?url=http://localhost:3000/post/'+ response.postId +'&title='+ response.postName +'&description='+ response.postDesc, event);
              });
              $('#shareTwitter').click(function() {
                return shareBox('https://twitter.com/share?url=http://localhost:3000/post/'+ response.postId +'&via=OPTIMALOPTION&related=SergeShaw%2COptiOption&hashtags=OpOp%2CpollMe&text='+ response.postName, event);
              });
              // step3.show();
              // var titleString = '<h2 id="header" class="text-center">' + response.postName + '</h2><div class="col-sm-12 col-md-10 col-md-offset-1 group-items-step3">';
              // for (var ii = 0; ii < response.items.length; ii++) {
              //  itemsString += '<div class="col-sm-3 col-md-3 text-center"><div class="thumbnail"><h4 class="itemHeading1">' + response.items[ii].name + '</h4><div class="caption"><p class="itemDescription1">' + response.items[ii].desc + '</p></div><p><a href="#" role="button" class="btn btn-danger disabled">Голосовать</a></p></div></div>';
              // }
              // postString = titleString + itemsString + '<div class="col-md-5 col-md-offset-6"><p>Post id: ' + response.postId + '</p><a type="submit" id="vote" class="btn btn-primary" href="post/' + response.postId + '">Go to vote</a></div></div>';
              // postStep3.append(postString);

            } else if (!response.success) {
              message.show();
              messageText.text(response.message);
              $('html,body').animate({
                scrollTop: message.offset().top-100
              }, 400);
            }
          },
          dataType: 'json'
        });
      } else {
        message.show();
        messageText.text(checkResult.message);
        $('html,body').animate({
          scrollTop: message.offset().top-100
        }, 400);
      }
    });
  });

  goToPost.click(function() {
    if (postId) {
      location.pathname = '/post/' + postId;
    } else {
      console.log('error');
    }
  });

  function checkPostSettings(callback) {
    var objSettings = {access: true};

    if (postSettings.countVotesForEnd) {
      objSettings.countVotesForEnd = postSettings.countVotesForEnd;
      objSettings.access = true;
    }

    if (postSettings.timeForEnd) {
      if (postSettings.timeForEndHours) {
        objSettings.timeForEndHours = postSettings.timeForEndHours;
        objSettings.access = true;
      } else if (postSettings.timeForEndDate) {
        objSettings.timeForEndDate = postSettings.timeForEndDate;
        objSettings.access = true;
      }
    } else {
      objSettings.access = false;
    }

    if (postSettings.regOnly) {
      objSettings.regOnly = postSettings.regOnly;
      objSettings.access = true;
    }

    callback(objSettings);
  }

  function checkPostValues(typeOfStructureItems, countItems, callback) {
    console.log(countItems);
    if (countItems < 2) {
      callback({response: false, message: 'У вас не может быть меньше двух объектов'});
    } else if (postName.val().length > 90) {
      callback({response: false, message: 'Не больше 90 символов в названии поста'});
    } else if (postDesc.val().length > 270) {
      callback({response: false, message: 'Не больше 270 символов в описании к посту'});
    } else if (postName.val() == '') {
      callback({response: false, message: 'Не указано название поста'});
    } else {

      var itemsName = $('.itemName'),
        itemsDesc = $('.itemDescribe').children('textarea');

      for (var ii = 0; ii < itemsName.length; ii++) {
        if (itemsName[ii].value == '') {
          callback({response: false, message: 'Заполните все имена объектов, либо удалите лишние'});
          return;
        } else if (typeOfStructureItems == 'full' && (Number(itemsName[ii].value.length) > 45)) {
          callback({response: false, message: 'Не больше 45 символов у имени объекта в полном режиме'});
          return;
        } else if (typeOfStructureItems == 'short' && (Number(itemsName[ii].value.length) > 90)) {
          callback({response: false, message: 'Не больше 90 символов у имени объекта в режиме списка'});
          return;
        } else if (Number(itemsDesc[ii].value.length) > 200) {
          callback({response: false, message: 'Не больше 200 символов в кратком описании'});
          return;
        }
      }

      callback({response: true});
    }
  }

});

function shareBox(url, ev) {
  var
    screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
    screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
    outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
    outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
    features = 'width=540,height=300,left=' + parseInt(screenX + ((outerWidth - 540) / 2), 10) + ',top=' + parseInt(screenY + ((outerHeight - 300) / 2), 10);
  window.open(url, 'vkShare', features);
  ev = ev || window.event;
  if (!ev) return false;
  ev = (ev.originalEvent || ev);
  if (ev.preventDefault) ev.preventDefault();
  if (ev.stopPropagation) ev.stopPropagation();
  ev.cancelBubble = true;
  ev.returnValue = false;
  return false;
}