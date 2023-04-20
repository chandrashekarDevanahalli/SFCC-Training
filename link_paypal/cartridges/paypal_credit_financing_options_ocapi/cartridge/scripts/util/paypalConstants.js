module.exports = {
    PAYMENT_METHOD_TYPE: 'PayPal',
    STAGE_QUERY_PARAMETER: 'stage',
    CUSTOM_ERROR_TYPE: 'customError',
    // The custom Ocapi 'flashes' types
    CUSTOMER_EMAIL_REQUIRED_FLASH_TYPE: 'CustomerEmailRequired',
    // The custom Ocapi 'flashes' paths
    CUSTOMER_EMAIL_REQUIRED_FLASH_PATH: '$.customer_info.email',
    // payment method id
    PAYMENT_METHOD_ID_PAYPAL: 'PayPal',
    PAYMENT_METHOD_ID_VENMO: 'Venmo',
    PAYMENT_METHOD_ID_Debit_Credit_Card: 'PayPal Debit/Credit Card',
    PAYMENT_METHOD_ID_EXPRESS: 'express',
    // Page flows
    PAGE_FLOW_PLP: 'plp',
    PAGE_FLOW_PDP: 'pdp',
    PAGE_FLOW_BILLING: 'billing',
    PAGE_FLOW_MINICART: 'minicart',
    PAGE_FLOW_CART: 'cart',
    // Payment processors
    PROCESSOR_PAYPAL: 'PAYPAL',
    // Patterns
     //eslint-disable-next-line
    EMAIL_PATTERN: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    // Tokes types
    BILLING_AGREEMENT_TYPE: 'BILLING_AGREEMENT',
    // Transaction statuses
    TRANSACTION_STATUS_CAPTURED: 'CAPTURED',
    // OCAPI query parameter
    CREATE_BA_TOKEN_QUERY_PARAMETER: 'createBillingAgreementToken',
    ALLOWED_STAGE_QUERY_PARAMETERS: ['createBillingAgreementToken'],
    QUERY_PARAMETER_CURRENCY_CODE: 'currencyCode',
    QUERY_PARAMETER_CURRENCY_CODE_VALUE: 'GBP',
    QUERY_PARAMETER_COUNTRY_CODE: 'countryCode',
    QUERY_PARAMETER_COUNTRY_CODE_VALUE: 'GB',
    QUERY_PARAMETER_PAGE_ID: 'pageId',
    ALLOWED_QUERY_PARAMETER_PAGE_IDS: ['plp','pdp', 'cart', 'minicart', 'billing'],
    // Intent types
    INTENT_AUTHORIZE: 'AUTHORIZE',
    INTENT_CAPTURE: 'CAPTURE',
    // Action type
    ACTION_TYPE_AUTHORIZE: 'authorize',
    ACTION_TYPE_CAPTURE: 'capture',
    // Status
    STATUS_SUCCESS: 'SUCCESS',
    // Event types
    PAYMENT_AUTHORIZATION_VOIDED: 'PAYMENT.AUTHORIZATION.VOIDED',
    PAYMENT_CAPTURE_REFUNDED: 'PAYMENT.CAPTURE.REFUNDED',
    PAYMENT_CAPTURE_COMPLETED: 'PAYMENT.CAPTURE.COMPLETED',
    // Http methods
    METHOD_POST: 'POST',
    METHOD_GET: 'GET',
    // Request Type
    ACCESS_TOKEN: 'access_token',
    USER_INFO: 'userinfo',
    VERIFY_WH_SIG: 'verify-webhook-signature'
};
