(function () {
  var TR = window.TR || {};
  window.TR = TR;

  TR.init = function () {
    $(document).ready(function(){
      console.log('ajax call');
      $.ajax({
        url: "/tumblr/feed",
        success: function ( data ) {
          if (data.posts) {
            TR.onLoadData( data );
          } else {
            console.log('cant load players, init login');
            TR.initLogin();
          }
        },
        error: function ( ) {
          console.log('error');
        }
      });
    });
  };

  TR.initLogin = function() {
    console.log('initLogin');
    $('body').append('<a class="auth-actions" href="/auth/tumblr">Sign in</a>');
  }

  TR.onLoadData = function( data ) {
    $('.auth-actions').remove();
    $('body').append('<div id="players"></div>');

    for (post in data.posts) {
      var postData = data.posts[post];
      var colorIndex = Math.floor((Math.random()*10)+1);

      if (postData.type === 'audio') {
        console.log( postData );
        $('#players').append('' +
          '<div class="audio-embed c' + colorIndex + '">' +
            '<span class="blog-name">' + postData.blog_name + '</span>' +
            postData.player +
            '<span class="artist-name">' + postData.artist + ' - </span>' +
            '<span class="track-name">' + postData.track_name + '</span>' +
          '</div>');
      }
    }
  }

  return TR.init();
})();
