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
		onlyForReg          = $('#onlyForReg'),
		savePost            = $('.savePost'),
		titleSettings       = $('.titleSettings'),
		goToSettings        = $('.goToSettings'),
		openSettings        = $('.openSettings').parent('div'),
		goToPost            = $('.goToPost');

	var countItems = 2;
	var typeOfStructureItems = 'full';
	var postSettings = {countVotesForEnd: '', timeForEndHours: '', timeForEndHours: '', timeForEnd: true, regOnly: false},
			postImg = '',
			postId  = 0;

	function createItem(typeOfStructureItems, countItems) {
		var itemStr = '';
		if (typeOfStructureItems == 'full') {
			itemStr = '<div class="text-center item col-md-6"><div style="display: none;" class="col-md-1 delItemShort delItem"></div><div class="thumbnail"><form enctype="multipart/form-data" action="/upload/image" method="post" class="itemForm uploadForm" style="display: block;"><div class="mask-wrapper"><ul class="list-inline mask"><li class="col-md-8"><input type="text" disabled="" value="Файл не выбран" class="fileInputText"></li><li class="col-md-2"><input type="file" name="itemImg' + (countItems + 1) + '" class="fileInput"><div id="inputMask"></div></li><li class="col-md-2"><input type="submit" value="" name="submit" class="download-image"></li></ul></div><input type="hidden" name="itemsImage" class="itemsImagePath"><div class="col-md-12"><p class="alignmentItemsImg"><img src="../images/noimage.png" alt="Mountain View" class="itemImg' + (countItems + 1) + '"></p></div></form><div class="caption"><p><input name="itemsName" placeholder="Название" type="text" maxlength="85" class="form-control itemName"></p><p class="itemDescribe" style="display: block;"><textarea name="itemsDescription" placeholder="Краткое описание" cols="40" rows="3" type="text" class="form-control"></textarea></p></div></div><div class="col-md-12 delItemFull delItem" style="display: block;">Удалить</div></div>';
		} else if (typeOfStructureItems == 'short') {
			itemStr = '<div class="text-center item col-md-12"><div style="" class="col-md-1 delItemShort delItem"></div><div class="thumbnail itemBody col-md-10"><form enctype="multipart/form-data" action="/upload/image" method="post" class="itemForm uploadForm" style="display: none;"><div class="mask-wrapper"><ul class="list-inline mask"><li class="col-md-8"><input type="text" disabled="" value="Файл не выбран" class="fileInputText"></li><li class="col-md-2"><input type="file" name="itemImg' + (countItems + 1) + '" class="fileInput"><div id="inputMask"></div></li><li class="col-md-2"><input type="submit" value="" name="submit" class="download-image"></li></ul></div><input type="hidden" name="itemsImage" class="itemsImagePath"><div class="col-md-12"><p class="alignmentItemsImg"><img src="../images/noimage.png" alt="Mountain View" class="itemImg' + (countItems + 1) + '"></p></div></form><div class="caption"><p><input name="itemsName" placeholder="Название" type="text" maxlength="85" class="form-control itemName"></p><p class="itemDescribe" style="display: none;"><textarea name="itemsDescription" placeholder="Краткое описание" cols="40" rows="3" type="text" class="form-control"></textarea></p></div></div><div class="col-md-12 delItemFull delItem" style="display: none;">Удалить</div></div>';
		}
			$('.group-items').append(itemStr);
	}

	var changeType = {
		fullStructureItems: function() {
			$('.item').removeClass('col-md-12').addClass('col-md-6');
			$('.itemForm').show();
			$('.delItemShort').hide();
			$('.thumbnail').removeClass('itemBody col-md-10');
			$('.itemImg').show();
			$('.itemDescribe').show();
			$('.delItemFull').show();
			shortStructureItems.removeAttr('id', 'activeStr');
			fullStructureItems.attr('id', 'activeStr');
		},
		shortStructureItems: function() {
			$('.item').removeClass('col-md-6').addClass('col-md-12');
			$('.itemForm').hide();
			$('.delItemShort').show();
			$('.thumbnail').addClass('itemBody col-md-10');
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
			console.log('Число объектов превышает допустимое значение');
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
			messageSettings.text('Ограничение на количество голосов будет установлено при завершении');
		} else if (countVotesForEnd.val() == '') {
			postSettings.countVotesForEnd = '';
			messageSettings.text('Лимит на количество голосов убран');
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

	timeForEndHours.focus(function() {
		if (!timeForEndHours.val()) {
			messageSettings.text('Ограничение по времени можно сделать либо по часам, либо по конкретной дате');
		}
	});

	timeForEndDate.focus(function() {
		if (!timeForEndDate.val()) {
			messageSettings.text('Ограничение по времени можно сделать либо по часам, либо по конкретной дате');
		}
	});

	timeForEndHours.change(function() {
		if (timeForEndHours.val() != '' && timeForEndDate.val() != '') {
			messageSettings.text('Вы можете активировать только одно временное ограничение');
			postSettings.timeForEndHours = timeForEndHours.val();
			postSettings.timeForEnd = false;
		} else if (timeForEndHours.val() != '' && timeForEndDate.val() == '') {
			messageSettings.text('Ограничение по времени будет установлено при завершении');
			postSettings.timeForEnd = true;
			postSettings.timeForEndHours = timeForEndHours.val();
		} else if (timeForEndHours.val() == '') {
			messageSettings.text('Ограничение по количеству часов убрано');
			postSettings.timeForEndHours = '';
		}
		if (timeForEndHours.val() == '' && timeForEndDate.val() != '') {
			postSettings.timeForEnd = true;
		} else if (timeForEndDate.val() == '' && timeForEndHours.val() == '') {
			postSettings.timeForEnd = false;
		}
		console.log(postSettings.timeForEnd);
	});

	timeForEndDate.change(function() {
		if (timeForEndDate.val() != '' && timeForEndHours.val() != '') {
			messageSettings.text('Вы можете активировать только одно временное ограничение');
			postSettings.timeForEndDate = timeForEndDate.val();
			postSettings.timeForEnd = false;
		} else if (timeForEndDate.val() != '' && timeForEndHours.val() == '') {
			messageSettings.text('Ограничение по дате будет установлено при завершении');
			postSettings.timeForEnd = true;
			postSettings.timeForEndDate = timeForEndDate.val();
		} else if (timeForEndDate.val() == '') {
			messageSettings.text('Ограничение по дате убрано');
			postSettings.timeForEndDate = '';
		}
		if (timeForEndDate.val() == '' && timeForEndHours.val() != '') {
			postSettings.timeForEnd = true;
		} else if (timeForEndDate.val() == '' && timeForEndHours.val() == '') {
			postSettings.timeForEnd = false;
		}
		console.log(postSettings.timeForEnd);
	});

	goToSettings.click(function() {
		goToSettings.parent('div').toggle('slow');
		openSettings.toggle('fast');
		$('html,body').animate({
			scrollTop: $('.titleSettings').offset().top-15
		}, 1000);
	});

	titleSettings.click(function() {
		openSettings.toggle('slow');
		goToSettings.parent('div').toggle('slow');
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
					console.log(xhr.status);
					curItem.children('.status').empty().text('Такой формат не поддерживается');
					// status('Error: ' + xhr.status);
				},
				success: function(response) {
					if (response) {
						curItem.children('div').children('ul').children('li').children('.fileInputText').val('Загружено');
						// curItem.children('.status').empty().text('Success');
					} else {
						curItem.children('div').children('ul').children('li').children('.fileInputText').val('Неверный формат');
						// curItem.children('.status').empty().text('Error');
					}
					console.log('*******');
					console.log(response);
					console.log('*******');
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

		if (countItems < 2) {
			message.show();
			messageText.text('Количество объектов не может быть меньше двух.');
			$('html,body').animate({
				scrollTop: message.offset().top-100
			}, 400);
			return;
		}

		checkPostValues(function(checkResult) {
			if (checkResult) {
				console.log('nice');
			} else {
				message.show();
				messageText.text('Имя поста и имена объектов должны быть заполнены.');
				$('html,body').animate({
					scrollTop: message.offset().top-100
				}, 400);
				console.log('hui hui');
				return;
			}
		});

		var dataPostForm = $('#postForm :input').serializeArray();

		dataPostForm.push({ name: "postImg", value: postImg });
		dataPostForm.push({ name: "typeOfStructureItems", value: typeOfStructureItems });

		checkPostSettings(function(resultSettings) {
			console.log(resultSettings);
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

		console.log(dataPostForm);

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
					// step3.show();
					// var titleString = '<h2 id="header" class="text-center">' + response.postName + '</h2><div class="col-sm-12 col-md-10 col-md-offset-1 group-items-step3">';
					// for (var ii = 0; ii < response.items.length; ii++) {
					// 	itemsString += '<div class="col-sm-3 col-md-3 text-center"><div class="thumbnail"><h4 class="itemHeading1">' + response.items[ii].name + '</h4><div class="caption"><p class="itemDescription1">' + response.items[ii].desc + '</p></div><p><a href="#" role="button" class="btn btn-danger disabled">Голосовать</a></p></div></div>';
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
		console.log('!!!!!!!!');
		console.log(objSettings);
		console.log('!!!!!!!!');

		callback(objSettings);
	}

	function checkPostValues(callback) {
		if (postName.val() != '') {
			var itemsName = $('.itemName');
			for (var ii = 0; ii < itemsName.length; ii++) {
				if (itemsName[ii].value == '' || (Number(itemsName[ii].value.length) > 85)) {
					callback(false);
					return;
				}
			}
			callback(true);
		} else {
			callback(false);
		}
	}

});