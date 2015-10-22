var express = require('express'),
  router = express.Router(),
  mysql = require('mysql'),
  crypto = require('crypto'),

  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  TwitterStrategy = require('passport-twitter').Strategy;


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

passport.use(new TwitterStrategy({
    consumerKey: 'Z7IJ6x3TvVJyIfICb7Gd9yDAB',
    consumerSecret: 'EhbZ6gBCXXXxDBMbi1fk2KALTitMnufI8SQnxA9PqICHvHj3NI',
    callbackURL: "http://127.0.0.1:3000/login/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {

    checkSocial(profile.id, function(err, result) {
      if (err) {
        return done(err);
      } else {
        return done(null, result);
      }
    });
  }
));


router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

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

function checkSocial(id, cb) {
  var query = 'SELECT * from social_auth where social_id = ?';
  connection.query(query, [id], function(err, rows, fields) {
    if (!err) {
      if (rows != '') {
        cb(null, {id: rows[0].user_id});
      } else {
        connection.beginTransaction(function(err) {
          if (err) { throw err; }

          var newUserQuery = 'INSERT INTO `test`.`users` (`login`) VALUES (?);'
          connection.query(newUserQuery, [id], function(err, result, fields) {
            if (err) {
              cb(err);
              return connection.rollback(function() {
                throw err;
              });
            } else {
              var newSocialQuery = 'INSERT INTO `test`.`social_auth` (`user_id`, `social_id`, `social_site`) VALUES (?, ?, ?);'
              var user_id = result.insertId;
              connection.query(newSocialQuery, [user_id, id, 'twitter'], function(err, result, fields) {
                if (err) {
                  cb(err);
                  return connection.rollback(function() {
                    throw err;
                  });
                } else {
                  cb(null, {id: user_id, login: id});
                  connection.commit(function(err) {
                    if (err) {
                      return connection.rollback(function() {
                        throw err;
                      });
                    }
                  });
                }
              });
            }
          });
        });
      }
    } else {
      console.log(err);
      cb(err);
    }
  });
}

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
