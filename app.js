var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	SessionStore = require('express-mysql-session'),
	// multer = require('multer'),
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
// 	sass.middleware({
// 		src: __dirname + '/public/sass/css.sass', //where the sass files are
// 		dest: __dirname + '/public/css/test.css', //where css should go
// 		debug: true // obvious
// 	})
// );



// var storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, './public/images/upload/');
// 	},
// 	filename: function (req, file, cb) {
// 		console.log(file);
// 		cb(null, file.originalname);
// 	}
// })

// var upload = multer({
// 	storage: storage,
// 	fileFilter: function(req, file, cb) {
// 		if (file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
// 			cd(null, false);
// 		}

// 		cb(null, true);

// 		// You can always pass an error if something goes wrong:
// 		// cb(new Error('I don\'t have a clue!'))
// 	}
// }).single('userPhoto');

app.use(function(req, res, next) {

	if (!req.cookies.uid) {
		var str = Math.random().toString(36);
		res.cookie('uid', str, { maxAge: 157680000000, httpOnly: true }); // 1000 * 60 * 60 * 24 * 365 * 5
		res.clearCookie('vote');
	}
	next();
});

// app.post('/upload/image', function (req, res, next) {
// 	upload(req, res, function (err) {
// 		if (err) {
// 			console.log(err);
// 			console.log('err');
// 			res.json(err);
// 			// An error occurred when uploading
// 			return;
// 		}

// 		res.json(req.file);
// 		console.log(req.body);
// 		// Everything went fine
// 	})
// 	// console.log(req.file);
// 	// req.file is the `avatar` file
// 	// req.body will hold the text fields, if there were any
// });












// passport.serializeUser(function(user, done) {
// 		done(null, user.id);
//     });

//  passport.deserializeUser(function(id, done) {
// 		connection.query("select * from users where id = "+id,function(err,rows){
// 			done(err, rows[0]);
// 		});
//     });

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     console.log(1);
//     console.log(done);

//     // password = passwordHash(password);
//     password = crypto.createHmac('sha1', '').update(password).digest('hex');

//     var query = 'SELECT * from users where login = ? and password = ?';
//     connection.query(query, [username, password], function(err, rows, fields) {
//       if (!err) {
//         console.log(rows);
//         if(rows != '') {
//           return done(null,  rows[0]);
//         } else {
//           return done(null, false, { message: 'Incorrect username or password.' });
//         }
//       } else {
//         return done(null, false, { message: 'Incorrect username or password.' });
//       }
//     });

//     // checkForDuplicates(username, password, function(result, user) {
//     //   if (result) {
//     //     // req.session.user = user.id;
//     //     // req.session.login = user.login;
//     //     // res.json({success: true, userLogin: user.login});
//     //     return done(null, user);
//     //   } else {
//     //     res.json({success: false, message: 'Логин или пароль не подходят'});
//     //     return done(null, false, { message: 'Incorrect username or password.' });
//     //     return;
//     //   }
//     // });




//     // User.findOne({ username: username }, function(err, user) {
//     //   if (err) { return done(err); }
//     //   if (!user) {
//     //     return done(null, false, { message: 'Incorrect username.' });
//     //   }
//     //   if (!user.validPassword(password)) {
//     //     return done(null, false, { message: 'Incorrect password.' });
//     //   }
//     //   return done(null, user);
//     // });
//   }
// ));












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
