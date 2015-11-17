var express = require('express'),
  router = express.Router(),
  session = require('express-session');

router.post('/', function(req, res, next) {
  var post = req.body;
  if (post.logOut && req.user) {
    req.logout();
    res.redirect(req.get('referer'));
  } else {
    console.log('error log out');
  }
  if (post.profileSettings && req.user) {
    res.redirect('/settings');
  } else {
    console.log('error settigns');
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  // просмотр информации о подписках или фолловерах
  if (req.query.followOrSubs && req.query.profileName) {
    console.log(req.query);
    var switchSubs = '';

    if (req.query.followers) {
      // выборка по фолловерам
      if (isNaN(req.query.profileName)) {
        switchSubs = 'WHERE followers.follower_id = (SELECT id FROM users WHERE login = ?) AND followers.user_id = users.id';
      } else {
        switchSubs = 'WHERE followers.follower_id = ? AND followers.user_id = users.id';
      }
      console.log(switchSubs);
    } else if (req.query.subscriptions) {
      // выборка по подпискам
      if (isNaN(req.query.profileName)) {
        switchSubs = 'WHERE followers.user_id = (SELECT id FROM users WHERE login = ?) AND followers.follower_id = users.id';
      } else {
        switchSubs = 'WHERE followers.user_id = ? AND followers.follower_id = users.id';
      }
    }
    if (req.user) {
      getSubsWhithLogin(switchSubs, req.user.id, req.query.profileName, function (subsInfo) {
        if (subsInfo) {
          res.json({ success: true, subsInfo: subsInfo, currentUserId: req.user.id });
        } else {
          res.json({ success: false });
        }
      });
    } else {
      getSubsNoLogin(switchSubs, req.query.profileName, function (subsInfo) {
        if (subsInfo) {
          res.json({ success: true, subsInfo: subsInfo});
        } else {
          res.json({ success: false });
        }
      });
    }
  // пользователь подписался
  } else if (req.query.follow && req.query.profileId) {
    var usersOwnPage;
    if (req.baseUrl.split('/')[1] == req.user.login) {
      usersOwnPage = true;
    }
    addFollower(req.user.id, req.query.profileId, function (result) {
      if (result) {
        res.json({ success: true, ownPage: usersOwnPage });
      } else {
        res.json({ success: false });
      }
    });
  // пользователь отписался
  } else if (req.query.unfollow && req.query.profileId) {
    var usersOwnPage;
    if (req.baseUrl.split('/')[1] == req.user.login) {
      usersOwnPage = true;
    }
    removeFollower(req.user.id, req.query.profileId, function (result) {
      if (result) {
        res.json({ success: true, ownPage: usersOwnPage });
      } else {
        res.json({ success: false });
      }
    });
  } else if (req.query.deletePost && req.query.postId) {

    var profileParams = {
      uniqueIdentifier: req.baseUrl.split('/')[1],
      field: '',
      url: '',
      name: ''
    }

    getUserInfo(profileParams, function (userInfo) {
      if (userInfo.id == req.user.id) {
        deletePost(req.query.postId, function (result) {
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
  // пользователь проголосовал
  } else if (req.query.vote && req.query.itemId && req.query.postId) {
    // проверка на авторизацию пользователя
    if (!req.user) {
      if (req.cookies['postIdVoted' + req.query.postId] != req.query.postId) {
        addVote(req.query.itemId, function(result) {
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
      // пользователь авторизирован, то начинается проверка на возможность голосовать
      } else {
        checkForVote(req.query.postId, req.user.id, function (result) {
          if (result) {
            addVote(req.query.itemId, function (result) {
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
  }
  else {

    var profileParams = {
      uniqueIdentifier: req.baseUrl.split('/')[1],
      field: ''
    }

    // checkProfile(profileParams);

    getUserInfo(profileParams, function (userInfo) {
      if (userInfo.id) {
        if (!req.user) {
          res.render('profile', {userInfo: userInfo, authorization: false, follow: false, unfollow: false});
        } else {
          checkForFollow(req.user.id, userInfo.id, function (resultFollow) {
            // пользователь может подписаться и он находится не на своей странице
            if (resultFollow && req.user.id != userInfo.id) {
              res.render('profile', {userInfo: userInfo, profile: req.user, authorization: true, follow: true, unfollow: false});
            // пользователь может отписатсья и он находится не на своей странице
            } else if (!resultFollow && req.user.id != userInfo.id) {
              res.render('profile', {userInfo: userInfo, profile: req.user, authorization: true, follow: false, unfollow: true});
            // пользователь на своей странице
            } else {
              res.render('profile', {userInfo: userInfo, profile: req.user, authorization: true, follow: false, unfollow: false});
            }
            // if (req.user.id == userInfo.id) {
            //   res.render('profile', {userInfo: userInfo, profile: req.user, authorization: true, follow: false, unfollow: false});
            // } else {
            //   checkForFollow(req.user.id, userInfo.id, function (resultFollow) {
            //     if (resultFollow) {
            //       res.render('profile', {userInfo: userInfo, profile: req.user, authorization: true, follow: true, unfollow: false});
            //     } else {
            //       res.render('profile', {userInfo: userInfo, profile: req.user, authorization: true, follow: false, unfollow: true});
            //     }
            //   });
            // }
          });
        }
      } else {
        // if (req.user.id) {
        //   res.render('profile', {error: true, profile: req.user});
        // } else {
          res.render('profile', {error: true,  profile: false});
        // }
      }
    });
  }
});

function getSubsWhithLogin (switchSubs, userId, profileLogin, callback) {
  connection.query(
    'SELECT \
      users.login, \
      users.id, \
      users.name, \
      users.img, \
      (case when (SELECT count(*) FROM followers WHERE followers.user_id = ? AND followers.follower_id = users.id ) then true else false end) as follow \
    FROM users, followers ' + switchSubs, [userId, profileLogin], function(err, result) {
      console.log(result);
      if (!err) {
        callback(result);
      } else {
        console.log('error');
        callback(false);
      }
    }
  );
}

function getSubsNoLogin (switchSubs, profileLogin, callback) {
  connection.query(
    'SELECT \
      users.login, \
      users.id, \
      users.img, \
      users.name \
    FROM users, followers ' + switchSubs, profileLogin, function(err, result) {
      console.log(result);
      if (!err) {
        callback(result);
      } else {
        console.log('error');
        callback(false);
      }
    }
  );
}

function addFollower (userId, followerId, callback) {
  connection.query(
    'INSERT INTO followers SET user_id = ?, follower_id = ?', [userId, followerId], function(err, result) {
      if (!err) {
        callback(true);
      } else {
        console.log('error');
        callback(false);
      }
    }
  );
}

function removeFollower (userId, followerId, callback) {
  connection.query(
    'DELETE FROM followers WHERE user_id = ? AND follower_id = ? LIMIT 1', [userId, followerId], function(err, result) {
      if (!err) {
        callback(true);
      } else {
        console.log('error');
        callback(false);
      }
    }
  );
}

function getUserInfo(profileParams, callback) {

  if (isNaN(profileParams.uniqueIdentifier)) {
    profileParams.field = 'login';
  } else {
    profileParams.field = 'id';
  }

  connection.query(
    'SELECT \
      users.id, \
      users.login, \
      users.name, \
      users.img, \
      users.about_user, \
      (SELECT count(*) from users_posts where users_posts.user_id = users.id) as count_posts, \
      (SELECT count(*) from followers where followers.user_id = users.id) as count_subscriptions, \
      (SELECT count(*) from followers where followers.follower_id = users.id) as count_followers \
    FROM \
      users \
    WHERE users.'+ profileParams.field +' = ?', profileParams.uniqueIdentifier, function(err, result) {
      if (!err && result.length != 0) {
        callback(result[0]);
      } else {
        console.log('error');
        callback(false);
      }
    }
  );
};

// function checkProfile(profileParams) {

//   if (isNaN(profileParams.uniqueIdentifier)) {
//     profileParams.field = 'login';
//   } else {
//     profileParams.field = 'id';
//   }

//   connection.query(
//     'SELECT \
//       users.id, \
//       users.login, \
//       (SELECT name from users_information WHERE users_posts.user_id = users.id) as count_posts, \
//     FROM \
//       users \
//     WHERE users.'+ profileParams.field +' = ?', profileParams.uniqueIdentifier, function(err, result) {
//       if (!err && result.length != 0) {
//         callback(result[0]);
//       } else {
//         console.log('error');
//         callback(false);
//       }
//     }
//   );
// };

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

function checkForFollow(userId, followerId, callback) {
  connection.query('SELECT * FROM followers WHERE user_id = ? and follower_id = ?', [userId, followerId], function(err, rows, fields) {
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

function deletePost(postId, callback) {
  connection.query(
    'DELETE FROM posts WHERE posts.id = ?', postId, function(err, result) {
      if (!err) {
        callback(true);
      } else {
        callback(false);
      }
    }
  );
}

module.exports = router;
