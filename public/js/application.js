jQuery.ajaxSetup({ 
	"beforeSend": function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")} 
})

$.fn.extend({
  toggleDrawer: function() {
    this.siblings('.drawer').slideToggle('fast');
  }
});

$(document).ready(function() {
    
  // use touch events to simulate clicks (much more responsive)
  function quickClick(element, callback) {
  	element.live('touchstart', function(e) {
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
  }
    
    
  // tab navigation and state change
  quickClick($('nav ul li'), function(target) {
    tab = target.attr('id');
    $('nav ul li').removeClass('active');
    $('nav ul li#' + tab).addClass('active');
    $.get('/' + tab, null, function (data) {
      $("#main").html(data);
    });
  })
  
  // open/close actions drawer for individuals list
  quickClick($('ul#attendees li .content'), function(target) {
    target.toggleDrawer();
  });

	// show/hide attendee details
	quickClick($('ul#attendees li .drawer .button.details'), function(target) {
			target.siblings('.details_box').slideToggle('fast');
	});

	// check attendees in and out
	quickClick($('ul#attendees li .drawer .button.checkin'), function(target) {
		if (target.hasClass('checked_in')) {
			$.post('/checkout', {'id':target.parents('li').attr('id')}, function() {
				target.removeClass('checked_in');
				target.html('Check In');
				target.parents('li').removeClass('checked_in');
			});						
		} else {
			$.post('/checkin', {'id':target.parents('li').attr('id')}, function() {
				target.addClass('checked_in');
				target.html('Checked In');
				target.parents('li').addClass('checked_in');
			});			
		}
	});
  
  // go to list of group attendess when clicking on a group name
  quickClick($('ul#groups li .content'), function(target) {
    $.get('/groups/' + target.parent('li').attr('id'), null, function(data) {
      $("#main").html(data);
    });
  });
  
  // go to list of attendess or groups with the selected letter
  quickClick($('table.alpha td'), function(target) {
    active = $('nav ul li.active').attr('id');
    $.get('/' + active + '/alpha/' + target.html(), null, function(data) {
      $("#main").html(data);
    });
  });

  // reset search field
	quickClick($('#search .reset'), function(target) {
		target.siblings('input').val('');
		target.hide();
		$('#search_results').empty();
	});
	
	// remove scope (letter or group) and return to active tab 'home'
	quickClick($('ul.scope li .reset'), function() {
	  active = $('nav ul li.active').attr('id');
	  $.get('/' + active, null, function (data) {
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