//OnLoad Functions
$(function () {
    $('#side_nav_toggle').click(function () {
        $('body').addClass('main_wrapper_offscreen');
    });
    $('#close_nav_button').click(function () {
        $('body').removeClass('main_wrapper_offscreen');
    });
});
