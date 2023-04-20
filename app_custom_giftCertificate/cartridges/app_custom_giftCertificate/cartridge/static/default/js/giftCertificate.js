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
/******/ 	return __webpack_require__(__webpack_require__.s = "./cartridges/app_custom_giftCertificate/cartridge/client/default/js/giftCertificate.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./cartridges/app_custom_giftCertificate/cartridge/client/default/js/giftCertificate.js":
/*!**********************************************************************************************!*\
  !*** ./cartridges/app_custom_giftCertificate/cartridge/client/default/js/giftCertificate.js ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n\r\n\r\nmodule.exports = {\r\n    giftCertificateChecker: function () {\r\n        $('#giftCertificate-check-balance').on('click', function (e) {\r\n            e.preventDefault();\r\n            var url = $(this).data('url');\r\n            var giftCertificateCode = $('#giftCertificate').val();\r\n            $('#gift-certificate-form').spinner().start();\r\n            $.ajax({\r\n                url: url,\r\n                type: 'POST',\r\n                dataType: 'json',\r\n                data: {\r\n                    giftCertificateCode: giftCertificateCode\r\n                },\r\n                success: function (response) {\r\n                    var message = response.Message;\r\n                    $('.giftCertificate-data-container').html(message);\r\n                    $('#gift-certificate-form').spinner().stop();\r\n                },\r\n                error: function (error) {\r\n                    $('#gift-certificate-form').spinner().stop();\r\n                    var message = '<h1>' + error.message + '</h1>';\r\n                    $('.giftCertificate-data-container').html(message);\r\n                }\r\n            });\r\n        });\r\n    },\r\n\r\n    giftCertificateApplier: function () {\r\n        $('.btn.giftCertificate-btn-apply').on('click', function (e) {\r\n            e.preventDefault();\r\n            var url = $(this).data('url');\r\n            var giftCertificateCode = $('#giftCertificate').val();\r\n            $('#gift-certificate-form').spinner().start();\r\n            $.ajax({\r\n                url: url,\r\n                type: 'POST',\r\n                dataType: 'json',\r\n                data: {\r\n                    giftCertificateCode: giftCertificateCode\r\n                },\r\n                success: function (response) {\r\n                    $('#gift-certificate-form').spinner().stop();\r\n                    if (response.status != 1) {\r\n                        var message = response.result;\r\n                        $('.giftCertificate-data-container').html(message);\r\n                        $('.giftCertificate-data-container').css('color', 'green');\r\n                        $('a').removeAttr('style');\r\n                    } else if (response.status == 1) {\r\n                        var message = reponse.result;\r\n                        $('.giftCertificate-data-container').html(message);\r\n                        $('.giftCertificate-data-container').css('color', 'red');\r\n                    } else {\r\n                        var message = reponse.result;\r\n                        $('.giftCertificate-data-container').html(message);\r\n                        $('.giftCertificate-data-container').css('color', 'red');\r\n                    }\r\n                    if (response.flag) {\r\n                        $('.credit-card-selection-new').addClass('d-none');\r\n                        $('.gift-cert-remove').removeClass('d-none');\r\n                        $('.payment-information').attr('data-payment-method-id', 'GIFT_CERTIFICATE');\r\n                    } else {\r\n                        $('.credit-card-selection-new').removeClass('d-none');\r\n                    }\r\n                },\r\n                error: function (error) {\r\n                    $('#gift-certificate-form').spinner().stop();\r\n                    var message = '<h1>' + error.message + '</h1>';\r\n                    $('.giftCertificate-data-container').html(message);\r\n                }\r\n\r\n            });\r\n        })\r\n    },\r\n\r\n    giftCertificateRemover: function () {\r\n        $('.gift-cert-remove').on('click', function (e) {\r\n            e.preventDefault();\r\n            var url = $(this).data('url');\r\n            var giftCertificateCode = $('#giftCertificate').val();\r\n            $('#gift-certificate-form').spinner().start();\r\n            $.ajax({\r\n                url: url,\r\n                type: 'POST',\r\n                dataType: 'json',\r\n                data: {\r\n                    giftCertificateCode: giftCertificateCode\r\n                },\r\n                success: function (response) {\r\n                    var message = response.message;\r\n                    $('#gift-certificate-form').spinner().stop();\r\n                    window.location.reload();\r\n                },\r\n                error: function (error) {\r\n                    $('#gift-certificate-form').spinner().stop();\r\n                    var message = '<h1>' + error.message + '</h1>';\r\n                    $('.giftCertificate-data-container').html(message);\r\n                }\r\n            });\r\n        });\r\n    }\r\n}\n\n//# sourceURL=webpack:///./cartridges/app_custom_giftCertificate/cartridge/client/default/js/giftCertificate.js?");

/***/ })

/******/ });