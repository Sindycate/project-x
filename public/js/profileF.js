'use strict';
// функция запускается, когда страница готова

$(document).ready(function() {
	var posts = $('.posts'),
		btnVote = $('.btn-vote'),
		btnUnfollow = $('.btn-unfollow'),
		btnDeletePost = $('.delete-post'),
		currentProfile = $('#login'),
		profileSettings = $('#profile-settings'),
		subscriptionsFollowers = $('#subscriptions-followers'),
		bntFollow = $('#btn-follow'),
		bntUnfollow = $('#btn-unfollow'),
		subscriptions = $('#subscriptions'),
		subscriptionsViewOnly = $('#subscriptionsViewOnly'),
		followers = $('#followers'),
		followersViewOnly = $('#followersViewOnly'),
		userPosts = $('#userPosts');

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
		$('#btn-unfollow').show();
		var OldValueFollowers = followers.children('span').text(),
			OldValueFollowersViewOnly = followersViewOnly.children('span').text();

		$.getJSON('/profile?follow=1&profileId=' + this.value, function(response) {
			if (response.success) {
				followers.children('span').text(Number(OldValueFollowers) + 1);
				followersViewOnly.children('span').text(Number(OldValueFollowersViewOnly) + 1);
				$('#follow-info').text('Подписка оформлена');
			} else {
				console.log('error');
			}
		});
	});

	bntUnfollow.click(function() {
		$(this).hide();
		$('#btn-follow').show();
		var OldValueFollowers = followers.children('span').text(),
			OldValueFollowersViewOnly = followersViewOnly.children('span').text();

		$.getJSON('/profile?unfollow=1&profileId=' + this.value, function(response) {
			if (response.success) {
				followers.children('span').text(Number(OldValueFollowers) - 1);
				followersViewOnly.children('span').text(Number(OldValueFollowersViewOnly) - 1);
				$('#follow-info').text('Вы успешно отписались');
			} else {
				console.log('error');
			}
		});
	});


	function activationFollow () {
		$('.btn-subs-follow').click(function() {

			var currentProfileName = currentProfile.text().substr(1),
				OldValueSubscriptions = subscriptions.children('span').text(),
				OldValueSubscriptionsViewOnly = subscriptionsViewOnly.children('span').text();

			$(this).hide();
			$(this).next().show();

			$.getJSON('/' + currentProfileName + '?follow=1&profileId=' + this.value, function(response) {
				if (response.success) {
					if (response.ownPage) {
						subscriptions.children('span').text(Number(OldValueSubscriptions) + 1);
						subscriptionsViewOnly.children('span').text(Number(OldValueSubscriptionsViewOnly) + 1);
					}
					$('#follow-info').text('Подписка оформлена');
				} else {
					console.log('error');
				}
			});
		});
	};
	activationFollow();

	function activationUnFollow () {
		$('.btn-subs-unfollow').click(function() {

			var currentProfileName = currentProfile.text().substr(1),
				OldValueSubscriptions = subscriptions.children('span').text(),
				OldValueSubscriptionsViewOnly = subscriptionsViewOnly.children('span').text();

			$(this).hide();
			$(this).prev().show();

			$.getJSON('/' + currentProfileName + '?unfollow=1&profileId=' + this.value, function(response) {
				if (response.success) {
					if (response.ownPage) {
						subscriptions.children('span').text(Number(OldValueSubscriptions) - 1);
						subscriptionsViewOnly.children('span').text(Number(OldValueSubscriptionsViewOnly) - 1);
					}
					$('#follow-info').text('Вы успешно отписались');
				} else {
					console.log('error');
				}
			});
		});
	};
	activationUnFollow();

	btnDeletePost.click(function(){
		var deletedPost = $('#post' + this.value);
		var oldCountPosts = userPosts.children('span').text();
		var checkForDelete = confirm("Вы уверены, что хотите удалить данный пост?");
		if (checkForDelete) {
			$.getJSON('/' + currentProfile.text().substr(1) + '?deletePost=1&postId=' + this.value, function(response) {
				if (response.success) {
					userPosts.children('span').text(Number(oldCountPosts) - 1);
					deletedPost.hide();
				} else {
					console.log('error');
				}
			});
		}
	});

	followers.click(function () {
		$.getJSON('/profile?followOrSubs=1&followers=1&profileLogin=' + currentProfile.text().substr(1), function(response) {
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
					if (response.currentUserId == response.subsInfo[ii].id) {
						btnString = '';
					} else if (!response.subsInfo[ii].follow) {
						btnString = '<button class="btn btn-success btn-follow btn-subs-follow" type="submit" name="follow" value="' + response.subsInfo[ii].id + '">Подписаться</button><button style="display: none;" class="btn unfollow btn-unfollow btn-subs-unfollow" type="submit" name="unfollow" value="' + response.subsInfo[ii].id + '">Отписаться</button>';
					} else if (response.subsInfo[ii].follow) {
						btnString = '<button style="display: none;" class="btn btn-success btn-follow btn-subs-follow" type="submit" name="follow" value="' + response.subsInfo[ii].id + '">Подписаться</button><button class="btn unfollow btn-unfollow btn-subs-unfollow" type="submit" name="unfollow" value="' + response.subsInfo[ii].id + '">Отписаться</button>';
					}
					subsString += '<ul class = "subs col-md-12 list-inline"><li class="subs-logo"></li><li class="subs-login"><a href="/' + response.subsInfo[ii].login + '">' + response.subsInfo[ii].login + '</a></li><li>' + btnString + '</li></ul>';
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
		$.getJSON('/profile?followOrSubs=1&subscriptions=1&profileLogin=' + currentProfile.text().substr(1), function(response) {
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
					if (response.currentUserId == response.subsInfo[ii].id) {
						btnString = '';
					} else if (!response.subsInfo[ii].follow) {
						btnString = '<button class="btn btn-success btn-follow btn-subs-follow" name="follow" value="' + response.subsInfo[ii].id + '">Подписаться</button><button style="display: none;" class="btn unfollow btn-unfollow btn-subs-unfollow" type="submit" name="unfollow" value="' + response.subsInfo[ii].id + '">Отписаться</button>';
					} else if (response.subsInfo[ii].follow) {
						btnString = '<button style="display: none;" class="btn btn-success btn-follow btn-subs-follow" type="submit" name="follow" value="' + response.subsInfo[ii].id + '">Подписаться</button><button class="btn unfollow btn-unfollow btn-subs-unfollow" name="unfollow" value="' + response.subsInfo[ii].id + '">Отписаться</button>';
					}
					subsString += '<ul class = "subs col-md-12 list-inline"><li class="subs-logo"></li><li class="subs-login"><a href="/' + response.subsInfo[ii].login + '">' + response.subsInfo[ii].login + '</a></li><li>' + btnString + '</li></ul>';
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