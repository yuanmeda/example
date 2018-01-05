(function ($, window) {

    $(function () {
        $('#js_role').val(roleType);
        $('#js_role').show();

        $('#js_role').on('change', function () {
            var role = $('#js_role').val();
            localStorage.roleType = role;
            location.reload();
        })
    });

})(jQuery, window);