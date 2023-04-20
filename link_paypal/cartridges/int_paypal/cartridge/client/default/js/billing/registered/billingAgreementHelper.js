import {
    hideContinueButton,
    isNewAccountSelected,
    showContinueButton,
    showPaypalBlock
} from '../billingHelper';

var $billingBAbutton = document.querySelector('.paypal-checkout-ba-button');
var $restPaypalAccountsList = document.querySelector('#restPaypalAccountsList');
var $paypalAccountSave = document.querySelector('#savePaypalAccount');
var $paypalAccountMakeDefault = document.querySelector('#paypalAccountMakeDefault');

const dataAttributes = {
    ID: 'data-ba-id',
    APPEND: 'data-append',
    SAVED_ACCOUNT: 'data-has-saved-account',
    DEFAULT_ACCOUNT: 'data-has-default-account',
    LIMIT_REACHED: 'data-ba-limit-reached'
};

const querySelectors = {
    OPTION_CHECKED: 'option:checked'
};

/**
 * Sets BA id & email to form values
 * @param {string} baID - billing agreement active ID
 * @param {string} baEmail - billing agreement active email
*/
function setBAFormValues(baID, baEmail) {
    document.getElementById('billingAgreementID').value = baID;
    document.getElementById('billingAgreementPayerEmail').value = baEmail;
}

/** Shows PayPal BA button if it's not visible and hides continue button
*/
function showPaypalBABtn() {
    if ($billingBAbutton.style.display !== 'block') {
        $billingBAbutton.style.display = 'block';
    }
    hideContinueButton();
}

/** Hides PayPal BA button if it's not hidden and shows continue button
*/
function hidePaypalBABtn() {
    if ($billingBAbutton.style.display !== 'none') {
        $billingBAbutton.style.display = 'none';
    }

    showContinueButton();
}

/** Put value of checkbox makeDefault/saveAccount for backend
*/
function saveCheckboxState() {
    var $paypalMakeDefault = document.querySelector('#paypal_makeDefault');
    var $paypalSaveAccount = document.querySelector('#paypal_saveAccount');
    $paypalMakeDefault.value = $paypalAccountMakeDefault.checked;
    $paypalSaveAccount.value = $paypalAccountSave.checked;
}

/** Handle makeDefault/saveAccount checkboxes state on change
*/
function handleCheckboxChange() {
    var hasDefaultPaymentMethod = JSON.parse($restPaypalAccountsList.getAttribute(dataAttributes.DEFAULT_ACCOUNT));
    const $selectedAccount = $restPaypalAccountsList && $restPaypalAccountsList.querySelector(querySelectors.OPTION_CHECKED);
    const isSessionAccountAppended = $selectedAccount && JSON.parse($selectedAccount.getAttribute(dataAttributes.APPEND));

    if (isSessionAccountAppended || $selectedAccount.value === 'newaccount') {
        if (!$paypalAccountSave.checked) {
            $paypalAccountMakeDefault.checked = false;
            $paypalAccountMakeDefault.disabled = true;
        } else {
            $paypalAccountMakeDefault.disabled = false;
            if (!hasDefaultPaymentMethod) {
                $paypalAccountMakeDefault.checked = true;
            }
        }
    }

    saveCheckboxState();
}

