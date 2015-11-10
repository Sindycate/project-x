'use strict';

$(document).ready(function() {

  var sortFollowers = $('.sortFollowers'),
      sortAllPosts  = $('.sortAllPosts'),
      posts  = $('.posts');

  var loadingPosts = true;

  var currentPage = location.pathname.split('/')[1];

  if (currentPage != 'posts' && currentPage != 'post') {
    currentPage = 'profile';
  }


  var queryParams = {
    posts: {
      url: 'getPosts',
      countItems: 1,
      offset: 0,
      postId: '',
      profileName: ''
    },
    post: {
      url: 'getPost',
      countItems: 1,
      offset: 0,
      postId: location.pathname.split('/')[2],
      profileName: ''
    },
    profile: {
      url: 'getUserPosts',
      countItems: 1,
      offset: 0,
      postId: '',
      profileName: location.pathname.split('/')[1]
    },
    sorting: ''
  };

  sortFollowers.click(function() {
    loadingPosts = true;
    queryParams[currentPage].offset = 0;
    sortAllPosts.removeAttr('id', '');
    sortFollowers.attr('id', 'activeSorting');
    $('.post').parent('div').remove();
    $('.empty-posts').remove();
    queryParams.sorting = 'mySubscriptions';
    getPosts();
  });

  sortAllPosts.click(function() {
    loadingPosts = true;
    queryParams[currentPage].offset = 0;
    sortFollowers.removeAttr('id', '');
    sortAllPosts.attr('id', 'activeSorting');
    $('.post').parent('div').remove();
    $('.empty-posts').remove();
    queryParams.sorting = 'allPosts';
    getPosts();
  });

  $(window).scroll(function() {
    if($(window).scrollTop() > $(document).height() - $(window).height() - 200) {
      if (currentPage != 'post' && loadingPosts) {
        console.log(queryParams[currentPage].offset++);
        getPosts();
      }
    }
  });
  getPosts();

  function getPosts() {
    $.ajax({
      type: "GET",
      url: '/api/' + queryParams[currentPage].url,
      data: {
        countItems: queryParams[currentPage].countItems,
        offset: queryParams[currentPage].offset,
        profileName: queryParams[currentPage].profileName,
        postId: queryParams[currentPage].postId,
        sorting: queryParams.sorting
      },
      success: function(response) {
        console.log(response);
        if (response.success) {
          addPosts(response.posts, response.accessDel, response.userId);
        } else if (currentPage == 'post' && !response.success && response.message == 'empty posts') {
          posts.html('<div class="empty-posts col-md-12 text-center">Поста с таким id не существует.</div>');
        } else if (!response.success && response.message == 'empty posts') {
          if ($('.posts').children('div').length == 0) {
            posts.html('<div class="empty-posts col-md-12 text-center"> Нет публикаций.</div>');
          } else {
            loadingPosts = false;
            console.log('full posts loaded');
          }
        } else {
          console.log('error');
        }
      },
      dataType: 'json'
    });
  }

  function formatDate(date) {
    return (date.getHours() == 0 && date.getMinutes() == 0) ?
      date.toLocaleString().slice(0, -9) :
      date.toLocaleString().slice(0, -3);
  }


  function addPosts(data, accessDel, userId) {
    var postsStr = '';
    var postAvailable = true;

    for (var ii in data) {

      if (new Date(data[ii].dateLimit) <= new Date() || (data[ii].countVotesItems >= data[ii].postSettings.votes_limit && data[ii].postSettings.votes_limit)) {
        postAvailable = false;
      } else {
        postAvailable = true;
      }

      postsStr += ' \
        <div class="col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12 post" id="post'+ data[ii].id +'"> \
          <div class="post-information row"> \
      ';
      if (data[ii].loginPostOwners && data[ii].loginPostOwners != 0) {
        if (data[ii].imgProfile == '') {
          postsStr += '<p class="alignPostImg"><img src="../images/noimage.png"></p>';
        } else {
          postsStr += '<p class="alignPostImg"><img src="..'+ data[ii].imgProfile +'"></p>';
        }
        if (data[ii].loginPostOwnersId) {
          postsStr += '<a href="/'+ data[ii].loginPostOwnersId +'" class="text-left">'+ data[ii].loginPostOwners +'</a>';
        } else {
          postsStr += '<a href="/'+ data[ii].loginPostOwners +'" class="text-left">'+ data[ii].loginPostOwners +'</a>';
        }
      }
      postsStr += ' \
          <h4 class="text-right">'+ formatDate(new Date(data[ii].date)) +'</h4> \
        </div> \
        <div class="post-title"> \
          <div class="col-md-10 col-md-offset-1 col-sm-10 col-sm-offset-1 col-xs-10 col-xs-offset-1 postHead"> \
            <h3 class="postName text-center">'+ data[ii].title +'</h3> \
            <h4 class="postDesc text-center">'+ data[ii].desc +'</h4> \
          </div> \
        </div> \
        <div class="col-md-10 col-sm-12 col-xs-12 col-xs-offset-0 col-sm-offset-0 col-md-offset-1 postItemsBlock"> \
      ';
      for (var jj in data[ii].items) {
        if (data[ii].postSettings.full_mode) {
          postsStr += ' \
            <div class="postItem col-md-6 col-sm-12 col-xs-12"> \
              <div class="text-center postBody"> \
                <div class="itemName"> \
                  <h3 class="itemHeading">'+ data[ii].items[jj].name +'</h3> \
                </div> \
          ';
          if (data[ii].items[jj].img != '') {
            postsStr += ' \
              <p class="alignItems"> \
                <img src="..'+ data[ii].items[jj].img +'" alt="Mountain View" class="itemImg1"> \
              </p> \
            ';
          }
          postsStr += ' \
            <div class="caption text-left"> \
              <p class="itemDesc">'+ data[ii].items[jj].desc +'</p> \
            </div> \
          ';
          if ((!data[ii].vote && postAvailable) && ((data[ii].postSettings.reg_only && userId) || (!data[ii].postSettings.reg_only))) {
            postsStr += ' \
              <div class="stat'+ data[ii].id +'" style="display: none"> \
                <div class="statistics col-md-12 col-sm-12 col-xs-12" id="post'+ data[ii].items[jj].id +'Stat">'+ data[ii].items[jj].votes +' \
                </div> \
                <div class="statisticsPercent text-right">'+ Math.round(data[ii].items[jj].votes * 100 / data[ii].countVotesItems) +'</div> \
              </div> \
              <div class="btn'+ data[ii].id +'"> \
                <button class="btn btn-primary btn-vote btnVoteFull col-md-12 col-sm-12 col-xs-12" type="submit" name="'+ data[ii].items[jj].id +'" value="'+ data[ii].id +'">Голосовать</button> \
              </div> \
            ';
          } else if (data[ii].postSettings.reg_only && !userId) {
            postsStr += ' \
              <div class="btn'+ data[ii].id +'"> \
                <button class="btnVoteFullDisabled col-md-12 col-sm-12 col-xs-12" type="submit" name="'+ data[ii].items[jj].id +'" value="'+ data[ii].id +'">Голоcовать</button> \
              </div> \
            ';
          } else {
            if (data[ii].vote == data[ii].items[jj].id) {
              postsStr += ' \
                <div class="stat'+ data[ii].id +'"> \
                  <div class="statistics col-md-12 col-sm-12 col-xs-12 usersVote">'+ data[ii].items[jj].votes +'</div>';
              if (data[ii].countVotesItems) {
                postsStr += ' \
                  <div class="statisticsPercent text-right">'+ Math.round(data[ii].items[jj].votes * 100 / data[ii].countVotesItems) +'</div>';
              }
              postsStr += '</div>';
            } else {
              postsStr += ' \
                <div class="stat'+ data[ii].id +'"> \
                  <div class="statistics col-md-12 col-sm-12 col-xs-12">'+ data[ii].items[jj].votes +'</div>';
              if (data[ii].countVotesItems) {
                postsStr += ' \
                  <div class="statisticsPercent text-right">'+ Math.round(data[ii].items[jj].votes * 100 / data[ii].countVotesItems) +'</div>';
              }
              postsStr += '</div>';
            }
          }
        } else {
          postsStr += ' \
            <div class="postItemInRow col-md-10 col-md-offset-1 col-sm-10 col-sm-offset-1 col-xs-10 col-xs-offset-1"> \
              <div class="text-center postBody"> \
                <div class="itemNameInRow col-md-10 col-sm-10 col-xs-10"> \
                  <h3>'+ data[ii].items[jj].name +'</h3> \
                </div> \
          ';
          if ((!data[ii].vote && postAvailable) && ((data[ii].postSettings.reg_only && userId) || (!data[ii].postSettings.reg_only))) {
            postsStr += ' \
              <div class="stat'+ data[ii].id +'" style="display: none;"> \
                <div class="statInRow col-md-2 col-sm-2 col-xs-2" id="post'+ data[ii].items[jj].id +'Stat">'+ data[ii].items[jj].votes +'</div> \
                <div class="statInRowPercent text-right">'+ Math.round(data[ii].items[jj].votes * 100 / data[ii].countVotesItems) +'</div> \
              </div> \
              <div class="btn'+ data[ii].id +'"> \
                <button class="btn-vote btnVoteInRow col-md-2 col-sm-2 col-xs-2" type="submit" name="'+ data[ii].items[jj].id +'" value="'+ data[ii].id +'">Голосовать</button> \
              </div> \
            ';
          } else if (!data[ii].vote && postAvailable && data[ii].postSettings.reg_only && !userId) {
            postsStr += ' \
              <div class="btn'+ data[ii].id +'"> \
                <button class="btnVoteInRowDisabled col-md-2 col-sm-2 col-xs-2" disabled type="submit" name="'+ data[ii].items[jj].id +'" value="'+ data[ii].id +'">Голоcовать</button> \
              </div>';
          } else {
            if (data[ii].vote == data[ii].items[jj].id) {
              postsStr += ' \
                <div class="stat'+ data[ii].id +'"> \
                  <div class="statInRow usersVote col-md-2 col-sm-2 col-xs-2">'+ data[ii].items[jj].votes +'</div>';
              if (data[ii].countVotesItems) {
                postsStr += ' \
                   <div class="statInRowPercent text-right">'+ Math.round(data[ii].items[jj].votes * 100 / data[ii].countVotesItems) +'</div> \
                ';
              }
              postsStr += '</div>';
            } else {
              postsStr += ' \
                <div class="stat'+ data[ii].id +'"> \
                  <div class="statInRow col-md-2 col-sm-2 col-xs-2">'+ data[ii].items[jj].votes +'</div>';
              if (data[ii].countVotesItems) {
                postsStr += ' \
                   <div class="statInRowPercent text-right">'+ Math.round(data[ii].items[jj].votes * 100 / data[ii].countVotesItems) +'</div> \
                ';
              }
              postsStr += '</div>';
            }
          }
        }
        postsStr += ' \
            </div><!--2--> \
          </div><!--3--> \
        ';
      }
      postsStr += ' \
            </div> \
        <div class="postLimit col-md-12 col-sm-12 col-xs-12 text-center"> \
          <ul class="list-inline"> \
      ';

      if (postAvailable) {
        if (data[ii].postSettings.reg_only && userId) {
          if (data[ii].dateLimit) {
            postsStr += ' \
              <li class="dateLimit">Опрос закроется \
                <div>'+ formatDate(new Date(data[ii].dateLimit)) +'</div> \
              </li> \
            ';
          }
          if (data[ii].postSettings.votes_limit) {
            postsStr += ' \
              <li class="voteLimit">Голосов \
                <div id="voteCounter'+ data[ii].id +'">'+ data[ii].countVotesItems +' \
                </div> \
                <span>из</span> \
                <div>'+ data[ii].postSettings.votes_limit +'</div> \
              </li> \
            ';
          }
        } else if (!data[ii].vote && postAvailable && data[ii].postSettings.reg_only && !userId) {
          postsStr += ' \
            <li class="notAuthorized">Авторизуйтесь, чтобы проголосовать \
            </li> \
          ';
        }
      } else {
        postsStr += ' \
          <li class="pollFinished">Опрос завершён \
          </li> \
        ';
      }
      postsStr += ' \
             </ul> \
          </div> \
          <div class="post-footer col-md-12 col-sm-12 col-xs-12"> \
            <ul class="indicators col-md-6 col-sm-6 col-xs-6 list-inline">';
      if (data[ii].postSettings.reg_only) {
        postsStr += '<li class="privatePost"></li>';
      }
      postsStr += ' <li class="postRating" id="postRating'+ data[ii].id +'">'+ data[ii].countVotesItems +'</li></ul> \
        <ul class="share col-md-6 col-sm-6 col-xs-6 list-inline text-right"> \
          <li class="shareVK"> \
            <a href="http://vk.com/share.php?url=http://localhost:3000/post/'+ data[ii].id +'&image='+ (data[ii].img ? data[ii].img : 'http://localhost:3000//images/noimage.png') +'&title='+ data[ii].title +'&description='+ data[ii].desc +'" target="_blank"></a> \
          </li> \
          <li class="shareTwitter"> \
            <a href="https://twitter.com/share?url=http://localhost:3000/post/'+ data[ii].id +'&via=OPTIMALOPTION&related=SergeShaw%2COptiOption&hashtags=OpOp%2CpollMe&text='+ data[ii].title +'" target="_blank"></a> \
          </li> \
        </ul> \
          </div> \
        </div>';
      if (accessDel) {
        postsStr += ' \
          <div class="right-post-menu col-md-1 col-sm-1 col-xs-1" id="btnDel'+ data[ii].id +'"> \
            <button class="button delete-post" value="'+ data[ii].id +'"></button> \
          </div> \
        ';
      }
    }

    var wrapper = document.createElement('div');
    wrapper.innerHTML = postsStr;
    var $wrapper = $(wrapper);

    $wrapper.find('.btn-vote').click(function() {
      var currentPost = this;
      var postIdVoted = this.value;
      var buttons = $wrapper.find('.btn' + postIdVoted);
      var statistics = $wrapper.find('.stat' + postIdVoted);
      var currentItem = $wrapper.find('#post' + this.name + 'Stat');
      var voteCounter = $wrapper.find('#voteCounter'+ this.value);
      var postRating = $wrapper.find('#postRating'+ this.value);
      var oldValue = currentItem.text();
      var oldValueVoteCounter = voteCounter.text();
      var num = this.name;

      $.getJSON('/posts?vote=1&itemId=' + this.name + '&postId=' + this.value, function(response) {
        if (response.success) {
          currentItem.text(Number(oldValue) + 1);
          voteCounter.text(Number(oldValueVoteCounter) + 1);
          postRating.text(Number(postRating.text()) + 1);

          var itemsStat = (statistics.children('.statistics').length) ? statistics.children('.statistics') : statistics.children('.statInRow');
          var itemsStatPercent = (statistics.children('.statisticsPercent').length) ? statistics.children('.statisticsPercent') : statistics.children('.statInRowPercent');
          for (var ii = 0; ii < itemsStatPercent.length; ii++) {
            itemsStatPercent[ii].textContent = Math.round(Number(itemsStat[ii].textContent) * 100 / Number(postRating.text()));
          }

          $wrapper.find(currentPost).parent('div').prev('div').children('div').addClass('usersVote');
          buttons.hide();
          statistics.show();
        } else if (response.warning == 'already voted') {
          console.log('already voted');
        } else {
          console.log('error');
          $wrapper.find('#header').text('Произошёл сбой, голос не засчитан');
        }
      });
    });

    if (accessDel) {
      $wrapper.find('.delete-post').click(function() {
        var btnDel = $wrapper.find('#btnDel' + this.value);
        var deletedPost = $wrapper.find('#post' + this.value);
        var oldCountPosts = $('#userPosts').children('span').text();
        var checkForDelete = confirm("Вы уверены, что хотите удалить данный пост?");
        var currentProfile = location.pathname.split('/')[1];
        if (checkForDelete) {
          $.getJSON('/' + currentProfile + '?deletePost=1&postId=' + this.value, function(response) {
            if (response.success) {
              $('#userPosts').children('span').text(Number(oldCountPosts) - 1);
              btnDel.remove();
              deletedPost.remove();
            } else {
              console.log('error');
            }
          });
        }
      });
    }

    $('.posts').append(wrapper);
  }

});