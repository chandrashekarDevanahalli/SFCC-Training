/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./cartridges/app_custom_training/cartridge/client/default/js/donationForm.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/util.js":
/*!***************************************************************************************************************!*\
  !*** ../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/util.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n\r\nmodule.exports = function (include) {\r\n    if (typeof include === 'function') {\r\n        include();\r\n    } else if (typeof include === 'object') {\r\n        Object.keys(include).forEach(function (key) {\r\n            if (typeof include[key] === 'function') {\r\n                include[key]();\r\n            }\r\n        });\r\n    }\r\n};\r\n\n\n//# sourceURL=webpack:///../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/util.js?");

/***/ }),

/***/ "./cartridges/app_custom_training/cartridge/client/default/js/donation/donationFormData.js":
/*!*************************************************************************************************!*\
  !*** ./cartridges/app_custom_training/cartridge/client/default/js/donation/donationFormData.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\r\n * Updates the Mini-Cart quantity value after the customer has pressed the \"Add to Cart\" button\r\n * @param {string} response - ajax response from clicking the add to cart button\r\n */\r\nfunction handlePostCartAdd(response) {\r\n    $('.minicart').trigger('count:update', response);\r\n    var messageType = response.error ? 'alert-danger' : 'alert-success';\r\n    // show add to cart toast\r\n    if (response.newBonusDiscountLineItem &&\r\n        Object.keys(response.newBonusDiscountLineItem).length !== 0) {\r\n        chooseBonusProducts(response.newBonusDiscountLineItem);\r\n    } else {\r\n        if ($('.add-to-cart-messages').length === 0) {\r\n            $('body').append(\r\n                '<div class=\"add-to-cart-messages\"></div>'\r\n            );\r\n        }\r\n\r\n        $('.add-to-cart-messages').append(\r\n            '<div class=\"alert ' + messageType + ' add-to-basket-alert text-center\" role=\"alert\">' +\r\n            response.message +\r\n            '</div>'\r\n        );\r\n\r\n        setTimeout(function () {\r\n            $('.add-to-basket-alert').remove();\r\n        }, 5000);\r\n    }\r\n}\r\n\r\n/**\r\n * Makes a call to the server to report the event of adding an item to the cart\r\n *\r\n * @param {string | boolean} url - a string representing the end point to hit so that the event can be recorded, or false\r\n */\r\nfunction miniCartReportingUrl(url) {\r\n    if (url) {\r\n        $.ajax({\r\n            url: url,\r\n            method: 'GET',\r\n            success: function () {\r\n                // reporting urls hit on the server\r\n            },\r\n            error: function () {\r\n                // no reporting urls hit on the server\r\n            }\r\n        });\r\n    }\r\n}\r\n\r\n\r\n$('form.form-donation').submit(function (e) {\r\n    var $form = $(this);\r\n    e.preventDefault();\r\n    url = $form.attr('action');\r\n    $form.spinner().start();\r\n    $.ajax({\r\n        url: url,\r\n        type: 'post',\r\n        dataType: 'json',\r\n        data: $form.serialize(),\r\n        success: function (data) {\r\n            handlePostCartAdd(data);\r\n            $form.spinner().stop();\r\n            miniCartReportingUrl(data.reportingURL);\r\n            var successMessage = '<h1>' + data.message + '</h1>';\r\n            $form.html(successMessage);\r\n            window.location.href = data.redirectUrl;\r\n        },\r\n        error: function (err) {\r\n            $form.spinner().stop();\r\n            window.location.href = err.responseJSON.redirectUrl;\r\n        }\r\n    });\r\n});\n\n//# sourceURL=webpack:///./cartridges/app_custom_training/cartridge/client/default/js/donation/donationFormData.js?");

/***/ }),

/***/ "./cartridges/app_custom_training/cartridge/client/default/js/donationForm.js":
/*!************************************************************************************!*\
  !*** ./cartridges/app_custom_training/cartridge/client/default/js/donationForm.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n\r\nvar processInclude = __webpack_require__(/*! base/util */ \"../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/util.js\");\r\n\r\n$(document).ready(function () {\r\n    processInclude(__webpack_require__(/*! ./donation/donationFormData */ \"./cartridges/app_custom_training/cartridge/client/default/js/donation/donationFormData.js\"));\r\n\r\n});\n\n//# sourceURL=webpack:///./cartridges/app_custom_training/cartridge/client/default/js/donationForm.js?");

/***/ })

/******/ });