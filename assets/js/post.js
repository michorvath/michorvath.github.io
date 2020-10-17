(function() {
    if (typeof hljs !== 'undefined') {
        hljs.initHighlightingOnLoad();
    }

    if ($('.post-header-image').length) {
        var parallaxContainer = $('body');
            lastPageX = parallaxContainer.width()/2+parallaxContainer.offset().left,
            lastPageY = parallaxContainer.height()/2+parallaxContainer.offset().top,
            lastScroll = $(window).scrollTop();

        parallaxContainer.mouseleave(function() {
            //reset mouse parallax to center when mouse leaves the container
            lastPageX = parallaxContainer.width()/2+parallaxContainer.offset().left;
            lastPageY = parallaxContainer.height()/2+parallaxContainer.offset().top;
        });

        parallaxContainer.mousemove(function(e) {
            lastPageX = e.pageX;
            lastPageY = e.pageY;
            parallaxIt(parallaxContainer, e, '.post-header-image > div', -30, 5, 10, true);
        });

        $(window).on('scroll resize', onScroll);

        function onScroll() {
            var newScroll = $(window).scrollTop(),
                scrollOffset = newScroll-lastScroll;

            lastScroll = newScroll;

            var e = $.Event('mousemove');
            e.pageX = lastPageX;
            e.pageY = lastPageY+scrollOffset;
            parallaxContainer.trigger(e);
        }
    }
})();
