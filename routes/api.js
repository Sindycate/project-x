var express = require('express'),
    router  = express.Router(),
    session = require('express-session'),
    mysql   = require('mysql'),
    _       = require("underscore");

router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.get('/getPost', function(req, res, next) {

  var queryParams = {
    usersVotes: '',
    sorting: {
      query: ' WHERE posts.id = "'+ req.query.postId + '" ',
      tables: 'posts'
    },
    orderBy: '',
    limit: ' LIMIT ' + req.query.offset + ', ' + req.query.countItems
  };

  if (req.user) {
    queryParams.usersVotes = ', (case when (SELECT count(*) FROM votes WHERE votes.user_id = ' + req.user.id + ' and votes.post_id = posts.id) then (SELECT votes.item_id FROM votes WHERE votes.user_id = ' + req.user.id + ' and votes.post_id = posts.id) else 0 end) as vote';
  }

  getPosts(queryParams, function(result) {

    if (!result.success && result.message == 'empty posts') {
      res.json({success: false, message: 'empty posts'});
      return;
    }

    if (result) {

      var userId = 0;

      if (!req.user) {
        for (var ii in result) {
          if (result[ii].id == req.cookies['postIdVoted' + result[ii].id]) {
            result[ii].vote = 1;
          }
        }
      } else {
        userId = req.user.id;
      }
      // console.log(result);
      res.json({success: true, posts: result, accessDel: false, userId: userId});
    } else {
      res.json({success: false});
    }
  });

});

router.get('/getPosts', function(req, res, next) {

  console.log(req.query.sorting);

  var queryParams = {
    usersVotes: '',
    sorting: {
      query: ' WHERE `posts`.`date` >= NOW() - INTERVAL 24 HOUR  ORDER BY `posts`.`votes` DESC ',
      tables: 'posts'
    },
    orderBy: 'popular',
    limit: ' LIMIT ' + req.query.offset + ', ' + req.query.countItems
  };

  if (req.user) {
    queryParams.usersVotes = ', (case when (SELECT count(*) FROM votes WHERE votes.user_id = ' + req.user.id + ' and votes.post_id = posts.id) then (SELECT votes.item_id FROM votes WHERE votes.user_id = ' + req.user.id + ' and votes.post_id = posts.id) else 0 end) as vote';
    if (req.query.sorting == 'mySubscriptions') {
      queryParams.sorting = {
        query: ' WHERE users_posts.post_id = posts.id AND followers.user_id = ' + req.user.id + ' and followers.follower_id = users_posts.user_id ',
        tables: '`users_posts`, `followers`, `posts`'
      };
    }
  }

  if (req.query.sorting == 'allTime') {
    queryParams.sorting = {
      query: ' ORDER BY `posts`.`votes` DESC ',
      tables: '`posts`'
    };
  } else if (req.query.sorting == 'today') {
    queryParams.sorting = {
      query: ' WHERE `posts`.`date` >= NOW() - INTERVAL 24 HOUR  ORDER BY `posts`.`votes` DESC ',
      tables: '`posts`'
    };
  }

  getPosts(queryParams, function(result) {

    if (!result.success && result.message == 'empty posts') {
      res.json({success: false, message: 'empty posts'});
      return;
    }

    if (result) {

      var userId = 0;


      // console.log(_.sortBy(result[1].items, 'votes').reverse());
      // result =  _.sortBy(result[1].items, 'votes');
      result = _.sortBy(result, 'date');
      result = _.sortBy(result, 'votes');
      result.reverse();

      if (!req.user) {
        for (var ii in result) {
          if (result[ii].id == req.cookies['postIdVoted' + result[ii].id]) {
            result[ii].vote = 1;
          }
        }
      } else {
        userId = req.user.id;
      }
      // console.log(result);
      res.json({success: true, posts: result, accessDel: false, userId: userId});
    } else {
      res.json({success: false});
    }
  });

});

