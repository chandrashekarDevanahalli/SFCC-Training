module.exports = function () {
    $('.email-form-submit').submit(function (e) {
        e.preventDefault();
        var $form = $(this);
        var url = $form.attr('action');
        var pid = $('.product-id').text();
        var emailAddress = $('#notify-me').val();
        var form = {
            pid: pid,
            emailAddress: emailAddress
        }
        $.ajax({
            url: url,
            type: 'get',
            data: form,
            success: function (data) {
                var msg = '<h1>' + data.Message + '</h1>';
                ('.email-form-submit').html(msg)
            },
            error: function (data) {
                window.location.href = data.responseJSON.redirectUrl;
            }
        });
    });

};