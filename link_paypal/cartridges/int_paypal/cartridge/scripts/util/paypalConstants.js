module.exports = {
    // Request Type
    ACCESS_TOKEN: 'access_token',
    USER_INFO: 'userinfo',
    VERIFY_WH_SIG: 'verify-webhook-signature',
    // Event types
    PAYMENT_AUTHORIZATION_VOIDED: 'PAYMENT.AUTHORIZATION.VOIDED',
    PAYMENT_CAPTURE_REFUNDED: 'PAYMENT.CAPTURE.REFUNDED',
    PAYMENT_CAPTURE_COMPLETED: 'PAYMENT.CAPTURE.COMPLETED',
    // Status
    STATUS_SUCCESS: 'SUCCESS',
    // Http methods
    METHOD_POST: 'POST',
    METHOD_GET: 'GET',
    // Payment status names
    PAYMENT_STATUS_REFUNDED: 'REFUNDED',
    // Connect with Paypal
    CONNECT_WITH_PAYPAL_CONSENT_DENIED: 'Consent denied',
    // Endpoint names
    ENDPOINT_HOME_SHOW: 'Home-Show',
    ENDPOINT_ACCOUNT_SHOW: 'Account-Show',
    ENDPOINT_CHECKOUT_LOGIN: 'Checkout-Login',
    ENDPOINT_PAYPAL_APMA: 'Paypal-APMA',
    // Payment method id
    PAYMENT_METHOD_ID_PAYPAL: 'PayPal',
    PAYMENT_METHOD_ID_VENMO: 'Venmo',
    PAYMENT_METHOD_ID_Debit_Credit_Card: 'PayPal Debit/Credit Card',
    // BT PayPal Smart Buttons funding sources types
    PP_FUNDING_SOURCE_CARD: 'card',
    // BT PayPal Smart Buttons payments types
    PP_DEBIT_CREDIT_PAYMENT_TYPE: 'PayPal Debit/Credit Card',
    // Connect with PayPal
    LOGIN_PAYPAL: 'login-PayPal',
    // APMA (Automatic Payment Method Adding)
    APMA_STAGE_COMPLETE: 'complete',
    APMA_STAGE_ADDRESS: 'address',
    APMA_STAGE_ACCOUNT: 'account',
    // Flash message types
    FLASH_MESSAGE_SUCCESS: 'success',
    FLASH_MESSAGE_INFO: 'info',
    FLASH_MESSAGE_DANGER: 'danger',
    // Authentication Provider ID
    AUTHENTICATION_PAYPAL_PROVIDER_ID: 'PayPal',
    // RegExp patterns
    REGEXP_PHONE: /^[0-9]{1,14}?$/,
    REGEXP_EMAIL: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    REGEXP_NOT_EMPTY_STRING: /=(?!\s*$).+/
};
