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

  // 高德地图
  var map = new AMap.Map('map-container');

  function showInfo(position) {
/*    var southwest = map.getBounds().southwest;
    var northeast = map.getBounds().northeast;

    var str = ['当前地图区域中心点'];
    str.push('缩放级别：' + map.getZoom());
    str.push('经度：' + position.getLng());
    str.push('纬度：' + position.getLat());
    str.push('边框：' + map.getBounds());
    /!*    str.push('经度(精确)：' + position.H);
     str.push('纬度(精确)：' + position.A);*!/
    $('#tip').html(str.join('<br>'));*/
  }

  var geolocation, placeSearch, auto;
  map.plugin('AMap.Geolocation', function () {
    geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,//是否使用高精度定位，默认:true
      timeout: 10000,          //超过10秒后停止定位，默认：无穷大
      maximumAge: 10,           //定位结果缓存0毫秒，默认：0
      convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
      showButton: true,        //显示定位按钮，默认：true
      buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
      buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
      showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
      showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
      panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
      zoomToAccuracy: false      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    });
    map.setZoom(14);

    map.addControl(geolocation);
    geolocation.getCurrentPosition();
    AMap.event.addListener(geolocation, 'complete', function(data) {
      console.log(data);
      showInfo(data.position);
    });//返回定位信息
    AMap.event.addListener(geolocation, 'error', function(data) {
      console.log(data);
    });      //返回定位出错信息

    AMap.event.addListener(map, 'moveend', function() {
      var position = map.getCenter();
      showInfo(position);
    });
  });

  AMap.service(["AMap.PlaceSearch"], function() {
    placeSearch = new AMap.PlaceSearch({ //构造地点查询类
      pageSize: 5,
      pageIndex: 1,
      type: '地名地址信息|餐饮服务|商务住宅|生活服务',
      map: map,
      citylimit: true,
      panel: "map-search-info"
    });
  });

  AMap.service(["AMap.Autocomplete"], function() {
    auto = new AMap.Autocomplete({
      citylimit: true,
      input: "callin_area"
    });
    AMap.event.addListener(auto, "select", function(e) {
      if(e.poi.adcode)
        placeSearch.setCity(e.poi.adcode);
      placeSearch.setCityLimit(true);
      placeSearch.search(e.poi.name);
    });
  });

  var addressSelectize = $('.select-group').selectizeCity({
    data: allcities,
    items: [
      ['330000'],
      ['330100']
    ],
    onChange: function ($self) {
      var selectedObject = $self.selectedObject();
      var selectedLabel = $self.selectedLabel();
      var selectedValue = $self.selectedValue();
      if(auto) {
        var city = $self.selectedValue();
        console.log(city[city.length - 1]);
        if(city) {
          console.log(city);
          placeSearch.setCity(city[city.length - 1]);
          placeSearch.setCityLimit(true);
          auto.setCity(city[city.length - 1]);
          auto.setCityLimit(true);
        }
      }
    }
  });

  $('.input-select').selectize();

  $('.label-group').each(function(){
    $(this).selectizeLabel({
      data: allservices,
      cssClass: {
        labels: 'labels',
        label: 'label label-danger',
        selected: 'label-fill',
        disabled: 'disabled'
      },
      input: {
        placeholder: $(this).data('placeholder')
      }
    });
  });

  $('#geolocation').click(function() {
    var area = addressSelectize[0].selectedLabel();
    var addDetail = $('#callin_area').val();
    var address = '';
    if(area)
      address = area.join('') + addDetail;
    else
      address = addDetail;
    if(address && (address = address.trim())) {
      var city = addressSelectize[0].selectedValue();
      if(city) {
        placeSearch.setCity(city[city.length - 1]);
        placeSearch.setCityLimit(true);
        auto.setCity(city[city.length - 1]);
        auto.setCityLimit(true);
      }
      placeSearch.search(address);
    }
  });


});
