
var revapi;

$(document).ready(function() {
  $(".panel a").click(function(e){
    e.preventDefault();
    var style = $(this).attr("class");
    $(".jetmenu").removeAttr("class").addClass("jetmenu").addClass(style);
  });

  $().jetmenu();

  revapi = $('.tp-banner').revolution({
    delay:9000,
    startwidth:1170,
    startheight:450,
    hideThumbs:10,
    fullWidth:"on",
    forceFullWidth:"on",
    lazyload:"on",
    navigationStyle:"none"
  });

  $(".zoombox").zoomBox();

  $("[data-toggle=tooltip]").tooltip();

  $("[data-toggle=popover]").popover();

  // Back to Top
  $(window).scroll(function() {
    if ($(this).scrollTop() > 1) {
      $('.dmtop').css({bottom:"25px"});
    } else {
      $('.dmtop').css({bottom:"-100px"});
    }
  });
  $('.dmtop').click(function(){
    $('html, body').animate({scrollTop: '0px'}, 800);
    return false;
  });
});