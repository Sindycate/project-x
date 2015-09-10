'use strict';
// функция запускается, когда страница готова

$(document).ready(function() {
	var btnVote = $('.btn-vote');
	var sortAllPosts = $('#sortAllPosts');
	var sortFollowers = $('#sortFollowers');

	btnVote.click(function() {
		var postIdVoted = this.value;
		var buttons = $('.btn' + postIdVoted);
		var statistics = $('.stat' + postIdVoted);
		var currentItem = $('#post' + this.name + 'Stat');
		var oldValue = currentItem.text();

		$.getJSON('/posts?vote=1&itemId=' + this.name + '&postId=' + this.value, function(response) {
			if (response.success) {
				console.log('success');
				console.log(oldValue);
				currentItem.text(Number(oldValue) + 1);
				buttons.hide();
				statistics.show();
				$('#header').text('Ваш голос принят');
			} else if (response.warning == 'already voted') {
				console.log('already voted');
			} else {
				console.log('error');
				$('#header').text('Произошёл сбой, голос не засчитан');
			}
		});
	});

	sortFollowers.click(function() {

		// $.getJSON('/posts?sort=1&sortFollowers=1', function(response) {
		// 	if (response.success) {
		// 		console.log('success');
		// 	} else {
		// 		console.log('error');
		// 	}
		// });
	});

	sortAllPosts.click(function() {
		// $.getJSON('/posts?sort=1&sortAllPosts=1', function(response) {
		// 	if (response.success) {
		// 		console.log('success');
		// 	} else {
		// 		console.log('error');
		// 	}
		// });
	});

});