'use strict';

module.exports = {
    updateAddToCartFormData: function () {
        $('button.add-to-cart,button.add-to-cart-global').on("updateAddToCartFormData", function (event, form) {
            form.frontName = $("#customFrontText").val();
            form.backName = $("#customBackText").val();

        })
    }
}