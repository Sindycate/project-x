var express = require('express'),
  router = express.Router(),
  session = require('express-session');


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session);
  console.log(req.user);
  res.render('index', {profile: req.user});
  // res.render('index', {profile: req.session.login});
});

module.exports = router;

