var express = require('express'),
  router = express.Router(),
  session = require('express-session');

router.post('/', function(req, res) {
  var post = req.body;
  if (req.user.login) {

    res.render('posts', {data: result , items: result, profile: req.user});
  } else if (!req.user.login) {

    res.render('posts', {data: result , items: result});
  }
});


/* GET home page. */
router.get('/', function(req, res, next) {
  // console.log(req.query);
  if (req.query.vote && req.query.itemId && req.query.postId) {
    // проверка на авторизацию пользователя
    if (!req.user) {
      if (req.cookies['postIdVoted' + req.query.postId] != req.query.postId) {
        addVote(req.query.itemId, req.query.postId, function(result) {
          if (result) {
            res.cookie('postIdVoted' + req.query.postId, req.query.postId, { maxAge: 157680000000, httpOnly: true }); // 1000 * 60 * 60 * 24 * 365 * 5
            res.json({ success: true });
          } else {
            res.json({ success: false });
          }
        });
      } else {
        res.json({ success: false, warning: 'already voted' });
      }
      // если пользователь авторизирован, то начинается проверка на возможность голосовать
    } else {
      checkForVote(req.query.postId, req.user.id, function (result) {
        if (result) {
          addVote(req.query.itemId, req.query.postId, function (result) {
            if (result) {
              saveVotes(req.query.postId, req.query.itemId, req.user.id, function (result) {
                if (result) {
                  res.json({ success: true });
                } else {
                  res.json({ success: false });
                }
              });
            } else {
              res.json({ success: false });
            }
          });
        } else {
          res.json({ success: false, warning: 'already voted' });
        }
      });
    }
  } else {
    if(!req.user) {

      res.render('posts', {});
    } else {

      res.render('posts', {profile: req.user});
    }
  }
});

// function addVote2 (itemId ,callback) {
//   connection.query(
//     'UPDATE items SET items.votes = items.votes + 1 WHERE items.id = ?', itemId, function(err, result) {
//     if (!err) {
//       callback(true);
//     } else {
//       console.log('error');
//       callback(false);
//     }
//   });
// }

function addVote (itemId, postId, callback) {
  connection.query(
    'UPDATE items SET items.votes = items.votes + 1 WHERE items.id = ?', itemId, function(err, result) {
    if (!err) {
      connection.query('UPDATE posts SET posts.votes = posts.votes + 1 WHERE posts.id = ?', postId, function(err, result) {
        if (!err) {
          callback(true);
        } else {
          console.log('error');
          callback(false);
        }
      });
    } else {
      console.log('error');
      callback(false);
    }
  });
}

function saveVotes(postId, itemId, userId, callback) {
  connection.query(
    'INSERT INTO votes SET votes.user_id = ?, votes.post_id = ?, votes.item_id = ?', [userId, postId ,itemId], function(err, result) {
      if (!err) {
        callback(true);
      } else {
        console.log('error');
        callback(false);
      }
    }
  );
}

function checkForVote(postId, userId, callback) {
  connection.query('SELECT * FROM votes WHERE votes.user_id = ? and votes.post_id = ?', [userId, postId], function(err, rows, fields) {
    if (!err) {
      if(rows != '') {
        callback(false);
      } else {
        callback(true);
      }
    } else {
      console.log('error');
      callback(false);
    }
  });
}

module.exports = router;

