'use strict';
// функция запускается, когда страница готова

$(document).ready(function() {
  var btnVote = $('.btn-vote');
  var statistics = $('.statistics');

  btnVote.click(function() {
    var postId = location.pathname.substr(6);
    var num = this.name;
    var oldValueVoteCounter = $('.votesCount').text();

    $.getJSON('/post/'+ postId + '?vote=1&itemId=' + this.value + '&itemNum=' + this.name + '&postId=' + postId, function(response) {
      if (response.success) {
        btnVote.hide();
        var oldvalue = $('#stat' + num).text();

        $('.votesCount').text((Number(oldValueVoteCounter) + 1));

        if ($('.statistics').length) {
          statistics.show();
          $('#stat' + num).text(Number(oldvalue) + 1).show();
        } else {
          $('.statInRow').show();
          $('#stat' + num).text(Number(oldvalue) + 1).show();
        }

      } else if (response.warning == 'already voted') {
        console.log('already voted');
      } else {
        console.log('error');
      }
    });
  });

  $('.dateLimit div').each(function(index, value) {
    var date = new Date(value.innerHTML);
    console.log(date.getHours(), date.getMinutes());
    value.innerHTML = (date.getHours() == 0 && date.getMinutes() == 0) ?
      date.toLocaleString().slice(0, -9) :
      date.toLocaleString().slice(0, -3);
  });

  getPostInfo();

  function getPostInfo() {
    console.log(location.pathname);
  }

});