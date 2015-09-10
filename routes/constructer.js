var express = require('express'),
	  router = express.Router(),
	  session = require('express-session'),
	  mysql = require('mysql');

connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '2177721',
	database : 'test'
});



/* GET home page. */
router.get('/', function(req, res, next) {

	// console.log(req.cookies);

	if (req.query.ajax && req.query.countItems) {
		res.json({ success: true });
	} else if (req.query.ajax && !req.query.countItems) {
		res.json({ success: false });
	} else {
		res.render('constructer', {profile: req.session.login});
	}
});

router.post('/', function(req, res) {
	console.log(req.body);
	var post = req.body;
	if (post.postName) {
		// проверка на заполненные имена объектов
		for (var ii = 0; ii < post.itemsName.length; ii++) {
			if (!post.itemsName[ii]) {
				res.json({ success: false });
				return;
			}
		}

		try {
			connection.beginTransaction(function(err) {
				if (err) {
					throw err;
				}

				addPost2(post, req.session.user, res);

				// for (var ii = 0; ii < post.itemsName.length; ii++) {
				// 	addItem(ii, post, newPost, req.session.user, res);
				// }
			});
		} catch (err) {
			console.log(err);
			res.json({ success: false });
		}
	} else {
		res.json({ success: false });
	}
});


function addPost2(post, userId, res) {
	var newPost = {title: post.postName};
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
			addItem2(ii, post, postId);
		}

		if(userId) {
			addUsersPost(userId, postId);
		}

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

function addItem2(ii, post, postId) {

	var item = {post_id: postId, name: post.itemsName[ii], desc: post.itemsDescription[ii]};
	connection.query('INSERT INTO items SET ?',
	item,
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

// function addItem(ii, post, newPost, userId, res) {

// 	var item = {name: post.itemsName[ii], desc: post.itemsDescription[ii]};
// 	connection.query('INSERT INTO items SET ?',
// 	item,
// 	function(err, result) {
// 		if (err) {
// 			return connection.rollback(function() {
// 				throw err;
// 			});
// 		}
// 		newPost['item' + (ii + 1)] = result.insertId;
// 		if ((Object.keys(newPost).length - 1) === post.itemsName.length) {
// 			return addPost(newPost, post, userId, res);
// 		}
// 	});
// }

// function addPost(newPost, post, userId, res) {
// 	connection.query('INSERT INTO posts SET ?', newPost, function(err, result) {
// 		if (err) {
// 			return connection.rollback(function() {
// 				throw err;
// 			});
// 		}
// 		connection.commit(function(err) {
// 			if (err) {
// 				return connection.rollback(function() {
// 					throw err;
// 				});
// 			}
// 			var postId = result.insertId;
// 			console.log(postId);
// 			var items = [];
// 			for (var jj = 0; jj < post.itemsName.length; jj++) {
// 				items.push({name: post.itemsName[jj], desc: post.itemsDescription[jj]});
// 			}
// 			console.log(userId);
// 			if(userId) {
// 				addUsersPost(userId, postId);
// 			}
// 			res.json({ success: true,
// 				postId: postId,
// 				postName: post.postName,
// 				items: items
// 			});
// 		});
// 	});
// }

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

module.exports = router;
