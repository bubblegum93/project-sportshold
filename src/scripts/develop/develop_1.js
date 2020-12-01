function burger(){
  var menu = $('.nav-list');
  $('.burger').on('click', function(e) {
    e.preventDefault();

    if ($('.burger').hasClass('active')) {
      menu.slideUp('fast');
      $(this).removeClass('active');
    } else {
      menu.slideDown('fast');
      menu.attr( "style", "display: flex" );
      $(this).addClass('active');
    }
  });

  $(window).resize(function() {
    var menu = $('.site-list');
    var w = $(window).width();
    if(w > 1024) {
      menu.removeAttr('style');
      $('.burger').removeClass('active');
    }
  });
};
$(document).ready(function(){
    burger();

    $('.tab-item').on('click keyup', function(e) {
        e.preventDefault();
        var navItem = $(this).closest('.nav-item'),
        navItemIndex = navItem.index();

        $('.tab-index').eq(navItemIndex)
        .addClass('add-flex')
        .show('slow')
        .siblings()
        .hide('slow');

        $(navItem).addClass('active')
        .siblings()
        .removeClass('active');
    });

    $('.user-comments').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        asNavFor: '.list-visitor'
    });

    $('.list-visitor').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        asNavFor: '.user-comments',
        centerMode: true,
        focusOnSelect: true,
        responsive: [
            {
                breakpoint: 481,
            settings: {
                slidesToShow: 1,
                arrows: true
            }
            }
        ]
    });
})
$(window).load(function(){

})
$(window).resize(function(){

});