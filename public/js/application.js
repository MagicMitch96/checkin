$.extend($.fn, {
  // use touch events to simulate clicks (much more responsive)
  quickClick: function(callback) {
    this.live('touchstart', function(e) {
  	  moved = false;

      // letting us make things looks pretty
  	  $(this).addClass('pressed');

  		$(this).bind('touchmove', function() {
        // differentiating moves (e.g. swipes) from taps
  		  moved = true;
    	  $(this).removeClass('pressed');
  		});

  		$(this).bind('touchend', function(e) {
  		  e.preventDefault();

        // cleaning up after ourselves
  		  $(this).unbind('touchend');
  		  $(this).unbind('touchmove');
    	  $(this).removeClass('pressed');

        // only perform the callback if the touch was a tap
        // rather than a swipe or other movement
  		  if (!moved) {
  		    callback($(this));
  		  }
  		});

  	});
  }, // end quickClick

  slideDown: function(duration, easing, callback) {
    duration = duration || 400;
    easing = easing || 'ease';

    // element will be hidden but will allow us to get its intended height
    this.css('visibility', 'hidden');
    this.show();

    // get the height of the object if it weren't hidden
    var intendedHeight = this.height() + 'px';

    // storing the element for post animation actions
    var that = this;

    // now that we have the height, we can put things back for our animation
    this.css('height', '0px');
    this.css('visibility', 'visible');

    this.animate({ height: intendedHeight }, duration, easing, function() {
      // leave no trace
      that.css('height', 'auto');

      if(callback) {
        callback($(this));
      }
    });
  }, // end slideDown

  slideUp: function(duration, easing, callback) {
    duration = duration || 400;
    easing = easing || 'ease';

    // we need to get its current height so we can put things back once we're done,
    var actualHeight = this.height() + 'px';

    // storing the element for post animation actions
    var that = this;

    this.css('height', actualHeight);

    this.animate({ height: '0' }, duration, easing, function() {
      // making sure it's gone
      that.hide();

      // element will be hidden but will allow us to get its intended height
      that.css('visibility', 'hidden');
      that.css('height', 'auto');
      that.show();

      // get the height of the object if it weren't hidden, and use that 
      // to set the element's height explicitly (leave no trace)
      var intendedHeight = that.height() + 'px';
      that.css('height', intendedHeight);

      // returning things to a normalized state
      that.css('visibility', 'visible');
      that.hide();

      if(callback) {
        callback($(this));
      }
    });
  }, // end slideUp

  slideToggle: function(duration, easing, callback) {
    if(this.css('display') == 'none') {
      this.slideDown(duration, easing, callback)
    } else {
      this.slideUp(duration, easing, callback)
    }
  }, // end slideToggle
  
  loadingScreen: function() {
    this.html('<div class="loading"><div class="spinner"><div class="bar1"></div><div class="bar2"></div><div class="bar3"></div><div class="bar4"></div><div class="bar5"></div><div class="bar6"></div><div class="bar7"></div><div class="bar8"></div><div class="bar9"></div><div class="bar10"></div><div class="bar11"></div><div class="bar12"></div></div>Loading...</div>');
  } // end loadingScreen
});

function delayedLoadingScreen(target) {
  target = target || "#main";
  return setTimeout("$('" + target + "').loadingScreen()", 200);
}

$(document).ready(function() {
    
  // tab navigation and state change
  $('nav ul li').quickClick(function(target) {
    loading = delayedLoadingScreen();
    tab = target.attr('id');
    $('nav ul li').removeClass('active');
    $('nav ul li#' + tab).addClass('active');
    $.get('/' + tab, function (data) {
      clearTimeout(loading);
      $("#main").html(data);
    });
  });
  
  // open/close actions drawer for individuals list
  $('ul#guests li .content').quickClick(function(target) {
    var detailsBox = target.siblings('.drawer').children('.details_box');
    if( detailsBox.css('display') != 'none' ) {
      detailsBox.slideUp(100);
    }
    target.siblings('.drawer').slideToggle(200);
  });

	// show/hide guest details
	$('ul#guests li .drawer .button.details').quickClick(function(target) {
			target.siblings('.details_box').slideToggle(100);
	});

	// check guests in and out
	$('ul#guests li .drawer .button.checkin').quickClick(function(target) {
		if (target.hasClass('checked_in')) {
		  target.html('Processing');
		  target.addClass('disabled');
			$.post('/checkout', {'id':target.parents('li').attr('id')}, function() {
				target.removeClass('checked_in');
				target.html('Check In');
				target.parents('li').removeClass('checked_in');
        target.removeClass('disabled');
			});						
		} else {
		  target.html('Processing');
		  target.addClass('disabled');
			$.post('/checkin', {'id':target.parents('li').attr('id')}, function() {
				target.addClass('checked_in');
				target.html('Checked In');
				target.parents('li').addClass('checked_in');
				target.removeClass('disabled');
			});			
		}
	});
	
	// group name in guest details links to group list
	$('ul#guests li .drawer .details_box .guest_group').quickClick(function(target) {
		loading = delayedLoadingScreen();
		$.get('/groups/' + target.attr('id'), function(data) {
			clearTimeout(loading);
			$('nav ul li').removeClass('active');
	    $('nav ul li#groups').addClass('active');
			$('#main').html(data);
		});
	})
  
  // go to list of group attendess when clicking on a group name
  $('ul#groups li .content').quickClick(function(target) {
    loading = delayedLoadingScreen();
    $.get('/groups/' + target.parent('li').attr('id'), function(data) {
      clearTimeout(loading);
      $("#main").html(data);
    });
  });
  
  // go to a list of guests of a certain type when selected form the "more" tab
  $('table#stats tr td.guest_type').quickClick(function(target) {
    loading = delayedLoadingScreen();
    $.get('/individuals/type/' + target.parent('tr').attr('id'), function(data) {
      clearTimeout(loading);
      $('#main').html(data);
    });
  });
  
  // go to list of attendess or groups with the selected letter
  $('table.alpha td').quickClick(function(target) {
    loading = delayedLoadingScreen();
    active = $('nav ul li.active').attr('id');
    $.get('/' + active + '/alpha/' + target.html(), function(data) {
      clearTimeout(loading);
      $("#main").html(data);
    });
  });

  // reset search field
	$('#search .reset').quickClick(function(target) {
		target.siblings('input').val('');
		target.hide();
		$('#search_results').empty();
	});
	
	// remove scope (letter or group) and return to active tab 'home'
	$('ul.scope li .reset').quickClick(function() {
	  loading = delayedLoadingScreen();
	  active = $('nav ul li.active').attr('id');
	  $.get('/' + active, function (data) {
      clearTimeout(loading);
      $("#main").html(data);
    });
	});
  
  // show and hide alpha table when using or not using search
  $('#search input#search_field').live('focus', function() {
    if (!$('#search_results').length) {
      $('table.alpha').after('<div id="search_results"></div>');      
    }
    $('table.alpha').hide();
  });
  $('#search input').live('blur', function() {
    if ($(this).val() === '') {
      $('#search_results').remove();
      $('table.alpha').show();
    }
  });

  // live search (includes showing and hiding the reset search button)
	$('#search input#search_field').live('keyup', function() {
    loading = delayedLoadingScreen("#search_results");
	  query = $(this).val();
	  active = $('nav ul li.active').attr('id');
		if (query != '') {
			$(this).siblings('.reset').show();
		} else {
			$(this).siblings('.reset').hide();
		}
		$.get('/' + active + '/search?query=' + query, function (data) {
		  clearTimeout(loading);
      $("#search_results").html(data);
    });
	});
	
});
