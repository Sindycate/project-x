'use strict';
// функция запускается, когда страница готова
$(document).ready(function() {

	var step1    = $('.step1'),
		step2      = $('.step2'),
		step3      = $('.step3'),
		countItems = $('#countItems'),
		btnStep1   = $('.btn-step1'),
		btnStep2   = $('.btn-step2'),
		error      = $('.error'),
		item       = $('.item'),
		postStep3  = $('#postStep3');

	btnStep1.click(function() {
		$.getJSON('/constructer?ajax=1&countItems=' + countItems.val(), function(response) {
				if (response.success) {
					error.hide();
					step1.hide();
					step2.show();
					for (var jj = 1; jj < countItems.val(); jj++) {
						$(item).clone().appendTo('.group-items');
					}
					$('.itemName').each(function(i) {
						// $(this).attr('name', 'item' + (i + 1));
						$(this).attr('name', 'itemsName');
					});
					$('.itemDescribe').each(function(i) {
						// $(this).attr('name', 'item' + (i + 1) + 'Description' );
						$(this).attr('name', 'itemsDescription' );
					});
					$('.itemHeading').each(function(i) {
						$(this).text('Item ' + (i + 1));
					});
				} else {
					error.show();
				}
		});
	});

	btnStep2.click(function() {
			// var dataStep2 = $('#step2Form').serialize();
			var dataStep2 = $('#step2Form').serializeArray();
			var postString = '';
			var itemsString = '';
			console.log(dataStep2);
			$.ajax({
				type: "POST",
				url: '/constructer',
				data: dataStep2,
				success: function (response) {
					if (response.success) {
						step2.hide();
						step3.show();
						var titleString = '<h2 id="header" class="text-center">' + response.postName + '</h2><div class="col-sm-12 col-md-10 col-md-offset-1 group-items-step3">';
						for (var ii = 0; ii < response.items.length; ii++) {
							itemsString += '<div class="col-sm-3 col-md-3 text-center"><div class="thumbnail"><h4 class="itemHeading1">' + response.items[ii].name + '</h4><div class="caption"><p class="itemDescription1">' + response.items[ii].desc + '</p></div><p><a href="#" role="button" class="btn btn-danger disabled">Голосовать</a></p></div></div>';
						}
						postString = titleString + itemsString + '<div class="col-md-5 col-md-offset-6"><p>Post id: ' + response.postId + '</p><a type="submit" id="vote" class="btn btn-primary" href="post/' + response.postId + '">Go to vote</a></div></div>';
						postStep3.append(postString);

					} else if (!response.success) {
						error.show();
					}
				},
				dataType: 'json'
			});
	});

	// btnStep2.click(function() {
	// 		// var dataStep2 = $('#step2Form').serialize();
	// 		var dataStep2 = $('#step2Form').serializeArray();
	// 		console.log(dataStep2);
	// 		$.ajax({
	// 			type: "POST",
	// 			url: '/constructer',
	// 			data: dataStep2,
	// 			success: function (response) {
	// 				if (response.success) {
	// 					step2.hide();
	// 					step3.show();
	// 					$('#header').text(response.postName);
	// 					// console.log(response);
	// 					for (var ii = 0; ii < response.items.length; ii++) {
	// 						$('#item' + (ii+1) + '-step3').show();
	// 						$('.itemHeading' + (ii+1)).text(response.items[ii].name);
	// 						$('.itemDescription' + (ii+1)).text(response.items[ii].desc);
	// 						$('#postLink').text('Post id: ' + response.postId);
	// 						$('#vote').attr('href', 'post/' + response.postId);
	// 					}
	// 				} else if (!response.success) {
	// 					error.show();
	// 				}
	// 			},
	// 			dataType: 'json'
	// 		});
	// });

});