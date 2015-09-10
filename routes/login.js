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

router.get('/', function(req, res, next) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('login', {success: false});
	}
});


function checkForDuplicates(post, callback) {

	connection.query('SELECT * from users where login = ? and password = ?', [post.login, post.password], function(err, rows, fields) {
		// connection.end();
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

router.post('/', function(req, res) {
	var post = req.body;

	if (!(post.password && post.login)) {
		res.render('login', {success: false, message: 'Вы заполнили не все поля'});
	}
	post.password = passwordHash(post.password);
	console.log(post.password);

	checkForDuplicates(post, function (result, user) {
		if (result) {
			req.session.user = user.id;
			req.session.login = user.login;
			// res.render('login', {success: true, message: 'Вы успешно авторизировались!'});
			res.redirect('/' + user.login);
		} else {
			res.render('login', {success: false, message: 'Логин или пароль неверны'});
		}
	});
});

module.exports = router;
