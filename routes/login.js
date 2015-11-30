var express = require('express'),
  router = express.Router(),
  mysql = require('mysql'),
  crypto = require('crypto'),

  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  VKStrategy = require('passport-vkontakte').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  TwitterStrategy = require('passport-twitter').Strategy;


passport.serializeUser(function(user, done) {
   done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  connection.query("select id, login, name from users where id = " + id, function(err, rows) {
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

passport.use(new VKStrategy({
    clientID:     5168386, // VK.com docs call it 'API ID'
    clientSecret: 'R8zcDW6JU388oksivYgn',
    callbackURL:  "http://localhost:3000/login/vkontakte/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    generateNewUser(profile, 'vk', function(newUser) {
      checkSocial(newUser, function(err, result) {
        if (err) {
          return done(err);
        } else {
          return done(null, result);
        }
      });
    });
    // User.findOrCreate({ vkontakteId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
));

passport.use(new FacebookStrategy({
    clientID:     1104379766253076,
    clientSecret: '54793e6d1ba404840d71451d9baf082c',
    callbackURL:  "http://localhost:3000/login/facebook/callback",
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {

    // console.log(profile);
    // return;

    generateNewUser(profile, 'facebook', function(newUser) {
      checkSocial(newUser, function(err, result) {
        if (err) {
          return done(err);
        } else {
          return done(null, result);
        }
      });
    });
    // User.findOrCreate({ vkontakteId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
));

passport.use(new TwitterStrategy({
    consumerKey: 'Z7IJ6x3TvVJyIfICb7Gd9yDAB',
    consumerSecret: 'EhbZ6gBCXXXxDBMbi1fk2KALTitMnufI8SQnxA9PqICHvHj3NI',
    callbackURL: "http://127.0.0.1:3000/login/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {

    generateNewUser(profile, 'twitter', function(newUser) {
      checkSocial(newUser, function(err, result) {
        if (err) {
          return done(err);
        } else {
          return done(null, result);
        }
      });
    });
  }
));


router.get('/facebook', passport.authenticate('facebook'));
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

router.get('/vkontakte', passport.authenticate('vkontakte'));
router.get('/vkontakte/callback',
  passport.authenticate('vkontakte', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

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

function checkSocial(newUser, cb) {
  var query = 'SELECT * from social_auth where social_id = ?';
  console.log(newUser);
  connection.query(query, [newUser.id], function(err, rows, fields) {
    if (!err) {
      console.log('-');
      console.log(rows);
      if (rows != '') {
        cb(null, {id: rows[0].user_id});
      } else {
        connection.beginTransaction(function(err) {
          if (err) { throw err; }

          var newUserQuery = 'INSERT INTO `users` SET ?;'
          connection.query(
            newUserQuery, {
              login: newUser.login,
              name: newUser.name
            }, function(err, result, fields) {
            if (err) {
              cb(err);
              return connection.rollback(function() {
                throw err;
              });
            } else {
              var newSocialQuery = 'INSERT INTO `social_auth` (`user_id`, `social_id`, `social_site`) VALUES (?, ?, ?);'
              var user_id = result.insertId;
              console.log(newUser.id);
              var qwe = connection.query(newSocialQuery, [user_id, newUser.id, newUser.social_site], function(err, result, fields) {
                console.log(qwe);
                if (err) {
                  cb(err);
                  return connection.rollback(function() {
                    throw err;
                  });
                } else {
                  var profileName = (newUser.login) ? newUser.login : (newUser.name) ? newUser.name : newUser.id;

                  cb(null, {id: user_id, login: profileName});
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

function generateNewUser(profile, social_site, callback) {
  var newUser = {id: profile.id, social_site: social_site};
  newUser.name = (profile.displayName) ? profile.displayName : '';
  newUser.login = '';

  if (profile.username) {
    if ((social_site == 'vk' && /^id[0-9]*$/.exec(profile.username) != null) ||
      (social_site == 'facebook' && profile.username == undefined)) {
      return callback(newUser);
    }

    checkForDuplicates(profile.username, false, function(result) {
      if (!result) {
        newUser.login = profile.username;
      }
      callback(newUser);
    });
  } else {
    callback(newUser);
  }
}

function checkForDuplicates(username, password, callback) {

  var queryStr = '';

  if (password) {
    queryStr = 'and password =' + connection.escape(password);
  }

  var query = 'SELECT * FROM users WHERE login = ?' + queryStr;
  connection.query(query, [username], function(err, rows, fields) {
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
