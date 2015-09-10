var express = require('express');
var router = express.Router();
var session = require('express-session');

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.login) {
		res.render('profileSettings', {profile: req.session.login});
	} else {
		res.redirect('/');
	}
});

module.exports = router;
