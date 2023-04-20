var { expect } = require('chai');
var { financialPreferencesPath } = require('./path');

require('dw-api-mock/demandware-globals');

let campaignResponse;
let bannerSize;

const resposeObj = {
    bannerSize,
    publisherID: 'PP_Merchant_Publisher_ID',
    isActive: 'PP_ShowCreditFinancialBanners'
};

const financialPreferences = require('proxyquire').noCallThru()(financialPreferencesPath, {
    'dw/system/Site': {
        current: {
            getCustomPreferenceValue: value => value
        }
    },
    'dw/campaign/PromotionMgr': {
        getCampaign: () => campaignResponse
    }
});

describe('financialPreferences', () => {
    describe('getCreditBannerData', () => {
        before(() => {
            campaignResponse = {
                isActive: () => true
            };
        });
        it('response type should be equal -> object', () => {
            expect(financialPreferences).to.be.a('object');
        });
        it('response should be deep equal -> responseObj', () => {
            expect(financialPreferences).deep.equal(resposeObj);
        });
    });
});
