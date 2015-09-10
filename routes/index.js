var express = require('express'),
	router = express.Router(),
	session = require('express-session');


/* GET home page. */
router.get('/', function(req, res, next) {

	res.render('index', {profile: req.session.login});
});

module.exports = router;