router.get('/getUserPosts', function(req, res, next) {

  var queryParams = {
    usersVotes: '',
    sorting: {
      query: '',
      tables: '`users_posts`, `posts`',

    },
    limit: ' LIMIT ' + req.query.offset + ', ' + req.query.countItems
  };

  if (isNaN(req.query.profileName)) {
    queryParams.sorting.query = ' WHERE users_posts.post_id = posts.id AND users_posts.user_id = (SELECT id FROM users WHERE login = "' + req.query.profileName +'") ';
  } else {
    queryParams.sorting.query = ' WHERE users_posts.post_id = posts.id AND users_posts.user_id = "' + req.query.profileName +'" ';
  }

  if (req.user) {
    queryParams.usersVotes = ', (case when (SELECT count(*) FROM votes WHERE votes.user_id = ' + req.user.id + ' and votes.post_id = posts.id) then (SELECT votes.item_id FROM votes WHERE votes.user_id = ' + req.user.id + ' and votes.post_id = posts.id) else 0 end) as vote';
  }

  getPosts(queryParams, function(result) {
    if (!result.success && result.message == 'empty posts') {
      res.json({success: false, message: 'empty posts'});
      return;
    }

    if (result) {

      var userId = 0;

      // result = _.sortBy(result, 'date');
      // result.reverse();

      if (!req.user) {
        for (var ii in result) {
          if (result[ii].id == req.cookies['postIdVoted' + result[ii].id]) {
            result[ii].vote = 1;
          }
        }
      } else {
        var accessDel = false;
        userId = req.user.id;

        if (isNaN(req.query.profileName)) {
          if (req.user.login == req.query.profileName) {
            accessDel = true;
          }
        } else {
          if (req.user.id == req.query.profileName) {
            accessDel = true;
          }
        }
      }

      res.json({success: true, posts: result, accessDel: accessDel, userId: userId});
    } else {
      res.json({success: false});
    }
  });

});

 // если будет томорзить подгрузка постов, то нужно перенести на серверную часть блок с отображением владельцев постов (просто перебрать через массив все поля)

