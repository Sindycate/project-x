var express = require('express'),
	router = express.Router(),
	session = require('express-session');

router.post('/', function(req, res, next) {
	var post = req.body;
	if (post.logOut && req.user.login) {
		console.log(333);
	// if (post.logOut && req.session.login) {
		// req.session.destroy();
		req.logout();
		res.redirect(req.get('referer'));
	} else {
		console.log('error log out');
	}
	if (post.profileSettings && req.user.login) {
	// if (post.profileSettings && req.session.login) {
		res.redirect('/settings');
	} else {
		console.log('error settigns');
	}
});

/* GET home page. */
router.get('/', function(req, res, next) {
	// просмотр информации о подписках или фолловерах
	if (req.query.followOrSubs && req.query.profileLogin) {
		var switchSubs;
		if (req.query.followers) {
			// выборка по фолловерам
			switchSubs = 'WHERE followers.follower_id = (SELECT id FROM users WHERE login = ?) AND followers.user_id = users.id';
		} else if (req.query.subscriptions) {
			// выборка по подпискам
			switchSubs = 'WHERE followers.user_id = (SELECT id FROM users WHERE login = ?) AND followers.follower_id = users.id';
		}
		if (req.user.id) {
			getSubsWhithLogin(switchSubs, req.user.id, req.query.profileLogin, function (subsInfo) {
				if (subsInfo) {
					res.json({ success: true, subsInfo: subsInfo, currentUserId: req.user.id });
				} else {
					res.json({ success: false });
				}
			});
		} else {
			getSubsNoLogin(req.query.profileLogin, function (subsInfo) {
				if (subsInfo) {
					res.json({ success: true, subsInfo: subsInfo});
				} else {
					res.json({ success: false });
				}
			});
		}
	// пользователь подписался
	} else if (req.query.follow && req.query.profileId) {
		var usersOwnPage;
		if (req.baseUrl.split('/')[1] == req.user.login) {
		// if (req.baseUrl.split('/')[1] == req.session.login) {
			usersOwnPage = true;
		}
		addFollower(req.user.id, req.query.profileId, function (result) {
			if (result) {
				res.json({ success: true, ownPage: usersOwnPage });
			} else {
				res.json({ success: false });
			}
		});
	// пользователь отписался
	} else if (req.query.unfollow && req.query.profileId) {
		var usersOwnPage;
		if (req.baseUrl.split('/')[1] == req.user.login) {
		// if (req.baseUrl.split('/')[1] == req.session.login) {
			usersOwnPage = true;
		}
		removeFollower(req.user.id, req.query.profileId, function (result) {
			if (result) {
				res.json({ success: true, ownPage: usersOwnPage });
			} else {
				res.json({ success: false });
			}
		});
	} else if (req.query.deletePost && req.query.postId) {
		var login = req.baseUrl.split('/')[1];
		console.log(login);
		checkProfile(login, function (userInfo) {
			if (userInfo.id == req.user.id) {
				deletePost(req.query.postId, function (result) {
					if (result) {
						res.json({ success: true });
					} else {
						res.json({ success: false });
					}
				});
			} else {
				res.json({ success: false });
			}
		});
	// пользователь проголосовал
	} else if (req.query.vote && req.query.itemId && req.query.postId) {
		// проверка на авторизацию пользователя
		if (!req.user) {
		// if (!req.user.login) {
		// if (!req.session.login) {
			if (req.cookies['postIdVoted' + req.query.postId] != req.query.postId) {
				addVote(req.query.itemId, function(result) {
					if (result) {
						res.cookie('postIdVoted' + req.query.postId, req.query.postId, { maxAge: 157680000000, httpOnly: true }); // 1000 * 60 * 60 * 24 * 365 * 5
						res.json({ success: true });
					} else {
						res.json({ success: false });
					}
				});
			} else {
				res.json({ success: false, warning: 'already voted' });
			}
			// пользователь авторизирован, то начинается проверка на возможность голосовать
			} else {
				checkForVote(req.query.postId, req.user.id, function (result) {
					if (result) {
						addVote(req.query.itemId, function (result) {
							if (result) {
								saveVotes(req.query.postId, req.query.itemId, req.user.id, function (result) {
									if (result) {
										res.json({ success: true });
									} else {
										res.json({ success: false });
									}
								});
							} else {
								res.json({ success: false });
							}
						});
					} else {
						res.json({ success: false, warning: 'already voted' });
					}
				});
			}
	} else {
		var login = req.baseUrl.split('/')[1];
		checkProfile(login, function (userInfo) {
			if (userInfo.id) {
				var queryParams = {
					usersVotes: '',
					sorting: {
						query: ' WHERE users_posts.post_id = posts.id AND users_posts.user_id = ' + userInfo.id,
						tables: '`users_posts`, `posts`'
					}
				};
				if (!req.user) {
				// if (!req.user.login) {
				// if (!req.session.login) {
					getPosts(queryParams ,function (result) {
						if (result) {
							for (var ii in result) {
								if (result[ii].id == req.cookies['postIdVoted' + result[ii].id]) {
									result[ii].vote = 1;
								}
							}
							res.render('profile', {data: result, userInfo: userInfo, authorization: false, follow: false, unfollow: false});
						} else {
							res.render('profile', {error: 'empty posts', userInfo: userInfo, authorization: false, follow: false, unfollow: false});
						}
					});
				} else {
					queryParams.usersVotes = ', (case when (SELECT count(*) FROM votes WHERE votes.user_id = ' + req.user.id + ' and votes.post_id = posts.id) then 1 else 0 end) as vote';
					queryParams.sorting.tables = '`users_posts`, `followers`, `posts`';
					getPosts(queryParams, function (result) {
						if (result) {
							checkForFollow(req.user.id, userInfo.id, function (resultFollow) {
								// пользователь может подписаться и он находится не на своей странице
								if (resultFollow && req.user.id != userInfo.id) {
									res.render('profile', {data: result, userInfo: userInfo, profile: req.user, authorization: true, follow: true, unfollow: false});
									// res.render('profile', {data: result, userInfo: userInfo, profile: req.session, authorization: true, follow: true, unfollow: false});
								// пользователь может отписатсья и он находится не на своей странице
								} else if (!resultFollow && req.user.id != userInfo.id) {
									res.render('profile', {data: result, userInfo: userInfo, profile: req.user, authorization: true, follow: false, unfollow: true});
									// res.render('profile', {data: result, userInfo: userInfo, profile: req.session, authorization: true, follow: false, unfollow: true});
								// пользователь на своей странице
								} else {
									console.log('err');
									res.render('profile', {data: result, userInfo: userInfo, profile: req.user, authorization: true, follow: false, unfollow: false});
									// res.render('profile', {data: result, userInfo: userInfo, profile: req.session, authorization: true, follow: false, unfollow: false});
								}
							});
						} else if (!result && req.user.id == userInfo.id) {
							res.render('profile', {error: 'empty posts', userInfo: userInfo, profile: req.user, authorization: true, follow: false, unfollow: false});
							// res.render('profile', {error: 'empty posts', userInfo: userInfo, profile: req.session, authorization: true, follow: false, unfollow: false});
						} else {
							checkForFollow(req.user.id, userInfo.id, function (resultFollow) {
								if (resultFollow) {
									res.render('profile', {error: 'empty posts', userInfo: userInfo, profile: req.user, authorization: true, follow: true, unfollow: false});
									// res.render('profile', {error: 'empty posts', userInfo: userInfo, profile: req.session, authorization: true, follow: true, unfollow: false});
								} else {
									res.render('profile', {error: 'empty posts', userInfo: userInfo, profile: req.user, authorization: true, follow: false, unfollow: true});
									// res.render('profile', {error: 'empty posts', userInfo: userInfo, profile: req.session, authorization: true, follow: false, unfollow: true});
								}
							});
						}
					});
				}
			} else {
				if (req.user.id) {
					res.render('profile', {error: true, profile: req.user});
					// res.render('profile', {error: true, profile: req.session});
				} else {
					res.render('profile', {error: true,  profile: false});
				}
			}
		});
	}
});

