/*
$(function() {
  var $body = $('.viewframework-body');
  var isFull = localStorage.getItem('isFull');
  if(isFull === 'true')
    $body.addClass('viewframework-sidebar-full');
  else
    $body.removeClass('viewframework-sidebar-full');
});*/

$(function() {

  var $body = $('.viewframework-body');
  var $sidebar = $('.sidebar');
  var $sidebar_fold =  $sidebar.find('.sidebar-fold');
  var is_full = function() {
    return $body.hasClass('viewframework-sidebar-full');
  };

  // Sidebar
  function initSidebar() {

    $sidebar_fold.click(function() {
      $body.toggleClass('viewframework-sidebar-full');
      //localStorage.setItem('isFull', is_full());
    });

    $sidebar.find('.list-group-title').click(function(event) {
      $(this).parent().toggleClass('open');
      $(this).siblings('.list-group').slideToggle();
    });
    $sidebar.find('.list-group-title .config').click(function(event) {
      event.preventDefault();
      event.stopPropagation();
    });

  /*  $sidebar_fold.each(function(){
      $(this).tooltip({
        title: function() {
          return is_full()? '收起': '展开';
        },
        container: 'body'
      });
    });*/

    $sidebar.find('.list-group-item').each(function(){
      $(this).tooltip({
        title: function() {
          return is_full() ? '' : $(this).find('.nav-title').text().trim();
        },
        container: '.sidebar',
        viewport: false
      });
    });

    $sidebar.find('.list-group-title .config').each(function(){
      $(this).tooltip({
        container: '.sidebar',
        viewport: false
      });
      $(this).hover(function(event) {
        $(this).parent().tooltip('hide');
      }, function(event) {
        $(this).parent().tooltip('show');
      });

    });

  }

  initSidebar();

});
