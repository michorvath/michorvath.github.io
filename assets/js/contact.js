(function() {
    $(document).on('click', '.flag > .close-action', function() {
        $(this).parent().animate({ opacity: 0 }, 250, function() {
            $(this).animate({ marginBottom: 0 }, 250).children().animate({ padding: 0 }, 250).wrapInner('').children().slideUp(250, function() {
                $(this).closest('.flag').remove();
            });
        });
    });

    var throwFlag = function(form, error, message) {
        if (!message) {
            message = (error ? 'An unexpected error has occurred. Please try again.' : 'The selected action was successfully completed.');
        }

        var flagMarkup = '    <div class="flag">';
        flagMarkup += '        <div class="icon-container">';
        if (error) {
            flagMarkup += '            <svg viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg" class="icon">';
            flagMarkup += '                <path d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.054-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.952 83.154 0l239.94 416.028zm-27.658 15.991l-240-416c-6.16-10.678-21.583-10.634-27.718 0l-240 416C27.983 466.678 35.731 480 48 480h480c12.323 0 19.99-13.369 13.859-23.996zM288 372c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28zm-11.49-212h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM288 372c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z"/>';
            flagMarkup += '            </svg>';
        } else {
            flagMarkup += '            <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" class="icon">';
            flagMarkup += '                <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"/>';
            flagMarkup += '            </svg>';
        }
        flagMarkup += '        </div>';
        flagMarkup += '        <div class="body">';
        flagMarkup += '            <strong>' + (error ? 'Error' : 'Success') + ':</strong><br/>' + message;
        flagMarkup += '        </div>';
        flagMarkup += '        <span class="close-action" title="Hide">';
        flagMarkup += '            <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" class="icon">';
        flagMarkup += '                <path d="M231.6 256l130.1-130.1c4.7-4.7 4.7-12.3 0-17l-22.6-22.6c-4.7-4.7-12.3-4.7-17 0L192 216.4 61.9 86.3c-4.7-4.7-12.3-4.7-17 0l-22.6 22.6c-4.7 4.7-4.7 12.3 0 17L152.4 256 22.3 386.1c-4.7 4.7-4.7 12.3 0 17l22.6 22.6c4.7 4.7 12.3 4.7 17 0L192 295.6l130.1 130.1c4.7 4.7 12.3 4.7 17 0l22.6-22.6c4.7-4.7 4.7-12.3 0-17L231.6 256z"/>';
        flagMarkup += '            </svg>';
        flagMarkup += '        </span>';
        flagMarkup += '    </div>';

        $(flagMarkup).appendTo($(form).find('.flag-wrapper'));
    };

    var submitBtn = $('#contact-submit-btn');

    $('#contact-form input, #contact-form textarea').on('change input', function() {
        var disabled = false;
        $('#contact-form input, #contact-form textarea').each(function() {
            var _this = $(this);
            if (!_this.val().length || (_this.attr('type') == 'email' && !/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(_this.val()))) {
                disabled = true;
                return false;
            }
        });
        submitBtn.prop('disabled', disabled);
    });

    submitBtn.on('click', function() {
        var form = $('#contact-form'),
            formData = form.serialize();

        submitBtn.prop('disabled', true).addClass('loading');
        form.find('input, textarea').prop('disabled', true);
        form.find('.flag-wrapper').empty();

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: 'https://formspree.io/xzbaojbo',
            data: formData,
            success: function(res) {
                submitBtn.removeClass('loading').hide();
                throwFlag(form, false, 'Message sent!');
            },
            error: function() {
                submitBtn.prop('disabled', false).removeClass('loading');
                form.find('input, textarea').prop('disabled', false);

                throwFlag(form, true);
            }
        });
    });

    window.onbeforeunload = function() {
        var showMessage = false;
        $('#contact-form input, #contact-form textarea').each(function() {
            if ($(this).val().length) {
                showMessage = true;
                return false;
            }
        });

        if (showMessage) {
            return 'Are you sure you want to leave? You have not completed your submission yet.'; //don't let them leave.. ever. :p
        }
    };
})();
