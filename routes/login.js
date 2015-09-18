	var express = require('express'),
	router = express.Router(),
	mysql = require('mysql'),
	crypto = require('crypto');

router.get('/', function(req, res, next) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('login', {});
	}
});



router.post('/', function(req, res) {
	var post = req.body;

	if (!(post.password && post.login)) {
		res.json({success: false, message: 'Вы заполнили не все поля'});
		return;
	}
	post.password = passwordHash(post.password);

	checkForDuplicates(post, function (result, user) {
		console.log('test');
		if (result) {
			req.session.user = user.id;
			req.session.login = user.login;
			res.json({success: true, userLogin: user.login});
		} else {
			res.json({success: false, message: 'Логин или пароль не подходят'});
			return;
		}
	});
});

function checkForDuplicates(post, callback) {
	connection.query('SELECT * from users where login = ? and password = ?', [post.login, post.password], function(err, rows, fields) {
		if (!err) {
			console.log(rows);
			if(rows != '') {
				callback(true, rows[0]);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	});
};

function passwordHash(password) {
	password = crypto.createHmac('sha1', '').update(password).digest('hex');
	return password;
};

module.exports = router;