function getPosts(queryParams, callback) {
	connection.query(
		'SELECT * \
		' + queryParams.usersVotes + ', \
		(case when \
			(SELECT count(*) \
			FROM users_posts \
			WHERE users_posts.post_id = posts.id) \
			THEN (SELECT `users`.`login` \
				FROM users, users_posts \
				WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) else 0 end) as loginPostOwners \
		FROM ' + queryParams.sorting.tables + queryParams.sorting.query, function(err, queryPosts) {
		if (!err) {
			var postsIdStr = '';
			var posts = {};
			for (var ii = 0; ii < queryPosts.length; ii++) {
				postsIdStr += ', ' + queryPosts[ii].id;
				posts[queryPosts[ii].id] = queryPosts[ii];
			}
			postsIdStr = postsIdStr.substr(2);
			// console.log(postsIdStr);

			connection.query('SELECT * FROM items WHERE post_id IN (' + postsIdStr + ')', function(err, items) {
				if (!err) {
					// console.log(items);
					for (var ii = 0; ii < items.length; ii++) {
						if (typeof posts[items[ii].post_id].items == 'undefined') {
							posts[items[ii].post_id].items = [];
						}
						posts[items[ii].post_id].items.push(items[ii]);
					}
					callback(posts);
				} else {
					console.log(err);
					callback(false);
				}
			});
		} else {
			console.log(err);
			callback(false);
		}
	});
}


