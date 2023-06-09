 const types = {
     flex: ['styleRatio', 'styleColor'],
     text: ['styleTextColor', 'styleLogoPosition', 'styleLogoType'],
     LogoPosition: ['styleLogoPosition']
 };
 const $styleLogoType = document.querySelector('#styleLogoType');
 const $styleLayout = document.querySelector('#styleLayout');
 const $styleColor = document.querySelector('#styleColor');
 const $styleRatio = document.querySelector('#styleRatio');
 const $styleTextColor = document.querySelector('#styleTextColor');
 const $styleLogoPosition = document.querySelector('#styleLogoPosition');
 const $placement = document.querySelector('#placement');
 const $creditbannerConfigForm = document.getElementById('creditbanner-config-form');

 /**
 *  Appends Alerts message
 *
 * Avaible alerts types:
 * primary,  secondary, success, danger, warning, info, alert, dark
 * @param {Object} alert Alerts and type messages
 */
 function showCreditBannerAlerts(alert) {
     const alertDiv = document.querySelector('#credit-banner-alert-message');
     alertDiv.innerHTML = `<h5>${alert.message}</h5>`;
     alertDiv.className = `alert alert-${alert.type} show`;
     window.scrollTo(0, 450);
 }

 /**
 *  Fades Alerts message
 */
 function fadeCreditBannerAlerts() {
     const alertDiv = document.querySelector('#credit-banner-alert-message');
     alertDiv.innerHTML = '';
     alertDiv.className = 'alert alert-success fade';
 }
/**
 * Looping through array
 * showing or hiding selected divs
 *
 * @param {Array} layout flex and text configurations
 * @param {string} display value none or block
 */
 function toggleDisplay(layout, display) {
     layout.forEach(element => {
         document.querySelector(`#${element}`).parentNode.style.display = display;
     });
 }

 /**
 *  Toggle (Hide/Show) an Element's
 *
 * @param {string} styleLayout value none or block
 */
 function toggleElement(styleLayout) {
     if (styleLayout) {
         toggleDisplay(types.text, 'block');
         toggleDisplay(types.flex, 'none');
     } else {
         toggleDisplay(types.text, 'none');
         toggleDisplay(types.flex, 'block');
     }
 }

  /**
 *  Toggle (Hide/Show) an Logo Position values
 *
 */
 function toggleLogoPosition() {
     const isLogoPosition = $styleLogoType.value;
     const isTextStyleLayout = $styleLayout.value === 'text';
     if (isTextStyleLayout) {
         if (isLogoPosition === 'primary' || isLogoPosition === 'alternative') {
             toggleDisplay(types.LogoPosition, 'block');
         } else {
             toggleDisplay(types.LogoPosition, 'none');
         }
     }
 }

  /**
 * Update html option values with saved Pay Pal, Banner Styles values from custom pref PP_API_Credit_Banner_Styles
 *
 * @param {Object} savedCreditBannerConfig object with styleColor, styleRatio, placement, styleLayout, styleTextColor, styleLogoPosition, styleLogoType configs
*/
 function updateValuesWithConfigs(savedCreditBannerConfig) {
     Object.keys(savedCreditBannerConfig).forEach(element => {
         document.querySelector(`#${element}`).value = savedCreditBannerConfig[element];
     });
 }

