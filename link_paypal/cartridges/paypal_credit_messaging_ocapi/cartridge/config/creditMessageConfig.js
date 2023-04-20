const BannerConfigs = JSON.parse(require('dw/system/Site').current.getCustomPreferenceValue('PP_API_Credit_Banner_Styles'));

module.exports = {
    cartMessageConfig: BannerConfigs.cartCreditConfig,
    productDetailMessageConfig: BannerConfigs.productCreditConfig,
    categoryMessageConfig: BannerConfigs.categoryCreditConfig
};