function getSubsWhithLogin (switchSubs, userId, profileLogin, callback) {
	connection.query(
		'SELECT \
			users.login, \
			users.id, \
			(case when (SELECT count(*) FROM followers WHERE followers.user_id = ? AND followers.follower_id = users.id ) then true else false end) as follow \
		FROM users, followers ' + switchSubs, [userId, profileLogin], function(err, result) {
			console.log(result);
			if (!err) {
				callback(result);
			} else {
				console.log('error');
				callback(false);
			}
		}
	);
}

function getSubsNoLogin (profileLogin, callback) {
	connection.query(
		'SELECT \
			users.login, \
			users.id \
		FROM users, followers ' + switchSubs, profileLogin, function(err, result) {
			console.log(result);
			if (!err) {
				callback(result);
			} else {
				console.log('error');
				callback(false);
			}
		}
	);
}

function addFollower (userId, followerId, callback) {
	connection.query(
		'INSERT INTO followers SET user_id = ?, follower_id = ?', [userId, followerId], function(err, result) {
			if (!err) {
				callback(true);
			} else {
				console.log('error');
				callback(false);
			}
		}
	);
}

function removeFollower (userId, followerId, callback) {
	connection.query(
		'DELETE FROM followers WHERE user_id = ? AND follower_id = ? LIMIT 1', [userId, followerId], function(err, result) {
			if (!err) {
				callback(true);
			} else {
				console.log('error');
				callback(false);
			}
		}
	);
}

function checkProfile(login, callback) {
	connection.query(
		'SELECT \
			users.id, \
			users.login, \
			(SELECT count(*) from users_posts where users_posts.user_id = users.id) as count_posts, \
			(SELECT count(*) from followers where followers.user_id = users.id) as count_subscriptions, \
			(SELECT count(*) from followers where followers.follower_id = users.id) as count_followers \
		FROM \
			users \
		WHERE users.login = ?', login, function(err, result) {
			console.log(result[0]);
			if (!err && result.length != 0) {
				callback(result[0]);
			} else {
				console.log('error');
				callback(false);
			}
		}
	);
};

// function getPostsNoLogin(profileId ,callback) {
// 	connection.query(
// 		'SELECT \
// 			`posts`.`id`, \
// 			`posts`.`date`, \
// 			`posts`.`title`, \
// 			i1.name as name1, \
// 			i2.name as name2, \
// 			i3.name as name3, \
// 			i4.name as name4, \
// 			i1.desc as desc1, \
// 			i2.desc as desc2, \
// 			i3.desc as desc3, \
// 			i4.desc as desc4, \
// 			i1.img  as img1, \
// 			i2.img  as img2, \
// 			i3.img  as img3, \
// 			i4.img  as img4, \
// 			i1.votes as votes1, \
// 			i2.votes as votes2, \
// 			i3.votes as votes3, \
// 			i4.votes as votes4 \
// 		FROM \
// 			`users_posts`, `posts` \
// 			LEFT JOIN \
// 				items as i1 \
// 			ON posts.item1 = i1.id \
// 			LEFT JOIN \
// 				items as i2 \
// 			ON posts.item2 = i2.id \
// 			LEFT JOIN \
// 				items as i3 \
// 			ON posts.item3 = i3.id \
// 			LEFT JOIN \
// 				items as i4 \
// 			ON posts.item4 = i4.id \
// 		WHERE users_posts.post_id = posts.id AND users_posts.user_id = ?', profileId, function(err, result) {
// 			if (!err && result[0] != null) {
// 				callback(result);
// 			} else {
// 				console.log('error');
// 				callback(false);
// 			}
// 		}
// 	);
// };

