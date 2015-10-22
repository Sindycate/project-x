var express = require('express'),
  router = express.Router(),
  mysql = require('mysql'),
  crypto = require('crypto'),

  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,

  connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '2177721',
    database : 'test'
  });

passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  connection.query("select * from users where id = "+id,function(err,rows){
    done(err, rows[0]);
  });
});

connection.connect(function(err) {
  if(!err) {
    console.log("Database is connected ... \n\n");
  } else {
    console.log("Error connecting database ... \n\n");
  }
});


passport.use('local-signup', new LocalStrategy(
  { passReqToCallback: true },
  function(req, username, password, done) {

    console.log(223);
    var post = req.body;
    var enteredData = checkEnteredData(post);

    if (enteredData.success) {
      checkForDuplicates(post, function(result) {
        if (result) {

          var password = post.password;

          password = passwordHash(password);

          var data = {login: post.username, password: password, email: post.email};

          var query = connection.query('INSERT INTO users SET ?', data, function(err, result) {
            // connection.end();
            if (!err) {
              var userId = result.insertId;
              req.user = userId;
              req.user.login = data.login;

              // res.json();
              return done(null, {id: userId, success: true, userLogin: data.login});
            } else {
              console.log(err);
              return done(null, false, { success: false, message: 'Произошёл сбой, обратитесь к администрации' });
            }
          });
        } else {
          return done(null, false, { success: false, message: 'Пользователь с таким именем уже существует' });
        }
      });
    } else {
      console.log(1212);
      return done(null, false, { success: false, message: enteredData.message });
    }

  }
));


/* GET test page. */
router.get('/', function(req, res, next) {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('registration');
  }
});

function checkEnteredData(post) {
  if (!(post.username && post.password && post.email)) {
    console.log('empty');
    return {success: false, message: 'Заполните все поля'};
  }

  if (!(/^[\-\_a-zA-Z0-9]{4,20}$/.test(post.username))) {
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
  connection.query('SELECT * from users where login = ?', post.username, function(err, rows, fields) {
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

function passwordHash(password) {
  password = crypto.createHmac('sha1', '').update(password).digest('hex');
  return password;
};

router.post('/', function(req, res, next) {

  passport.authenticate('local-signup', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      console.log(info, user, err);
      return res.json(info);
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }
      console.log(111, user, info);
      return res.json(user);
    });
  })(req, res, next);
});

module.exports = router;