/**
 * Return style configurations for Credit Message
 *  Available values type Text:
 *  textColor: (string) black, white, monochrome, grayscale
 *  logoPosition: (string) left, right, top
 *  logoType: (string) primary, alternative, inline, none
 *
 *  Available values type Flex:
 *  styleRatio: (number) 1x1 1x4, 8x1, 20x1
 *  styleColor: (string) glue, gray, white, black
 *
 * @returns {Object} object with styleColor, styleRatio, placement, styleLayout, styleTextColor, styleLogoPosition, styleLogoType
*/
 function getCreditMessageStyleConfigs() {
     return {
         styleColor: $styleColor.value,
         styleRatio: $styleRatio.value,
         styleLayout: $styleLayout.value,
         styleTextColor: $styleTextColor.value,
         styleLogoPosition: $styleLogoPosition.value,
         styleLogoType: $styleLogoType.value
     };
 }

 /**
 * Update html data attributes with saved Pay Pal, Banner Styles values from custom pref PP_API_Credit_Banner_Styles
 *
 * @param {Object} savedCreditBannerConfig object with styleColor, styleRatio, placement, styleLayout, styleTextColor, styleLogoPosition, styleLogoType configs
*/
 function updateAttributes(savedCreditBannerConfig) {
     const $creditMessagePDP = document.querySelector('.js_credit_message_pdp');
     $creditMessagePDP.setAttribute('data-pp-style-color', savedCreditBannerConfig.styleColor);
     $creditMessagePDP.setAttribute('data-pp-style-ratio', savedCreditBannerConfig.styleRatio);
     $creditMessagePDP.setAttribute('data-pp-style-layout', savedCreditBannerConfig.styleLayout);
     $creditMessagePDP.setAttribute('data-pp-style-text-color', savedCreditBannerConfig.styleTextColor);
     $creditMessagePDP.setAttribute('data-pp-style-logo-position', savedCreditBannerConfig.styleLogoPosition);
     $creditMessagePDP.setAttribute('data-pp-style-logo-type', savedCreditBannerConfig.styleLogoType);
 }

 document.addEventListener('DOMContentLoaded', function () {
     let pageType = $placement[0].value;
     if (window.location.search.split('=')[0] === '?savedBannerStyles') {
         pageType = window.location.search.split('=')[1];
         window.history.replaceState(null, null, window.location.pathname);
         window.scrollTo(0, 450);
     }

     const creditBannerConfig = JSON.parse($creditbannerConfigForm.getAttribute('data-banner-styles'))[pageType];
     creditBannerConfig.placement = pageType;
     updateAttributes(creditBannerConfig);
     updateValuesWithConfigs(creditBannerConfig);
     toggleElement(creditBannerConfig.styleLayout === 'text');
     toggleLogoPosition();
 });

 $styleColor.addEventListener('change', () => {
     fadeCreditBannerAlerts();
     updateAttributes(getCreditMessageStyleConfigs());
 });
 $styleRatio.addEventListener('change', () => {
     fadeCreditBannerAlerts();
     updateAttributes(getCreditMessageStyleConfigs());
 });
 $placement.addEventListener('change', () => {
     const pageType = $placement.value;
     const savedCreditBannerConfig = JSON.parse($creditbannerConfigForm.getAttribute('data-banner-styles'))[pageType];
     savedCreditBannerConfig.placement = pageType;
     updateAttributes(savedCreditBannerConfig);
     updateValuesWithConfigs(savedCreditBannerConfig);
     toggleElement(savedCreditBannerConfig.styleLayout === 'text');
     fadeCreditBannerAlerts();
 });
 $styleLayout.addEventListener('change', () => {
     const styleLayout = $styleLayout.value;
     toggleElement(styleLayout === 'text');
     fadeCreditBannerAlerts();
     updateAttributes(getCreditMessageStyleConfigs());
 });
 $styleTextColor.addEventListener('change', () => {
     fadeCreditBannerAlerts();
     updateAttributes(getCreditMessageStyleConfigs());
 });
 $styleLogoPosition.addEventListener('change', () => {
     fadeCreditBannerAlerts();
     updateAttributes(getCreditMessageStyleConfigs());
 });
 $styleLogoType.addEventListener('change', () => {
    // Text logo position is only available with logo.type values: primary, alternative
     fadeCreditBannerAlerts();
     updateAttributes(getCreditMessageStyleConfigs());
     toggleLogoPosition();
     showCreditBannerAlerts(window.resourcesAlertMessages.logoPosition);
 });

 $creditbannerConfigForm.addEventListener('submit', (e) => {
     e.preventDefault();
     // eslint-disable-next-line no-undef
     jQuery.post(e.currentTarget.action, e.currentTarget.serialize())
            .done(function (data) {
                location.href = data.redirectUrl;
            })
            .fail(function (err) {
                showCreditBannerAlerts({
                    message: err.responseText,
                    type: 'danger'
                });
            });
     return false;
 });