// function getPostsWithLogin(user_id, profileId, callback) {
// 	connection.query(
// 		'SELECT \
// 			`posts`.`id`, \
// 			`posts`.`date`, \
// 			`posts`.`title`, \
// 			i1.name as name1, \
// 			i2.name as name2, \
// 			i3.name as name3, \
// 			i4.name as name4, \
// 			i1.desc as desc1, \
// 			i2.desc as desc2, \
// 			i3.desc as desc3, \
// 			i4.desc as desc4, \
// 			i1.img  as img1, \
// 			i2.img  as img2, \
// 			i3.img  as img3, \
// 			i4.img  as img4, \
// 			i1.votes as votes1, \
// 			i2.votes as votes2, \
// 			i3.votes as votes3, \
// 			i4.votes as votes4, \
// 			(case when (SELECT count(*) from votes where votes.user_id = ' + user_id + ' and votes.post_id = posts.id) then 1 else 0 end) as vote \
// 		FROM \
// 			`users_posts`, `posts` \
// 			LEFT JOIN \
// 				items as i1 \
// 			ON posts.item1 = i1.id \
// 			LEFT JOIN \
// 				items as i2 \
// 			ON posts.item2 = i2.id \
// 			LEFT JOIN \
// 				items as i3 \
// 			ON posts.item3 = i3.id \
// 			LEFT JOIN \
// 				items as i4 \
// 			ON posts.item4 = i4.id \
// 		WHERE users_posts.post_id = posts.id AND users_posts.user_id = ?', profileId, function(err, result) {
// 			if (!err && result[0] != null) {
// 				// console.log(result);
// 				callback(result);
// 			} else {
// 				console.log('error');
// 				callback(false);
// 			}
// 		}
// 	);
// };

function addVote(itemId ,callback) {
	connection.query(
		'UPDATE items SET items.votes = items.votes + 1 WHERE items.id = ?', itemId, function(err, result) {
		if (!err) {
			callback(true);
		} else {
			console.log('error');
			callback(false);
		}
	});
}

function saveVotes(postId, itemId, userId, callback) {
	connection.query(
		'INSERT INTO votes SET votes.user_id = ?, votes.post_id = ?, votes.item_id = ?', [userId, postId ,itemId], function(err, result) {
			if (!err) {
				callback(true);
			} else {
				console.log('error');
				callback(false);
			}
		}
	);
}

function checkForVote(postId, userId, callback) {
	connection.query('SELECT * FROM votes WHERE votes.user_id = ? and votes.post_id = ?', [userId, postId], function(err, rows, fields) {
		if (!err) {
			console.log(rows);
			if(rows != '') {
				callback(false);
			} else {
				callback(true);
			}
		} else {
			console.log('error');
			callback(false);
		}
	});
}

function checkForFollow(userId, followerId, callback) {
	connection.query('SELECT * FROM followers WHERE user_id = ? and follower_id = ?', [userId, followerId], function(err, rows, fields) {
		if (!err) {
			console.log(rows);
			if(rows != '') {
				callback(false);
			} else {
				callback(true);
			}
		} else {
			console.log('error');
			callback(false);
		}
	});
}

function deletePost(postId, callback) {
	connection.query(
		'DELETE FROM posts WHERE posts.id = ?', postId, function(err, result) {
			if (!err) {
				callback(true);
			} else {
				callback(false);
			}
		}
	);
}

module.exports = router;