/** Show/hide/check/disable checkboxes depends on selected type of account
*/
function toggleCustomCheckbox() {
    var $paypalAccountMakeDefaultContainer = document.querySelector('#paypalAccountMakeDefaultContainer');
    var $paypalAccountSaveContainer = document.querySelector('#savePaypalAccountContainer');
    var hasPPSavedAccount = JSON.parse($restPaypalAccountsList.getAttribute(dataAttributes.SAVED_ACCOUNT));
    var hasDefaultPaymentMethod = JSON.parse($restPaypalAccountsList.getAttribute(dataAttributes.DEFAULT_ACCOUNT));
    var isBALimitReached = JSON.parse($restPaypalAccountsList.getAttribute(dataAttributes.LIMIT_REACHED));
    const $newSelectedAccount = $restPaypalAccountsList && $restPaypalAccountsList.querySelector(querySelectors.OPTION_CHECKED);
    const isSessionAccountAppended = $newSelectedAccount && JSON.parse($newSelectedAccount.getAttribute(dataAttributes.APPEND));

    if ($paypalAccountSaveContainer) {
        if ($newSelectedAccount.dataset.default === 'true') {
            $paypalAccountMakeDefaultContainer.style.display = 'none';
            $paypalAccountMakeDefault.checked = true;
            $paypalAccountMakeDefault.disabled = false;
            if (hasPPSavedAccount && !hasDefaultPaymentMethod) {
                $paypalAccountSave.checked = true;
            } else {
                $paypalAccountSaveContainer.style.display = 'none';
            }
            saveCheckboxState();
        }
        var isDataSetDefault = $newSelectedAccount.dataset.default === 'false' || $newSelectedAccount.dataset.default === 'null';
        if (isDataSetDefault && ($newSelectedAccount.value !== 'newaccount') && !isSessionAccountAppended) {
            $paypalAccountMakeDefaultContainer.style.display = 'block';
            $paypalAccountSaveContainer.style.display = 'none';
            $paypalAccountSave.checked = false;
            $paypalAccountMakeDefault.disabled = false;
        }

        if ($newSelectedAccount.value === 'newaccount' || isSessionAccountAppended) {
            if (!hasPPSavedAccount) {
                $paypalAccountMakeDefaultContainer.style.display = 'none';
                $paypalAccountMakeDefault.checked = true;
                $paypalAccountMakeDefault.disabled = false;
                $paypalAccountSaveContainer.style.display = 'block';
                if (($newSelectedAccount.value !== 'newaccount' && (hasDefaultPaymentMethod || isSessionAccountAppended)) ||
                    ($newSelectedAccount.value === 'newaccount' && !isSessionAccountAppended)) {
                    $paypalAccountSave.checked = true;
                } else {
                    $paypalAccountSave.checked = false;
                }

                saveCheckboxState();
                return;
            }
            handleCheckboxChange();

            if (isBALimitReached) {
                $paypalAccountSaveContainer.style.display = 'none';
                $paypalAccountMakeDefaultContainer.style.display = 'none';
            } else {
                $paypalAccountSaveContainer.style.display = 'block';
                $paypalAccountMakeDefaultContainer.style.display = 'block';
            }

            if (hasDefaultPaymentMethod) {
                return;
            }

            if (hasPPSavedAccount && !hasDefaultPaymentMethod) {
                $paypalAccountMakeDefaultContainer.style.display = 'none';
            } else {
                $paypalAccountMakeDefault.disabled = true;
            }

            $paypalAccountMakeDefault.checked = true;
        }
    }
}

/** Show billing agreement btn - hide paypal btn and vise versa
*/
function toggleBABtnVisibility() {
    toggleCustomCheckbox();

    if (isNewAccountSelected($restPaypalAccountsList)) {
        showPaypalBABtn();

        return;
    }

    hidePaypalBABtn();
    showPaypalBlock();
}

/** Assign billing agreement emails on change into input field
*/
function assignEmailForSavedBA() {
    var $paypalActiveAccount = document.querySelector('#paypal_activeAccount');
    const $selectedAccount = $restPaypalAccountsList && $restPaypalAccountsList.querySelector(querySelectors.OPTION_CHECKED);

    if (isNewAccountSelected($restPaypalAccountsList)) {
        $paypalActiveAccount.value = '';
        document.getElementById('billingAgreementID').value = '';
        document.getElementById('billingAgreementPayerEmail').value = '';
    } else {
        $paypalActiveAccount.value = $restPaypalAccountsList.querySelector(querySelectors.OPTION_CHECKED).value;

        setBAFormValues($selectedAccount.dataset.baId, $selectedAccount.value);
    }
}

/**
 *  Clear element to an Existing restPaypalAccountsList Collection
 *
 */
function clearSessionOption() {
    var $option = document.querySelector('#sessionPaypalAccount');
    $option.text = '';
    $option.value = '';
    $option.setAttribute(dataAttributes.APPEND, false);
    $option.selected = false;
    $option.style.display = 'none';
    $option.setAttribute(dataAttributes.ID, '');
    document.getElementById('billingAgreementID').value = '';
    document.getElementById('billingAgreementPayerEmail').value = '';

    toggleBABtnVisibility();
}

/**
 *  Update element under restPaypalAccountsList Collection
 *
 * @param {string} email - billing agreement email
 */
function updateSessionOption(email) {
    var $option = document.querySelector('#sessionPaypalAccount');
    $option.text = email;
    $option.value = email;
    $option.selected = 'selected';
    $option.style.display = 'block';
    $option.setAttribute(dataAttributes.APPEND, true);
    document.querySelector('#restPaypalAccountsList').value = email;

    hidePaypalBABtn();
    showPaypalBlock();
    showContinueButton();
}

export {
    toggleBABtnVisibility,
    assignEmailForSavedBA,
    handleCheckboxChange,
    clearSessionOption,
    updateSessionOption,
    setBAFormValues
};
