
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
    });

    $sidebar.find('.list-group-title').click(function(event) {
      $(this).parent().toggleClass('open');
      $(this).siblings('.list-group').slideToggle();
    });
    $sidebar.find('.list-group-title .config').click(function(event) {
      event.preventDefault();
      event.stopPropagation();
    });

    /*$sidebar_fold.each(function(){
      $(this).tooltip({
        title: function() {
          return is_full()? '收起': '展开';
        }
      });
    });*/

    $sidebar.find('.list-group-item').each(function(){
      $(this).tooltip({
        title: $(this).find('.nav-title').text().trim()
      });
    });

    $sidebar.find('.list-group-title .config').each(function(){
      $(this).tooltip();
      $(this).hover(function(event) {
        $(this).parent().tooltip('hide');
      }, function(event) {
        $(this).parent().tooltip('show');
      });

    });

  }

  initSidebar();

  $('.select-group').selectizeCity({
    data: allcities,
    onChange: function ($self) {
      var selectedObject = $self.selectedObject();
      var selectedLabel = $self.selectedLabel();
      var selectedValue = $self.selectedValue();
    }
  });

    /*  var pinyin = new Pinyin(true, 'default');
      console.log(pinyin.getCamelChars('重庆市'));
      console.log(pinyin.getFullChars('重庆市'));*/

});
