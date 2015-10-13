var express = require('express'),
  router = express.Router(),
  mysql = require('mysql'),
  crypto = require('crypto'),

  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user, done) {
   done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  connection.query("select * from users where id = "+id,function(err,rows){
    console.log(rows);
    done(err, rows[0]);
  });
});

passport.use('local-login', new LocalStrategy(
  function(username, password, done) {

    password = passwordHash(password);
    // password = crypto.createHmac('sha1', '').update(password).digest('hex');

    var query = 'SELECT * from users where login = ? and password = ?';
    connection.query(query, [username, password], function(err, rows, fields) {
      if (!err) {
        console.log(rows);
        if(rows != '') {
          return done(null, rows[0]);
        } else {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
      } else {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
    });
  }
));

router.get('/', function(req, res, next) {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('login', {});
  }
});

router.post('/', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      return res.json({success: false, message: 'Логин или пароль не подходят'});
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.json({success: true, userLogin: req.user.login});
    });
  })(req, res, next);
});

function checkForDuplicates(username, password, callback) {

  var query = 'SELECT * from users where login = ? and password = ?';
  connection.query(query, [username, password], function(err, rows, fields) {
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
