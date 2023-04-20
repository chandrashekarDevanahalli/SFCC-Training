module.exports = function () {
    $('a.donate-amount-button').on('click', function (e) {
        e.preventDefault();
        var url = $(this).attr('href');
        var donationAmount = $('.donation-amount-value').val();
        var form = {
            donationAmount: donationAmount
        }
        $.ajax({
            url: url,
            type: 'post',
            data: form,
            success: function (data) {
                window.location.href = data.redirectUrl;
            },
            error: function (err) {
                window.location.href = err.responseJSON.redirectUrl;
            }
        });
    });

};