import { Common, Utils } from './jumio.common';
import { Application } from '@nativescript/core';
;
export class Jumio extends Common {
    constructor({ merchantApiToken, merchantApiSecret, datacenter }) {
        super(merchantApiToken, merchantApiSecret, datacenter);
        this.androidActivity = Application.android.foregroundActivity;
        try {
            this.netverifySDK = com.jumio.nv.NetverifySDK.create(this.androidActivity, merchantApiToken, merchantApiSecret, this.mapDataCenter(datacenter));
            this.netverifySDK.setEnableVerification(true);
            this.netverifySDK.setEnableIdentityVerification(true);
            if (!com.jumio.nv.NetverifySDK.isSupportedPlatform(this.androidActivity)) {
                Utils.error('Platform not supported');
            }
            if (com.jumio.nv.NetverifySDK.isRooted(this.androidActivity)) {
                Utils.error('Device is rooted');
            }
        }
        catch (e) {
            this.cleanupSDK();
            Utils.error(e);
            throw new Error(e);
        }
    }
    init({ customerId, callbackUrl = null, preSelectedData = null, cancelWithError = null, finishInitWithError = null, finishedScan = null }) {
        this.netverifySDK.setCustomerInternalReference(customerId);
        if (callbackUrl) {
            this.netverifySDK.setCallbackUrl(callbackUrl);
        }
        if (preSelectedData) {
            const { documentType, country } = preSelectedData;
            this.netverifySDK.setPreselectedCountry(com.jumio.nv.IsoCountryConverter.convertToAlpha3(country));
            this.netverifySDK.setPreselectedDocumentVariant(com.jumio.nv.data.document.NVDocumentVariant.PLASTIC);
            const preSelectedDocTypes = new java.util.ArrayList();
            preSelectedDocTypes.add(this.mapDocumentType(documentType));
            this.netverifySDK.setPreselectedDocumentTypes(preSelectedDocTypes);
        }
        this.netverifySDK.initiate(new com.jumio.nv.NetverifyInitiateCallback({
            onNetverifyInitiateSuccess: () => {
                this.onActivityResultCallback = (event) => this.onActivityResult(event, { cancelWithError, finishedScan });
                Application.android.on('activityResult', this.onActivityResultCallback);
                this.netverifySDK.start();
            },
            onNetverifyInitiateError: (code, message) => {
                finishInitWithError({ code, message });
                this.cleanupSDK();
            }
        }));
    }
    onActivityResult({ requestCode, resultCode, intent }, { finishedScan, cancelWithError }) {
        if (requestCode === com.jumio.nv.NetverifySDK.REQUEST_CODE) {
            const scanReference = intent.getStringExtra(com.jumio.nv.NetverifySDK.EXTRA_SCAN_REFERENCE);
            if (resultCode === android.app.Activity.RESULT_OK) {
                const intentData = intent.getParcelableExtra(com.jumio.nv.NetverifySDK.EXTRA_SCAN_DATA);
                let documentData = {};
                for (const prop in intentData) {
                    if (prop.startsWith('get')) {
                        try {
                            const processedKey = prop[3].toLowerCase() + prop.slice(4, prop.length);
                            documentData = Object.assign(Object.assign({}, documentData), { [processedKey]: intentData[prop]() });
                        }
                        catch (e) {
                            Utils.error(e);
                        }
                    }
                }
                const { issuingCountry, selectedCountry, gender } = documentData;
                finishedScan(Object.assign(Object.assign({}, documentData), { issuingCountry: com.jumio.nv.IsoCountryConverter.convertToAlpha2(issuingCountry), selectedCountry: com.jumio.nv.IsoCountryConverter.convertToAlpha2(selectedCountry), genderStr: this.getGender(gender) }), scanReference);
            }
            else if (resultCode === android.app.Activity.RESULT_CANCELED) {
                const errorMessage = intent.getStringExtra(com.jumio.nv.NetverifySDK.EXTRA_ERROR_MESSAGE);
                const errorCode = intent.getStringExtra(com.jumio.nv.NetverifySDK.EXTRA_ERROR_CODE);
                cancelWithError({ code: errorCode, message: errorMessage }, scanReference);
            }
            Application.android.off('activityResult', this.onActivityResultCallback);
            this.cleanupSDK();
        }
    }
    cleanupSDK() {
        if (this.netverifySDK) {
            this.netverifySDK.destroy();
            this.netverifySDK = null;
        }
    }
    getGender(gender) {
        const genderType = com.jumio.nv.enums.NVGender;
        switch (gender) {
            case genderType.F:
                return "Female";
            case genderType.M:
                return "Male";
            case genderType.X:
                return "Unspecified";
            default:
                return "Unknown";
        }
    }
    mapDocumentType(documentType) {
        console.log(com.jumio.nv.data.document);
        const docTypes = com.jumio.nv.data.document.NVDocumentType;
        switch (documentType.toUpperCase()) {
            case 'IDENTITY_CARD':
                return docTypes.IDENTITY_CARD;
            case 'PASSPORT':
                return docTypes.PASSPORT;
            case 'DRIVER_LICENSE':
                return docTypes.DRIVER_LICENSE;
            case 'VISA':
                return docTypes.VISA;
            default:
                return docTypes.IDENTITY_CARD;
        }
    }
    mapDataCenter(datacenter) {
        switch (datacenter.toUpperCase()) {
            case 'EU':
                return com.jumio.core.enums.JumioDataCenter.EU;
            case 'US':
                return com.jumio.core.enums.JumioDataCenter.US;
            case 'SG':
                return com.jumio.core.enums.JumioDataCenter.SG;
            default:
                return com.jumio.core.enums.JumioDataCenter.EU;
        }
    }
}
//# sourceMappingURL=jumio.android.js.map