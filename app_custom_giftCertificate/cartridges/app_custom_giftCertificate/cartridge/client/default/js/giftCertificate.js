'use strict';


module.exports = {
    giftCertificateChecker: function () {
        $('#giftCertificate-check-balance').on('click', function (e) {
            e.preventDefault();
            var url = $(this).data('url');
            var giftCertificateCode = $('#giftCertificate').val();
            $('#gift-certificate-form').spinner().start();
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: {
                    giftCertificateCode: giftCertificateCode
                },
                success: function (response) {
                    var message = response.Message;
                    $('.giftCertificate-data-container').html(message);
                    $('#gift-certificate-form').spinner().stop();
                },
                error: function (error) {
                    $('#gift-certificate-form').spinner().stop();
                    var message = '<h1>' + error.message + '</h1>';
                    $('.giftCertificate-data-container').html(message);
                }
            });
        });
    },

    giftCertificateApplier: function () {
        $('.btn.giftCertificate-btn-apply').on('click', function (e) {
            e.preventDefault();
            var url = $(this).data('url');
            var giftCertificateCode = $('#giftCertificate').val();
            $('#gift-certificate-form').spinner().start();
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: {
                    giftCertificateCode: giftCertificateCode
                },
                success: function (response) {
                    $('#gift-certificate-form').spinner().stop();
                    if (response.status != 1) {
                        var message = response.result;
                        $('.giftCertificate-data-container').html(message);
                        $('.giftCertificate-data-container').css('color', 'green');
                        $('a').removeAttr('style');
                    } else if (response.status == 1) {
                        var message = reponse.result;
                        $('.giftCertificate-data-container').html(message);
                        $('.giftCertificate-data-container').css('color', 'red');
                    } else {
                        var message = reponse.result;
                        $('.giftCertificate-data-container').html(message);
                        $('.giftCertificate-data-container').css('color', 'red');
                    }
                    if (response.flag) {
                        $('.credit-card-selection-new').addClass('d-none');
                        $('.gift-cert-remove').removeClass('d-none');
                        $('.payment-information').attr('data-payment-method-id', 'GIFT_CERTIFICATE');
                    } else {
                        $('.credit-card-selection-new').removeClass('d-none');
                    }
                },
                error: function (error) {
                    $('#gift-certificate-form').spinner().stop();
                    var message = '<h1>' + error.message + '</h1>';
                    $('.giftCertificate-data-container').html(message);
                }

            });
        })
    },

    giftCertificateRemover: function () {
        $('.gift-cert-remove').on('click', function (e) {
            e.preventDefault();
            var url = $(this).data('url');
            var giftCertificateCode = $('#giftCertificate').val();
            $('#gift-certificate-form').spinner().start();
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: {
                    giftCertificateCode: giftCertificateCode
                },
                success: function (response) {
                    var message = response.message;
                    $('#gift-certificate-form').spinner().stop();
                    window.location.reload();
                },
                error: function (error) {
                    $('#gift-certificate-form').spinner().stop();
                    var message = '<h1>' + error.message + '</h1>';
                    $('.giftCertificate-data-container').html(message);
                }
            });
        });
    }
}