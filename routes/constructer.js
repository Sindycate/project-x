var express = require('express'),
	  router = express.Router(),
	  session = require('express-session'),
	  mysql = require('mysql');

/* GET home page. */
router.get('/', function(req, res, next) {

	if (req.query.ajax && req.query.countItems) {
		res.json({ success: true });
	} else if (req.query.ajax && !req.query.countItems) {
		res.json({ success: false });
	} else {
		res.render('constructer', {profile: req.session.login});
	}
});

router.post('/', function(req, res) {
	var post = req.body;
	console.log('***');
	console.log(post);
	console.log('***');

	if (post.postName) {
		// проверка на заполненные имена объектов
		for (var ii = 0; ii < post.itemsName.length; ii++) {
			if (!post.itemsName[ii]) {
				res.json({ success: false, message: 'Нужно присвоить имена созданным объектам, либо удалить лишние'});
				return;
			}
		}

		try {
			connection.beginTransaction(function(err) {
				if (err) {
					throw err;
				}

				addPost(post, req.session.user, res);

			});
		} catch (err) {
			console.log(err);
			res.json({ success: false });
		}
	} else {
		res.json({ success: false, message: 'Чтобы продолжить, необходимо дать название вашему посту'});
	}
});


function addPost(post, userId, res) {
	var newPost = {title: post.postName, desc: post.postDesc, img: post.postImg};
	console.log(newPost);

	connection.query('INSERT INTO posts SET ?', newPost, function(err, result) {
		if (err) {
			return connection.rollback(function() {
				throw err;
			});
		}
		var postId = result.insertId;
		var items = [];

		for (var ii = 0; ii < post.itemsName.length; ii++) {
			addItem(ii, post, postId);
		}

		if (userId) {
			addUsersPost(userId, postId);
		}

		if (post.postSettings) {
			addPostSettings(post, postId);
		}

		console.log(post);
		for (var jj = 0; jj < post.itemsName.length; jj++) {
			items.push({name: post.itemsName[jj], desc: post.itemsDescription[jj]});
		}

		res.json({ success: true,
			postId: postId,
			postName: post.postName,
			items: items
		});
	});
}

function addItem(ii, post, postId) {

	var item = {post_id: postId, name: post.itemsName[ii], desc: post.itemsDescription[ii], img: post.itemsImage[ii]};
	connection.query('INSERT INTO items SET ?', item,
	function(err, result) {
		if (err) {
			return connection.rollback(function() {
				throw err;
			});
		}
		connection.commit(function(err) {
			if (err) {
				return connection.rollback(function() {
					throw err;
				});
			}
		});
	});
}

function addUsersPost(userId, postId) {
	var usersPost = {user_id: userId, post_id: postId};
	connection.query('INSERT INTO users_posts SET ?', usersPost, function(err, result) {
		if (err) {
			return connection.rollback(function() {
				throw err;
			});
		}
		connection.commit(function(err) {
			if (err) {
				return connection.rollback(function() {
					throw err;
				});
			}
		});
	});
}

function addPostSettings(post, postId) {
	var fullMode;
	if (post.typeOfStructureItems == 'full') {
		fullMode = 1;
	} else {
		fullMode = 0;
	}
	var dataSettings = {post_id: postId, full_mode: fullMode };
	if (post.countVotesForEnd) {
		dataSettings.votes_limit = post.countVotesForEnd;
	}
	if (post.timeForEndHours) {
		dataSettings.hours_limit = post.timeForEndHours;
	}
	if (post.timeForEndDate) {
		dataSettings.date_limit = post.timeForEndDate;
	}
	if (post.regOnly) {
		dataSettings.reg_only = 1;
	}
	connection.query('INSERT INTO post_settings SET ?', dataSettings, function(err, result) {
		if (err) {
			return connection.rollback(function() {
				throw err;
			});
		}
		connection.commit(function(err) {
			if (err) {
				return connection.rollback(function() {
					throw err;
				});
			}
		});
	});
}

module.exports = router;