function getPosts(queryParams, callback) {
  connection.query(
    'SELECT * \
    ' + queryParams.usersVotes + ', \
    (case when \
      (SELECT count(*) \
      FROM users_posts, users \
      WHERE users_posts.post_id = posts.id and `users`.`login` != "" and `users`.`id` = `users_posts`.`user_id`) \
      then (SELECT `users`.`login` \
        FROM users, users_posts \
        WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
      else \
        (case when \
          (SELECT count(*) \
          FROM users_posts, users \
          WHERE users_posts.post_id = posts.id and `users`.`name` != "" and `users`.`id` = `users_posts`.`user_id`) \
          then (SELECT `users`.`name` \
            FROM users, users_posts \
            WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
          else \
            (case when \
              (SELECT count(*) \
              FROM users_posts \
              WHERE users_posts.post_id = posts.id) \
              then (SELECT `users`.`id` \
                FROM users, users_posts \
                WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
              else 0 \
              end) \
          end) \
      end) as loginPostOwners, \
    (case when \
      (SELECT count(*) \
      FROM users_posts, users \
      WHERE `users_posts`.`post_id` = `posts`.`id` and `users`.`login` = "" and `users`.`id` = `users_posts`.`user_id`) \
      then (SELECT `users`.`id` \
        FROM users, users_posts \
        WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
      else 0 \
      end) as loginPostOwnersId, \
    (case when \
      (SELECT count(*) \
      FROM users_posts, users \
      WHERE `users_posts`.`post_id` = `posts`.`id` and `users`.`id` = `users_posts`.`user_id`) \
      then (SELECT `users`.`img` \
        FROM users, users_posts \
        WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
      else "" \
      end) as imgProfile \
    FROM ' + queryParams.sorting.tables + queryParams.sorting.query + queryParams.limit, function(err, queryPosts) {

      console.log(' SELECT * \
    ' + queryParams.usersVotes + ', \
    (case when \
      (SELECT count(*) \
      FROM users_posts, users \
      WHERE users_posts.post_id = posts.id and `users`.`login` != "" and `users`.`id` = `users_posts`.`user_id`) \
      then (SELECT `users`.`login` \
        FROM users, users_posts \
        WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
      else \
        (case when \
          (SELECT count(*) \
          FROM users_posts, users \
          WHERE users_posts.post_id = posts.id and `users`.`name` != "" and `users`.`id` = `users_posts`.`user_id`) \
          then (SELECT `users`.`name` \
            FROM users, users_posts \
            WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
          else \
            (case when \
              (SELECT count(*) \
              FROM users_posts \
              WHERE users_posts.post_id = posts.id) \
              then (SELECT `users`.`id` \
                FROM users, users_posts \
                WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
              else 0 \
              end) \
          end) \
      end) as loginPostOwners, \
    (case when \
      (SELECT count(*) \
      FROM users_posts, users \
      WHERE `users_posts`.`post_id` = `posts`.`id` and `users`.`login` = "" and `users`.`id` = `users_posts`.`user_id`) \
      then (SELECT `users`.`id` \
        FROM users, users_posts \
        WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
      else 0 \
      end) as loginPostOwnersId, \
    (case when \
      (SELECT count(*) \
      FROM users_posts, users \
      WHERE `users_posts`.`post_id` = `posts`.`id` and `users`.`id` = `users_posts`.`user_id`) \
      then (SELECT `users`.`img` \
        FROM users, users_posts \
        WHERE users_posts.post_id = posts.id and users_posts.user_id = users.id) \
      else "" \
      end) as imgProfile \
    FROM ' + queryParams.sorting.tables + queryParams.sorting.query + queryParams.limit);

    if (Object.keys(queryPosts).length == 0) {
      console.log('empty posts');
      callback({success: false, message: 'empty posts'});
    } else if (!err) {
      var postsIdStr = '';
      var posts = {};
      for (var ii = 0; ii < queryPosts.length; ii++) {
        postsIdStr += ', ' + queryPosts[ii].id;
        posts[queryPosts[ii].id] = queryPosts[ii];
      }
      postsIdStr = postsIdStr.substr(2);

      getItems(postsIdStr, posts, function(result) {
        if (result) {
          getPostsSettings(postsIdStr, posts, function(resultSettings) {
            if (resultSettings) {
              callback(posts);
            } else {
              callback(false);
            }
          });
        } else {
          callback(false);
          return;
        }
      });
    } else {
      console.log(err);
      callback(false);
    }
  });
}

function getItems(postsIdStr, posts, callback) {
  connection.query('SELECT * FROM items WHERE post_id IN (' + postsIdStr + ')', function(err, items) {
    if (!err) {
      for (var ii = 0; ii < items.length; ii++) {
        if (typeof posts[items[ii].post_id].items == 'undefined') {
          posts[items[ii].post_id].items = [];
        }
        posts[items[ii].post_id].items.push(items[ii]);
        if (!posts[items[ii].post_id].countVotesItems) {
          posts[items[ii].post_id].countVotesItems = 0;
        }
        posts[items[ii].post_id].countVotesItems += items[ii].votes;
        posts[items[ii].post_id].items = _.sortBy(posts[items[ii].post_id].items, 'votes').reverse();
      }
      callback(true);
    } else {
      console.log(err);
      callback(false);
    }
  });
}

function getPostsSettings(postsIdStr, posts, callback) {
  connection.query('SELECT * FROM post_settings WHERE post_id IN (' +  postsIdStr + ')', function(err, postSettings) {
    if (!err) {
      for (var ii = 0; ii < postSettings.length; ii++) {
        posts[postSettings[ii].post_id].postSettings = postSettings[ii];

        if (posts[postSettings[ii].post_id].postSettings.hours_limit) {

          posts[postSettings[ii].post_id].dateLimit = new Date(posts[postSettings[ii].post_id].date);

          posts[postSettings[ii].post_id].dateLimit.setHours(posts[postSettings[ii].post_id].dateLimit.getHours() + posts[postSettings[ii].post_id].postSettings.hours_limit);

        } else if (posts[postSettings[ii].post_id].postSettings.date_limit) {
          posts[postSettings[ii].post_id].dateLimit = posts[postSettings[ii].post_id].postSettings.date_limit;
        }
      }
      callback(true);
    } else {
      console.log(err);
      callback(false);
    }
  });
}

module.exports = router;