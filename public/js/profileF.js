'use strict';
// функция запускается, когда страница готова

$(document).ready(function() {
  var posts = $('.posts'),
    btnVote = $('.btn-vote'),
    btnUnfollow = $('.btn-unfollow'),
    btnDeletePost = $('.delete-post'),
    profileSettings = $('#profile-settings'),
    subscriptionsFollowers = $('#subscriptions-followers'),
    bntFollow = $('#follow'),
    bntUnfollow = $('#unfollow'),
    subscriptions = $('#subscriptions'),
    subscriptionsViewOnly = $('#subscriptionsViewOnly'),
    followers = $('#followers'),
    followersViewOnly = $('#followersViewOnly'),
    userPosts = $('#userPosts');

  var currentProfile = location.pathname.split('/')[1];

  userPosts.click(function() {
    subscriptionsFollowers.hide();
    followersViewOnly.hide();
    subscriptionsViewOnly.hide();
    followers.show();
    subscriptions.show();
    posts.show();
  });

  btnVote.click(function() {
    var postIdVoted = this.value,
      itemId = this.name;
    var buttons = $('.btn' + postIdVoted);
    var statistics = $('.stat' + postIdVoted);
    var currentItem = $('#post' + itemId + 'Stat');
    var oldValue = currentItem.text();

    $.getJSON('/profile?vote=1&itemId=' + this.name + '&postId=' + this.value, function(response) {
      if (response.success) {
        console.log('success');
        $('#header').text('Ваш голос принят');
        currentItem.text(Number(oldValue) + 1);
        buttons.hide();
        statistics.show();
      } else if (response.warning == 'already voted') {
        // this.attr('disabled', true);
        console.log('already voted');
      } else {
        console.log('error');
        $('#header').text('Произошла ошибка');
      }
    });
  });

  bntFollow.click(function() {
    $(this).hide();
    $('#unfollow').show();
    var OldValueFollowers = followers.children('span').text(),
      OldValueFollowersViewOnly = followersViewOnly.children('span').text();

    $.getJSON('/profile?follow=1&profileId=' + this.value, function(response) {
      if (response.success) {
        followers.children('span').text(Number(OldValueFollowers) + 1);
        followersViewOnly.children('span').text(Number(OldValueFollowersViewOnly) + 1);
      } else {
        console.log('error');
      }
    });
  });

  bntUnfollow.click(function() {
    $(this).hide();
    $('#follow').show();
    var OldValueFollowers = followers.children('span').text(),
      OldValueFollowersViewOnly = followersViewOnly.children('span').text();

    $.getJSON('/profile?unfollow=1&profileId=' + this.value, function(response) {
      if (response.success) {
        followers.children('span').text(Number(OldValueFollowers) - 1);
        followersViewOnly.children('span').text(Number(OldValueFollowersViewOnly) - 1);
      } else {
        console.log('error');
      }
    });
  });


  function activationFollow () {
    $('.btn-subs-follow').click(function() {

      var OldValueSubscriptions = subscriptions.children('span').text(),
        OldValueSubscriptionsViewOnly = subscriptionsViewOnly.children('span').text();

      $(this).hide();
      $(this).next().show();

      $.getJSON('/' + currentProfile + '?follow=1&profileId=' + this.value, function(response) {
        if (response.success) {
          if (response.ownPage) {
            subscriptions.children('span').text(Number(OldValueSubscriptions) + 1);
            subscriptionsViewOnly.children('span').text(Number(OldValueSubscriptionsViewOnly) + 1);
          }
        } else {
          console.log('error');
        }
      });
    });
  };
  activationFollow();

  function activationUnFollow () {
    $('.btn-subs-unfollow').click(function() {

      var OldValueSubscriptions = subscriptions.children('span').text(),
        OldValueSubscriptionsViewOnly = subscriptionsViewOnly.children('span').text();

      $(this).hide();
      $(this).prev().show();

      $.getJSON('/' + currentProfile + '?unfollow=1&profileId=' + this.value, function(response) {
        if (response.success) {
          if (response.ownPage) {
            subscriptions.children('span').text(Number(OldValueSubscriptions) - 1);
            subscriptionsViewOnly.children('span').text(Number(OldValueSubscriptionsViewOnly) - 1);
          }
        } else {
          console.log('error');
        }
      });
    });
  };
  activationUnFollow();

  followers.click(function () {

    $.getJSON('/profile?followOrSubs=1&followers=1&profileName=' + currentProfile, function(response) {
      if (response.success) {
        posts.hide();
        followers.hide();
        $('#followersViewOnly').show();
        subscriptions.show();
        subscriptionsFollowers.children().remove();
        subscriptionsFollowers.show();
        $('#subscriptionsViewOnly').hide();
        var subsString = '';
        var btnString;
        for (var ii = 0; ii < response.subsInfo.length; ii ++) {
          if (response.currentUserId == response.subsInfo[ii].id || !response.currentUserId) {
            btnString = '';
          } else if (!response.subsInfo[ii].follow) {
            btnString = '<button class="btn btn-follow btn-subs-follow" type="submit" name="follow" value="' + response.subsInfo[ii].id + '">Подписаться</button><button style="display: none;" class="btn btn-unfollow btn-subs-unfollow" type="submit" name="unfollow" value="' + response.subsInfo[ii].id + '">Отписаться</button>';
          } else if (response.subsInfo[ii].follow) {
            btnString = '<button style="display: none;" class="btn btn-follow btn-subs-follow" type="submit" name="follow" value="' + response.subsInfo[ii].id + '">Подписаться</button><button class="btn btn-unfollow btn-subs-unfollow" type="submit" name="unfollow" value="' + response.subsInfo[ii].id + '">Отписаться</button>';
          }
          subsString += '<ul class = "subs col-md-12 col-sm-12 col-xs-12 list-inline"><li class="subs-logo">';
          if (response.subsInfo[ii].img != '') {
            subsString += '<p class="alignSubsImg"><img src="'+ response.subsInfo[ii].img +'"></p>';
          } else {
            subsString += '<p class="alignSubsImg"><img src="../images/noimage.png"></p>';
          }
          if (response.subsInfo[ii].login != '') {
            subsString += '</li><li class="subs-login"><a href="/' + response.subsInfo[ii].login + '">' + response.subsInfo[ii].login + '</a></li><li class="subs-btn">' + btnString + '</li></ul>';
          } else {
            subsString += '</li><li class="subs-login"><a href="/' + response.subsInfo[ii].id + '">' + response.subsInfo[ii].name + '</a></li><li class="subs-btn">' + btnString + '</li></ul>';
          }
        }
        subscriptionsFollowers.append(subsString);
        activationFollow();
        activationUnFollow();
      } else {
        console.log('error');
      }
    });
  });

  subscriptions.click(function () {
    $.getJSON('/profile?followOrSubs=1&subscriptions=1&profileName=' + currentProfile, function(response) {
      if (response.success) {
        posts.hide();
        followers.show();
        $('#followersViewOnly').hide();
        subscriptions.hide();
        $('#subscriptionsViewOnly').show();
        subscriptionsFollowers.children().remove();
        subscriptionsFollowers.show();
        var subsString = '';
        var btnString;
        for (var ii = 0; ii < response.subsInfo.length; ii ++) {
          if (response.currentUserId == response.subsInfo[ii].id || !response.currentUserId) {
            btnString = '';
          } else if (!response.subsInfo[ii].follow) {
            btnString = '<button class="btn btn-follow btn-subs-follow" name="follow" value="' + response.subsInfo[ii].id + '">Подписаться</button><button style="display: none;" class="btn btn-unfollow btn-subs-unfollow" type="submit" name="unfollow" value="' + response.subsInfo[ii].id + '">Отписаться</button>';
          } else if (response.subsInfo[ii].follow) {
            btnString = '<button style="display: none;" class="btn btn-follow btn-subs-follow" type="submit" name="follow" value="' + response.subsInfo[ii].id + '">Подписаться</button><button class="btn btn-unfollow btn-subs-unfollow" name="unfollow" value="' + response.subsInfo[ii].id + '">Отписаться</button>';
          }
          subsString += '<ul class = "subs col-md-12 col-sm-12 col-xs-12 list-inline"><li class="subs-logo">';
          if (response.subsInfo[ii].img != '') {
            subsString += '<p class="alignSubsImg"><img src="'+ response.subsInfo[ii].img +'"></p>';
          } else {
            subsString += '<p class="alignSubsImg"><img src="../images/noimage.png"></p>';
          }
          if (response.subsInfo[ii].login != '') {
            subsString += '</li><li class="subs-login"><a href="/' + response.subsInfo[ii].login + '">' + response.subsInfo[ii].login + '</a></li><li class="subs-btn">' + btnString + '</li></ul>';
          } else {
            subsString += '</li><li class="subs-login"><a href="/' + response.subsInfo[ii].id + '">' + response.subsInfo[ii].name + '</a></li><li class="subs-btn">' + btnString + '</li></ul>';
          }
        }
        subscriptionsFollowers.append(subsString);
        activationFollow();
        activationUnFollow();
      } else {
        console.log('error');
      }
    });
  });

});