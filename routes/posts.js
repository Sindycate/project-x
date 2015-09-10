var express = require('express');
var router = express.Router();
var session = require('express-session');

router.post('/', function(req, res) {
	var post = req.body;
	if (post.sort && req.session.login) {
			var queryParams = {
				usersVotes: ', (case when (SELECT count(*) FROM votes WHERE votes.user_id = ' + req.session.user + ' and votes.post_id = posts.id) then 1 else 0 end) as vote'
			};
			if (post.sortFollowers) {
				queryParams.sorting = {
					query: ' WHERE users_posts.post_id = posts.id AND followers.user_id = ' + req.session.user + ' and followers.follower_id = users_posts.user_id ',
					tables: '`users_posts`, `followers`, `posts`'
				};
			} else if (post.sortAllPosts) {
				console.log('sortAll');
				queryParams.sorting = {
					query: '',
					tables: '`posts`'
				};
			}
			console.log(queryParams);
			getPosts(queryParams, function (result) {
					if (result) {
						res.render('posts', {data: result , items: result, profile: req.session.login});
					} else {
						res.render('posts', {error: 'Empty followers posts', profile: req.session.login});
					}
			});
		} else if (post.sort && !req.session.login) {
			console.log('test');
			var queryParams = {
				usersVotes: ''
			};
			if (post.sortAllPosts) {
				queryParams.sorting = {
					query: '',
					tables: '`posts`'
				};
			}

			console.log(queryParams);
			getPosts(queryParams, function (result) {
					if (result) {
						for (var ii in result) {
							if (result[ii].id == req.cookies['postIdVoted' + result[ii].id]) {
								result[ii].vote = 1;
							}
						}
						res.render('posts', {data: result , items: result});
					} else {
						res.render('posts', {error: true});
					}
			});
		}
});


/* GET home page. */
router.get('/', function(req, res, next) {
	// console.log(req.query);
	if (req.query.vote && req.query.itemId && req.query.postId) {
		// проверка на авторизацию пользователя
		if (!req.session.login) {
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
			// если пользователь авторизирован, то начинается проверка на возможность голосовать
		} else {
			checkForVote(req.query.postId, req.session.user, function (result) {
				if (result) {
					addVote(req.query.itemId, function (result) {
						if (result) {
							saveVotes(req.query.postId, req.query.itemId, req.session.user, function (result) {
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
		if(!req.session.login) {
			var queryParams = {
				usersVotes: '',
				sorting: {
					query: '',
					tables: '`posts`'
				}
			};
			getPosts(queryParams, function (result) {
				if (result) {
					for (var ii in result) {
						if (result[ii].id == req.cookies['postIdVoted' + result[ii].id]) {
							result[ii].vote = 1;
						}
					}
					res.render('posts', {data: result , items: result});
				} else {
					console.log('error');
					res.render('posts', {error: true});
				}
			});
		} else {
			var queryParams = {
				usersVotes: ', (case when (SELECT count(*) FROM votes WHERE votes.user_id = ' + req.session.user + ' and votes.post_id = posts.id) then 1 else 0 end) as vote',
				sorting: {
					query: '',
					tables: '`posts`'
				}
			};
			getPosts(queryParams, function(posts) {
				if (posts) {
					res.render('posts', {data: posts , items: posts, profile: req.session.login});
				} else {
					res.render('posts', {error: true, profile: req.session.login});
				}
			});
		}
	}
	// res.render('posts', {});
});

function getPosts(queryParams, callback) {
	connection.query(
		'SELECT * \
		' + queryParams.usersVotes + ', \
		(case when \
			(SELECT count(*) \
			FROM users_posts \
			WHERE users_posts.post_id = posts.id) \
			then (SELECT `users`.`login` \
				FROM users, users_posts \
				WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
			else 0 end) as loginPostOwners \
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

module.exports = router;

