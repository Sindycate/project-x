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

    // password = passwordHash(password);
    password = crypto.createHmac('sha1', '').update(password).digest('hex');

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

    // checkForDuplicates(username, password, function(result, user) {
    //   if (result) {
    //     // req.session.user = user.id;
    //     // req.session.login = user.login;
    //     // res.json({success: true, userLogin: user.login});
    //     return done(null, user);
    //   } else {
    //     res.json({success: false, message: 'Логин или пароль не подходят'});
    //     return done(null, false, { message: 'Incorrect username or password.' });
    //     return;
    //   }
    // });




    // User.findOne({ username: username }, function(err, user) {
    //   if (err) { return done(err); }
    //   if (!user) {
    //     return done(null, false, { message: 'Incorrect username.' });
    //   }
    //   if (!user.validPassword(password)) {
    //     return done(null, false, { message: 'Incorrect password.' });
    //   }
    //   return done(null, user);
    // });
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
  // ),
  // function(req, res) {
  //   console.log(255);
  //   console.log(req.user);
  //   res.json({success: true, userLogin: req.user.login});
    /*
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
  })
*/
// });

// router.post('/', function(req, res) {
//   var post = req.body;

//   if (!(post.password && post.login)) {
//     res.json({success: false, message: 'Вы заполнили не все поля'});
//     return;
//   }
//   post.password = passwordHash(post.password);

//   checkForDuplicates(post, function (result, user) {
//     console.log('test');
//     if (result) {
//       req.session.user = user.id;
//       req.session.login = user.login;
//       res.json({success: true, userLogin: user.login});
//     } else {
//       res.json({success: false, message: 'Логин или пароль не подходят'});
//       return;
//     }
//   });
// });

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

// function checkForDuplicates(post, callback) {
//   connection.query('SELECT * from users where login = ? and password = ?', [post.login, post.password], function(err, rows, fields) {
//     if (!err) {
//       console.log(rows);
//       if(rows != '') {
//         callback(true, rows[0]);
//       } else {
//         callback(false);
//       }
//     } else {
//       callback(false);
//     }
//   });
// };

function passwordHash(password) {
  password = crypto.createHmac('sha1', '').update(password).digest('hex');
  return password;
};

module.exports = router;
