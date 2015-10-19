var express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  SessionStore = require('express-mysql-session'),
  sass = require('node-sass');

var routes = require('./routes/index'),
  login = require('./routes/login'),
  registration = require('./routes/registration'),
  constructer = require('./routes/constructer'),
  post = require('./routes/post'),
  posts = require('./routes/posts'),
  profile = require('./routes/profile'),
  upload = require('./routes/upload'),
  profileSettings = require('./routes/profileSettings')
  passport = require('passport');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var options = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
};

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 157680000000 },
  store: new SessionStore(options)
}));

app.use(passport.initialize());
app.use(passport.session());


// app.use(function(){
//   sass.middleware({
//     src: __dirname + '/public/sass/css.sass',
//     dest: __dirname + '/public/css/test.css',
//     debug: true
//   });
// });

// app.use(
//  sass.middleware({
//    src: __dirname + '/public/sass/css.sass', //where the sass files are
//    dest: __dirname + '/public/css/test.css', //where css should go
//    debug: true // obvious
//  })
// );

app.use(function(req, res, next) {

  if (!req.cookies.uid) {
    var str = Math.random().toString(36);
    res.cookie('uid', str, { maxAge: 157680000000, httpOnly: true }); // 1000 * 60 * 60 * 24 * 365 * 5
    res.clearCookie('vote');
  }
  next();
});

app.use('/posts', posts);
app.use('/post/[0-9]*$/', post);
app.use('/', routes);
app.use('/registration', registration);
app.use('/login', login);
app.use('/constructer', constructer);
app.use('/upload', upload);
app.use('/settings', profileSettings);

app.use('/[a-zA-Z0-9_]+$/', profile);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// // production error handler
// // no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err.message);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
