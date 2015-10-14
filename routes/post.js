var express = require('express'),
    router = express.Router(),
    session = require('express-session'),
    mysql = require('mysql');


connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '2177721',
  database : 'test'
});

router.get('/', function(req, res, next) {
  if (req.query.vote && req.query.itemNum && req.query.postId) {
    // проверка на авторизацию пользователя
    if (!req.session.login) {
      if (req.cookies['postIdVoted' + req.query.postId] != req.query.postId) {
        addVote(req.query.postId, req.query.itemId, function(result) {
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
      checkForVote(req.query.postId, req.session.user, function (result) {
        if (result) {
          console.log(req.query.itemId);
          addVote(req.query.itemId, function (result) {
            if (result) {
              console.log('test2');
              saveVotes(req.query.postId, req.query.itemId, req.session.user, function (result) {
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
    var postId = req.baseUrl.split('/')[2];
    var queryParams = {};

    if (!req.session.login) {
      queryParams.usersVotes = '';

      getPosts(queryParams, postId, function(result) {
        if (result) {
          if (result[postId].id == req.cookies['postIdVoted' + result[postId].id]) {
            result[postId].vote = 1;
          }

          res.render('post', {data: result[postId]});
        } else {
          res.render('post', {error: true, profile: false});
        }
      });
    } else {
      queryParams.usersVotes = ', (case when (SELECT count(*) FROM votes WHERE votes.user_id = ' + req.session.user + ' and votes.post_id = posts.id) then 1 else 0 end) as vote';

      getPosts(queryParams, postId, function(result) {
        if (result) {
          console.log(result[postId].date);
          // var date = result[postId].date;
          if (result[postId].postSettings.votes_limit) {
            result[postId].dateLimit = new Date(result[postId].date);
            result[postId].dateLimit.setHours(result[postId].dateLimit.getHours() + result[postId].postSettings.votes_limit);
          } else if (result[postId].postSettings.date_limit) {
            result[postId].dateLimit = result[postId].postSettings.date_limit;
          }
          console.log(result[postId]);
          res.render('post', {data: result[postId], profile: req.session.login});
        } else {
          res.render('post', {error: true, profile: req.session.login});
        }
      });
    }
  }
});

function getPosts(queryParams, postId, callback) {
  connection.query(
    'SELECT * \
    ' + queryParams.usersVotes + ', \
    (case when \
      (SELECT count(*) \
      FROM users_posts \
      WHERE users_posts.post_id = posts.id) \
      THEN (SELECT `users`.`login` \
        FROM users, users_posts \
        WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) else 0 end) as loginPostOwners \
    FROM posts \
    WHERE posts.id = ?', postId, function(err, queryPosts) {
    if (!err) {

      if (queryPosts == '') {
        callback(false);
        return;
      }

      var posts = {};
      for (var ii = 0; ii < queryPosts.length; ii++) {
        posts[queryPosts[ii].id] = queryPosts[ii];
      }

      getItems(postId, posts, function(items) {
        if (items) {
          getPostSettings(postId, posts, function(postSettings) {
            if (postSettings) {
              callback(posts);
            } else {
              callback(false);
            }
          });
        } else {
          callback(false);
        }
      });
      // connection.query('SELECT * FROM items WHERE post_id IN (' + postId + ')', function(err, items) {
      //  if (!err) {
      //    console.log(postId, posts, function(items) {

      //    });
      //    for (var ii = 0; ii < items.length; ii++) {
      //      if (typeof posts[items[ii].post_id].items == 'undefined') {
      //        posts[items[ii].post_id].items = [];
      //      }
      //      posts[items[ii].post_id].items.push(items[ii]);
      //    }
      //    callback(posts);
      //  } else {
      //    console.log(err);
      //    callback(false);
      //  }
      // });
    } else {
      console.log(err);
      callback(false);
    }
  });
}

function getItems(postId, posts, callback) {
  connection.query('SELECT * FROM items WHERE post_id IN (' + postId + ')', function(err, items) {
    if (!err) {
      var countVotesItems = 0;
      for (var ii = 0; ii < items.length; ii++) {
        if (typeof posts[items[ii].post_id].items == 'undefined') {
          posts[items[ii].post_id].items = [];
        }
        countVotesItems += items[ii].votes;
        posts[items[ii].post_id].items.push(items[ii]);
      }
      posts[postId].countVotesItems = countVotesItems;

      callback(true);
    } else {
      console.log(err);
      callback(false);
    }
  });
}

function getPostSettings(postId, posts, callback) {
  connection.query('SELECT * FROM post_settings WHERE post_id = ?', postId, function(err, postSettings) {
    if (!err) {
      posts[postId].postSettings = postSettings[0];

      callback(true);
    } else {
      console.log(err);
      callback(false);
    }
  });
}

function addVote(itemId ,callback) {
  connection.query(
    'UPDATE items SET items.votes = items.votes + 1 WHERE items.id = ?', itemId, function(err, result) {
    if (!err) {
      callback(true);
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
      console.log(rows);
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