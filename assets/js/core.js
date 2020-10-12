(function() {
    /* START: NAVIGATION STUFF */
    $(document).on('click', '.js-toggle-nav', function() {
        $('#main-navigation').toggleClass('open');
        $('body').toggleClass('nav-open');
    });

    //keep tabbable limited to nav elements if nav is open
    $(function() {
        var firstInput = $('#main-navigation .js-toggle-nav'),
            lastInput = $('#main-navigation ul a').last();

        $('#main-navigation').on('keydown', function(e) {
            if (e.which === 9) {
                if (e.shiftKey) /* shift + tab */ {
                    if (document.activeElement === firstInput[0]) {
                        lastInput.focus();
                        e.preventDefault();
                    }
                } else /* tab */ {
                    if (document.activeElement === lastInput[0]) {
                        firstInput.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    });

    /* redirect last tab to first input */
    /*
    lastInput.on('keydown', function (e) {
        console.log('last input keydown');
       if ((e.which === 9 && !e.shiftKey)) {
           e.preventDefault();
           firstInput.focus();
       }
    });
    */

    /* redirect first shift+tab to last input */
    /*
    firstInput.on('keydown', function (e) {
        console.log('first input keydown');
        if ((e.which === 9 && e.shiftKey)) {
            e.preventDefault();
            lastInput.focus();
        }
    });
    */
    /* END: NAVIGATION STUFF */

    /* START: ELEMENT RIPPLE EFFECT FLOURISH */
    $(document).on('click', '.js-ripple', function(e) {
        var target = $(e.target);
        if (!target.length) {
            return;
        }

        if (!e.originalEvent || (e.originalEvent.offsetX < 1 && e.originalEvent.offsetY < 1)) {
            var x = e.target.clientWidth / 2,
                y = e.target.clientHeight / 2;
        } else {
            var x = e.originalEvent.offsetX,
                y = e.originalEvent.offsetY;
        }

        var element = document.createElement('div'),
            childEl = document.createElement('div');

        element.className = 'ripple-effect';
        childEl.style.left = x + 'px';
        childEl.style.top = y + 'px';
        element.append(childEl);

        if (target.children('.ripple-effect').length > 0) {
            target.children('.ripple-effect').replaceWith(element);
        } else {
            target.append(element);
        }

        $(childEl).on('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function() {
            $(this).closest('.ripple-effect').remove();
        })
    });

    $(document).on('mousedown', '.js-ripple > *', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).closest('.js-ripple').trigger('click');
        return false;
    });
    /* END: ELEMENT RIPPLE EFFECT FLOURISH */

    /* START: HANDLE KEYBOARD ACCESSIBILITY */
    $(document).on('keypress', '[type="button"], [type="checkbox"], button, [tabindex]', function(e) {
        if (e.originalEvent.key == 'Enter' || e.which == 13) {
            e.preventDefault();
            $(this).click();
        }
    });

    $(document).on('keypress', 'input, select, textarea', function(e) {
        if (~['button', 'radio', 'checkbox'].indexOf(this.type)) {
            return; //ignore these inputs
        }

        if ((e.originalEvent.key == 'Enter' || e.which == 13) && !e.shiftKey) {
            //if 'enter' was pressed and 'shift' is not being held while a form input is focused, proceed

            var _this = $(this),
                form = _this.closest('form'); //first look in the parent form
            if (form) {
                var el = form.find('.js-form-submit')[0];
                if (el) {
                    el.click();
                    return; //don't proceed to dialog check
                }
            }

            var dialog = _this.closest('.ui-dialog'); //if there was no parent form and/or js-form-enter-click element, we check if we are within a dialog
            if (dialog) {
                var el = dialog.find('.js-form-submit')[0];
                if (el) {
                    el.click();
                }
            }
        }
    });
    /* END: HANDLE KEYBOARD ACCESSIBILITY */

    /* START: HANDLE LABEL FOR CLICKS VIA NAME INSTEAD OF ID */
    $(document).on('click', 'label[for]', function() {
        var _this = $(this),
            parent = _this.closest('form'),
            name = _this.attr('for');

        if (parent.length) {
            var el = parent.find('input[name="' + name + '"], textarea[name="' + name + '"], select[name="' + name + '"]');
            if (el.length) {
                el[0].focus();
            }
        }
    });
    /* END: HANDLE LABEL FOR CLICKS VIA NAME INSTEAD OF ID */
})();

//putting utils here for now

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function parallaxIt(route, e, target, movement, offset, max, clipToParent) {
    if (!(route instanceof jQuery)) {
        route = $(route);
    }

    var width = route.width(),
        height = route.height(),
        relX = (e ? e.pageX-route.offset().left : width/2+route.offset().left),
        relY = (e ? e.pageY-route.offset().top : height/2+route.offset().top),
        offset = offset || 0,
        max = max ? width*(max/100) : 0,
        x = width*-(offset/100)+(relX-width/2)/width*movement,
        y = height*-(offset/100)+(relY-height/2)/height*movement;

    x = max ? clamp(x, max*-1, max) : x;
    y = max ? clamp(y, max*-1, max) : y;

    if (clipToParent) {
        //keep within the bounds of the parent

        var targetEl = $(target),
            parent = targetEl.parent();

        if (targetEl.offset().left > 0) {
            x = 0;
        }

        if (x < 0 && targetEl.width()+x < parent.width()) {
            x = (targetEl.width()-parent.width())*-1;
        }

        if (targetEl.offset().top > 0) {
            y = 0;
        }

        if (y < 0 && targetEl.height()+y < parent.height()) {
            y = (targetEl.height()-parent.height())*-1;
        }
    }

    TweenMax.to(target, 1, {x: x, y: y});
}
