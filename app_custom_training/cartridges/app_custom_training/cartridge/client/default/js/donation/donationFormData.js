/**
 * Updates the Mini-Cart quantity value after the customer has pressed the "Add to Cart" button
 * @param {string} response - ajax response from clicking the add to cart button
 */
function handlePostCartAdd(response) {
    $('.minicart').trigger('count:update', response);
    var messageType = response.error ? 'alert-danger' : 'alert-success';
    // show add to cart toast
    if (response.newBonusDiscountLineItem &&
        Object.keys(response.newBonusDiscountLineItem).length !== 0) {
        chooseBonusProducts(response.newBonusDiscountLineItem);
    } else {
        if ($('.add-to-cart-messages').length === 0) {
            $('body').append(
                '<div class="add-to-cart-messages"></div>'
            );
        }

        $('.add-to-cart-messages').append(
            '<div class="alert ' + messageType + ' add-to-basket-alert text-center" role="alert">' +
            response.message +
            '</div>'
        );

        setTimeout(function () {
            $('.add-to-basket-alert').remove();
        }, 5000);
    }
}

/**
 * Makes a call to the server to report the event of adding an item to the cart
 *
 * @param {string | boolean} url - a string representing the end point to hit so that the event can be recorded, or false
 */
function miniCartReportingUrl(url) {
    if (url) {
        $.ajax({
            url: url,
            method: 'GET',
            success: function () {
                // reporting urls hit on the server
            },
            error: function () {
                // no reporting urls hit on the server
            }
        });
    }
}


$('form.form-donation').submit(function (e) {
    var $form = $(this);
    e.preventDefault();
    url = $form.attr('action');
    $form.spinner().start();
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: $form.serialize(),
        success: function (data) {
            handlePostCartAdd(data);
            $form.spinner().stop();
            miniCartReportingUrl(data.reportingURL);
            var successMessage = '<h1>' + data.message + '</h1>';
            $form.html(successMessage);
            window.location.href = data.redirectUrl;
        },
        error: function (err) {
            $form.spinner().stop();
            window.location.href = err.responseJSON.redirectUrl;
        }
    });
});