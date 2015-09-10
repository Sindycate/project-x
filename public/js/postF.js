'use strict';
// функция запускается, когда страница готова

$(document).ready(function() {
	var btnVote = $('.btn-vote');
	var statistics = $('.statistics');
	btnVote.click(function() {
		var postId = location.pathname.substr(6);
		var num = this.name;

		$.getJSON('/post/'+ postId + '?vote=1&itemId=' + this.value + '&itemNum=' + this.name + '&postId=' + postId, function(response) {
			if (response.success) {
				btnVote.hide();
				var oldvalue = $('#stat' + num).text();
				$('#stat' + num).text(Number(oldvalue) + 1).show();
				statistics.show();
			} else if (response.warning == 'already voted') {
				console.log('already voted');
			} else {
				console.log('error');
			}
		});
	});

});