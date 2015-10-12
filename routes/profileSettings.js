var express = require('express'),
	router = express.Router(),
	crypto = require('crypto'),
	session = require('express-session');

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.user.login) {
		if (req.query.mainSettingsChange) {
			var dataForUpdate = {};
			if (req.query.login) {
				dataForUpdate.login = req.query.login;
			}
			if (req.query.password) {
				dataForUpdate.password = passwordHash(req.query.password);
			}
			if (req.query.email) {
				dataForUpdate.email = req.query.email;
			}
			changeUserInformation(dataForUpdate, req.user.id, req, res);
		} else if (req.query.personalSettingsChange) {
			var dataForUpdate = {};
			if (req.query.name) {
				dataForUpdate.name = req.query.name;
			}
			if (req.query.lastName) {
				dataForUpdate.last_name = req.query.lastName;
			}
			if (req.query.about) {
				dataForUpdate.about_user = req.query.about;
			}
			dataForUpdate.user_id = req.user.id;
			changePersonalUserInfo(dataForUpdate, req, res);

		} else if (req.query.checkDuplicate) {
			var parameters = {};
			if (req.query.login) {
				parameters = {type: 'login', value: req.query.login};
			} else if (req.query.email) {
				parameters = {type: 'email', value: req.query.email};
			}
			checkForDuplicate(parameters, res);
		} else if (req.query.checkPassword && req.query.password) {
			var password = passwordHash(req.query.password);
			checkPassword(password, req.user.login, res);
		} else {
			getUserInfo(req.user.id, res, req.user);
		}
	} else {
		res.redirect('/');
	}
});

function changePersonalUserInfo(dataForUpdate, req, res) {
	connection.query(
		'INSERT INTO users_information SET ? ON DUPLICATE KEY UPDATE ?', [dataForUpdate, dataForUpdate], function(err, result) {
		if (!err) {
			res.json({ success: true });
		} else {
			console.log(err);
			res.json({ success: false });
		}
	});
}

function getUserInfo(userId, res, profile) {
	connection.query(
		'SELECT login, email, u_info.name, u_info.last_name, u_info.about_user \
		 FROM `users` as u \
		 LEFT OUTER JOIN `users_information` as u_info \
		  on `u`.`id` = `u_info`.`user_id` \
		 WHERE `u`.`id` = ?', userId, function(err, information) {
			if (!err) {
				console.log(information);
				res.render('profileSettings', {profile: profile, userInfo: information[0]});
			} else {
				console.log(err);
			}
		});
}

function checkForDuplicate(parameters, res) {
	connection.query('SELECT * from users where ' + parameters.type + ' = ?', parameters.value, function(err, rows, fields) {
		if (!err) {
			if(rows != '') {
				res.json({ success: false });
			} else {
				res.json({ success: true });
			}
		} else {
			console.log(err);
			res.json({ success: false });
		}
	});
};


function checkPassword(password, login,res) {
	connection.query('SELECT * from users where password = ? and login = ?', [password, login], function(err, rows, fields) {
		if (!err) {
			if(rows != '') {
				res.json({ success: true });
			} else {
				res.json({ success: false });
			}
		} else {
			console.log(err);
			res.json({ success: false });
		}
	});
};


function passwordHash (password) {
	password = crypto.createHmac('sha1', '').update(password).digest('hex');
	return password;
};

function changeUserInformation(dataForUpdate, userId, req, res) {
	connection.query(
		'UPDATE users SET ? WHERE id = ' + userId, dataForUpdate, function(err, result) {
		if (!err) {
			if (dataForUpdate.login) {
				req.user.login = dataForUpdate.login;
			}
			res.json({ success: true });
		} else {
			console.log('error');
			res.json({ success: false });
		}
	});
}



module.exports = router;
