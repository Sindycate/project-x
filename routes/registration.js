var express = require('express'),
  router = express.Router(),
  mysql = require('mysql'),
  crypto = require('crypto'),
  mailer = require('express-mailer'),
  emailVerification = require('../lib/email-verification.js'),

  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,

  connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '2177721',
    database : 'test'
  });

  var KEY = 'sf3j129asf9';
  var EMAIL_TO_ENCRYPT = 'alfredwesterveld@gmail.com'; // Email to encrypt.
  var encryptEmail = emailVerification.create(KEY);
  var encrypted = encryptEmail.encrypt(EMAIL_TO_ENCRYPT);
  var decrypted = encryptEmail.decrypt(encrypted);

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

    var post = req.body;
    var enteredData = checkEnteredData(post);

    if (enteredData.success) {
      checkForDuplicates(post, function(result) {
        if (result.response) {

          var EMAIL_TO_ENCRYPT = req.body.email,
            encryptEmail = emailVerification.create(KEY),
            encrypted = encryptEmail.encrypt(EMAIL_TO_ENCRYPT);

          var password = post.password;

          password = passwordHash(password);

          var data = {login: post.username, password: password, email: post.email, access_key: encrypted};

          var query = connection.query('INSERT INTO users SET ?', data, function(err, result) {
            // connection.end();
            if (!err) {


              var userId = result.insertId;
              req.user = userId;
              req.user.login = data.login;

              // res.json();
              return done(null, {id: userId, success: true, verifyCode: encrypted, email: post.email, userLogin: data.login});
            } else {
              console.log(err);
              return done(null, false, { success: false, message: 'Произошёл сбой, обратитесь к администрации' });
            }
          });
        } else {
          if (result.duplicate == 'login') {
            return done(null, false, { success: false, message: 'Пользователь с таким именем уже существует' });
          } else if (result.duplicate == 'email') {
            return done(null, false, { success: false, message: 'Пользователь с такой почтой уже существует' });
          } else {
            return done(null, false, { success: false, message: 'Ошибка' });
          }
        }
      });
    } else {
      return done(null, false, { success: false, message: enteredData.message });
    }

  }
));


function sendEmail(res, data, callback) {
  res.mailer.send('email', {
    to: data.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
    subject: 'Подтверждение аккаунта', // REQUIRED.
    verifyCode: data.verifyCode // All additional properties are also passed to the template as local variables.
  }, function (err) {
    if (err) {
      // handle error
      console.log(err);
      callback(false);
    }
    // console.log(res);
    callback(true);
    // res.send('Email Sent');
  });
}

/* GET test page. */
router.get('/', function(req, res, next) {
  if (req.query.verifyCode) {
    checkVerifyCode(req.query.verifyCode, function (user) {
      if (user.response) {
        req.logIn(user.data, function(err) {
          if (err) { return next(err); }
          res.redirect('/' + user.data.login);
        });
      } else {
        res.render('registration');
      }
    })

  } else if (req.user) {
    res.redirect('/');
  } else {
    console.log(decrypted); // alfredwesterveld@gmail.com
    console.log(encrypted); // 1fb70bd0756ac12c496bcdd4b48586b027b89164850af100e0d50e80103cf367
    res.render('registration');
  }
});

function checkEnteredData(post) {
  if (!(post.username && post.password && post.email)) {
    return {success: false, message: 'Заполните все поля!'};
  }

  if (!(/^[\-\_a-zA-Z0-9]{4,15}$/.test(post.username))) {
    return {success: false, message: 'Логин должен содержать от 4 до 15 символов, разрешены только следующие специальные символы: (-,_)'};
  } else if (!(/^.{6,20}$/.test(post.password))) {
    return {success: false, message: 'Пароль должен содержать от 6 до 20 символов'};
  } else if (!(/^[\-\.\_a-zA-Z0-9]+@[a-zA-Z0-9\-]+\.[a-zA-Z]+\.?[a-zA-Z]*$/.test(post.email))) {
    return {success: false, message: 'Неправильная почта'};
  }
  return {success: true};
};

function checkForDuplicates(post ,callback) {
  connection.query('SELECT * from users where login = ?', post.username, function(err, rows, fields) {
    if (!err) {
      if(rows != '') {
        callback({response: false, duplicate: 'login'});
      } else {
        connection.query('SELECT * from users where email = ?', post.email, function(err, rows, fields) {
          if (!err) {
            if(rows != '') {
              callback({response: false, duplicate: 'email'});
            } else {
              callback({response: true});
            }
          } else {
            console.log(err);
            callback({response: false});
          }
        });
      }
    } else {
      console.log(err);
      callback({response: false});
    }
  });
};

function passwordHash(password) {
  password = crypto.createHmac('sha1', '').update(password).digest('hex');
  return password;
};

function checkVerifyCode(verifyCode, callback) {
  connection.query('SELECT id, login from users where access_key = ?', verifyCode, function(err, rows, fields) {
    if (!err) {
      if(rows == '') {
        callback({response: false});
      } else {
        var data = rows[0];
        connection.query('UPDATE users SET email_confirmation = 1, access_key = "" WHERE id = ?', data.id, function(err, rows, fields) {
          if (!err) {
            callback({response: true, data: data});
          } else {
            console.log(err);
            callback({response: false});
          }
        });
      }
    } else {
      console.log(err);
      callback({response: false});
    }
  });
}

router.post('/', function(req, res, next) {

  passport.authenticate('local-signup', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      console.log(info, user, err);
      return res.json(info);
    }

    sendEmail(res, user, function(sendedEmail) {
      if (sendedEmail) {
        return res.json({ success: false, message: 'Письмо с подтверждением аккаунта было отправлено вам на почту' });
      } else {
        return res.json({ success: false, message: 'Произошла ошибка, письмо с подтверждением аккаунта не отправилось' });
      }
    });

    // req.logIn(user, function(err) {
    //   if (err) { return next(err); }
    //   console.log(111, user, info);
    //   return res.json(user);
    // });
  })(req, res, next);
});

module.exports = router;