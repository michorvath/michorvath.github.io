(function() {
    $('.center-center-wrapper').mousemove(function(e) {
        parallaxIt($('.center-center-wrapper'), e, '.error-message div:first-child', -100);
        parallaxIt($('.center-center-wrapper'), e, '.error-message div:last-child', -50);
    });
})();
