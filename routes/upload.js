var express = require('express'),
    multer = require('multer'),
    router = express.Router();

// app.get('/',function(req,res){
//  res.sendFile(__dirname + "/index.html");
// });


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload/');
  },
  filename: function (req, file, cb) {
    var tmp = file.originalname.split('.')
    var newImgName = Date.now();
    cb(null, newImgName + '.' + tmp[tmp.length-1]);
  }
})

var upload = multer({
  // fileFilter: function(req, file, cb) {
  //  if (file.mimetype !== 'image/jpg' &&
  //      file.mimetype !== 'image/jpeg' &&
  //      file.mimetype !== 'image/gif' &&
  //      file.mimetype !== 'image/png') {

  //    // cb(null, false);
  //    cb(new Error('Type is not avaliable'));
  //    return;
  //  }

  //  cb(null, true);

  //  // You can always pass an error if something goes wrong:
  //  // cb(new Error('I don\'t have a clue!'))
  // },
  storage: storage
}).fields([
  { name: 'postImg', maxCount: 1 },
  { name: 'userIcon', maxCount: 1 },
  { name: 'itemImg1', maxCount: 1 },
  { name: 'itemImg2', maxCount: 1 },
  { name: 'itemImg3', maxCount: 1 },
  { name: 'itemImg4', maxCount: 1 }
]);


router.post('/image', function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      res.json(err);
      return;
    }

    if (!Object.keys(req.files).length) {
      res.json({access: false});
      return;
    }

    //работает для одного файла
    for (var ii in req.files) {
      var file = req.files[ii];
      console.log(file[0]);
      if (file.length === 0) {
        res.json({access: false, errorType: 'notFound'});
        return;
      } else if (file[0].size > 1024 * 1024 * 2) {
        res.json({access: false, errorType: 'oversize'});
        return;
      } else if (
        file[0].mimetype !== 'image/jpg' &&
        file[0].mimetype !== 'image/jpeg' &&
        file[0].mimetype !== 'image/png' &&
        file[0].mimetype !== 'image/gif') {
          res.json({access: false, errorType: 'wrongFormat'});
          return;
      } else {
        res.json({
          access: true,
          imgPath: file[0].path.replace('public', ''),
          imgName: ii
        });
        return;
      }
    }
  });
  // console.log(req.file);
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});



module.exports = router;
