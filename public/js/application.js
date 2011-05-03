jQuery.ajaxSetup({ 
	"beforeSend": function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")} 
});

$.fn.extend({
  // use touch events to simulate clicks (much more responsive)
  quickClick: function(callback) {
    this.live('touchstart', function(e) {
  	  moved = false;
  	  $(this).addClass('pressed');
  		$(this).bind('touchmove', function() {
  		  moved = true;
    	  $(this).removeClass('pressed');
  		});
  		$(this).bind('touchend', function(e) {
  		  e.preventDefault();
  		  $(this).unbind('touchend');
  		  $(this).unbind('touchmove');
    	  $(this).removeClass('pressed');
  		  if (!moved) {
  		    callback($(this));
  		  }
  		});
  	});
  }, // end quickClick
  
  loadingScreen: function() {
    this.html('<div class="spinner"><div class="bar1"></div><div class="bar2"></div><div class="bar3"></div><div class="bar4"></div><div class="bar5"></div><div class="bar6"></div><div class="bar7"></div><div class="bar8"></div>');
  } // end loadingScreen
});

function delayedLoadingScreen() {
  return setTimeout("$('#main').loadingScreen()", 200);
}

$(document).ready(function() {
    
  // tab navigation and state change
  $('nav ul li').quickClick(function(target) {
    loading = delayedLoadingScreen();
    tab = target.attr('id');
    $('nav ul li').removeClass('active');
    $('nav ul li#' + tab).addClass('active');
    $.get('/' + tab, null, function (data) {
      clearTimeout(loading);
      $("#main").html(data);
    });
  });
  
  // open/close actions drawer for individuals list
  $('ul#guests li .content').quickClick(function(target) {
    target.siblings('.drawer').slideToggle('fast');
    target.siblings('.drawer').children('.details_box').slideUp('fast');
  });

	// show/hide guest details
	$('ul#guests li .drawer .button.details').quickClick(function(target) {
			target.siblings('.details_box').slideToggle('fast');
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
		$.get('/groups/' + target.attr('id'), null, function(data) {
			clearTimeout(loading);
			$('nav ul li').removeClass('active');
	    $('nav ul li#groups').addClass('active');
			$('#main').html(data);
		});
	})
  
  // go to list of group attendess when clicking on a group name
  $('ul#groups li .content').quickClick(function(target) {
    loading = delayedLoadingScreen();
    $.get('/groups/' + target.parent('li').attr('id'), null, function(data) {
      clearTimeout(loading);
      $("#main").html(data);
    });
  });
  
  // go to list of attendess or groups with the selected letter
  $('table.alpha td').quickClick(function(target) {
    loading = delayedLoadingScreen();
    active = $('nav ul li.active').attr('id');
    $.get('/' + active + '/alpha/' + target.html(), null, function(data) {
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
	  $.get('/' + active, null, function (data) {
      clearTimeout(loading);
      $("#main").html(data);
    });
	});
  
  // show and hide alpha table when using or not using search
  $('#search input#search_field').live('focus', function() {
    if (!$('#search_results').length) {
      $('table.alpha').after('<div id="search_results"></div>');      
    }
    $('table.alpha').fadeOut('fast');
  });
  $('#search input').live('blur', function() {
    if ($(this).val() === '') {
      $('#search_results').remove();
      $('table.alpha').fadeIn('fast');
    }
  });

  // live search (includes showing and hiding the reset search button)
	$('#search input#search_field').live('keyup', function() {
	  query = $(this).val();
	  active = $('nav ul li.active').attr('id');
		if (query != '') {
			$(this).siblings('.reset').show();
		} else {
			$(this).siblings('.reset').hide();
		}
		$.get('/' + active + '/search?query=' + query, null, function (data) {
      $("#search_results").html(data);
    });
	});
  
});