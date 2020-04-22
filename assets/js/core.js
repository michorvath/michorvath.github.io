(function() {
    /* START: NAVIGATION STUFF */
    $(document).on('click', '.js-toggle-nav', function() {
        $('#main-navigation').toggleClass('open');
        $('body').toggleClass('nav-open');
    });

    //keep tabbable limited to nav elements if nav is open
    var inputs = $('[tabindex], a, input, button', '#main-navigation');
    var firstInput = inputs.first();
    var lastInput = inputs.last();

    /* redirect last tab to first input */
    lastInput.on('keydown', function (e) {
       if ((e.which === 9 && !e.shiftKey)) {
           e.preventDefault();
           firstInput.focus();
       }
    });

    /* redirect first shift+tab to last input */
    firstInput.on('keydown', function (e) {
        if ((e.which === 9 && e.shiftKey)) {
            e.preventDefault();
            lastInput.focus();
        }
    });
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
