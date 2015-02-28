var netid;
var ipc = require('ipc');

$(document).ready(function () {
  // Meta actions (close, minimize)
  $('button#close').click(function () {
    ipc.send('close-window-event', 'true');
  });
  $('button#minimize').click(function () {
    ipc.send('minimize-window-event', 'true');
  });

  // Login actions
  $('button#login-button').click(function (e) {
    netid = $('input#netid').val();
    $('input, button').blur();

    // Don't actually submit the form
    e.preventDefault();

    $('button#login-button').prop('disabled', true);
    $('button#login-button').text('Logging in...');

    // Ajax request to server
    $.ajax({
      url: 'http://127.0.0.1:3005/login',
      method: 'POST',
      data: {
        netid: netid,
        password: $('input#password').val()
      }
    }).done(function (data) {
      if (data.toString() === 'false') {
        // Login failed
        login_result(false, function () {
          $('button#login-button').prop('disabled', false);
          $('button#login-button').text('Login');
        });

      } else {
        // Login successful
        login_result(true, function () {
          $('div#login')
            .delay(500)
            .animate({
              top: '-300px'
            }, {
              duration: $(window).height() / 2,
              complete: function () {
                // Tell backend to open index.html
                ipc.send('login-successful', 'true');
              }
            });
        });
      }
    });
  });
});

/**
 * Animate the large result box and perform the callback function
 * Requires: [boolean] successful - Whether or not the login was successful
 *           [function] callback  - A function to call after all animations
 */
var login_result = function (successful, callback) {
  var login_result_delay = 1000,
      login_animation_duration = 500;

  $('div#login-cover')
    .css({
      display: 'block'
    })
    .fadeTo(login_animation_duration, '0.5', function () {
      $(this)
        .delay(login_result_delay)
        .fadeOut({
          duration: login_animation_duration
        });
    });

  $('div#login-result')
    .html( (successful) ? '&check;' : '&#9587;' )
    .css({
      backgroundColor: (successful) ? '#00FF00' : '#FF0000',
      top: ($('div#login').height() - $('div#login-result').height()) / 2,
      left: '-125px'
    })
    .animate({
      left: (($('div#login').width() - $('div#login-result').width()) / 2) + 15
    }, {
      duration: login_animation_duration,
      complete: function () {
        $(this)
          .delay(login_result_delay)
          .animate({
            left: '350px'
          }, {
            duration: login_animation_duration,
            complete: callback()
          });
      }
    });
}