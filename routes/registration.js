var express = require('express'),
	router = express.Router(),
	mysql = require('mysql'),
	crypto = require('crypto'),

	connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : '2177721',
		database : 'test'
	});

connection.connect(function(err) {
	if(!err) {
		console.log("Database is connected ... \n\n");
	} else {
		console.log("Error connecting database ... \n\n");
	}
});

/* GET test page. */
router.get('/', function(req, res, next) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('registration');
	}
});

function checkEnteredData(post) {
	if (!(post.login && post.password && post.email)) {
		console.log('empty');
		return {success: false, message: 'Заполните все поля'};
	}

	if (!(/^[\-\_a-zA-Z0-9]{4,20}$/.test(post.login))) {
		console.log('mistake in login');
		return {success: false, message: 'Логин должен содержать от 4 до 20 символов, разрешены только следующие специальные символы: (-,_)'};
	} else if (!(/^.{6,20}$/.test(post.password))) {
		console.log('mistake in password');
		return {success: false, message: 'Пароль должен содержать от 6 до 20 символов'};
	} else if (!(/^[\-\.\_a-zA-Z0-9]+@[a-zA-Z0-9\-]+\.[a-zA-Z]+\.?[a-zA-Z]*$/.test(post.email))) {
		console.log('mistake in email');
		return {success: false, message: 'Неправильная почта'};
	}
	return {success: true};
};

function checkForDuplicates(post ,callback) {
	connection.query('SELECT * from users where login = ?', post.login, function(err, rows, fields) {
		if (!err) {
			console.log(rows);
			if(rows != '') {
				callback(false);
			} else {
				callback(true);
			}
		} else {
			console.log(err);
			callback(false);
		}
	});
};

function passwordHash (password) {
	password = crypto.createHmac('sha1', '').update(password).digest('hex');
	return password;
};

router.post('/', function(req, res) {
	var post = req.body;
	var enteredData = checkEnteredData(post);

	if (enteredData.success) {
		checkForDuplicates(post, function(result) {
			if (result) {

				var password = post.password;

				password = passwordHash(password);

				var data = {login: post.login, password: password, email: post.email};

				var query = connection.query('INSERT INTO users SET ?', data, function(err, result) {
					connection.end();
					if (!err) {
						var userId = result.insertId;
						req.session.user = userId;
						req.session.login = data.login;

						res.json({success: true, userLogin: data.login});
					} else {
						console.log(err);
						res.json({success: false, message: 'Произошёл сбой, обратитесь к администрации'});
					}
				});
			} else {
				res.json({success: false, message: 'Пользователь с таким именем уже существует'});
			}
		});
	} else {
		res.json({success: false, message: enteredData.message});
	}

	// res.redirect('/');
});

module.exports = router;