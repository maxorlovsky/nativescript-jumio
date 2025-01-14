import { Common, Utils, InitArgs, OnResultCallbacks } from './jumio.common';
import { Application } from '@nativescript/core';
import { AndroidActivityResultEventData } from '@nativescript/core/application/application-interfaces';

interface JumioError {
    code: string;
    message: string;
};

export class Jumio extends Common {
    private netverifySDK: com.jumio.nv.NetverifySDK;
    private androidActivity: android.app.Activity;
    private onActivityResultCallback: (event: AndroidActivityResultEventData) => void;

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

        } catch (e) {
            this.destroy();
            Utils.error(e);
            throw new Error(e);
        }
    }

    public init({
        customerId,
        callbackUrl = null,
        preSelectedData = null,
        cancelWithError = null,
        finishInitWithError = null,
        finishedScan = null
    }: InitArgs<JumioError, com.jumio.nv.NetverifyDocumentData>): void {
        this.netverifySDK.setCustomerInternalReference(customerId);

        if (callbackUrl) {
            this.netverifySDK.setCallbackUrl(callbackUrl);
        }

        if (preSelectedData) {
            const { documentType, country } = preSelectedData;

            this.netverifySDK.setPreselectedCountry(com.jumio.nv.IsoCountryConverter.convertToAlpha3(country));
            this.netverifySDK.setPreselectedDocumentVariant(com.jumio.nv.data.document.NVDocumentVariant.PLASTIC);

            const preSelectedDocTypes = new java.util.ArrayList<com.jumio.nv.data.document.NVDocumentType>();
            preSelectedDocTypes.add(this.mapDocumentType(documentType));

            this.netverifySDK.setPreselectedDocumentTypes(preSelectedDocTypes);
        }

        this.netverifySDK.initiate(new com.jumio.nv.NetverifyInitiateCallback({
            onNetverifyInitiateSuccess: () => {
                this.onActivityResultCallback = (event) => this.onActivityResult(event, { cancelWithError, finishedScan });
                Application.android.on('activityResult', this.onActivityResultCallback);
                this.netverifySDK.start();
            },
            onNetverifyInitiateError: (code: string, message: string) => {
                finishInitWithError({ code, message });
                this.destroy();
            }
        }));
    }

    private onActivityResult(
        { requestCode, resultCode, intent }: Partial<AndroidActivityResultEventData>,
        { finishedScan, cancelWithError }: OnResultCallbacks<JumioError, com.jumio.nv.NetverifyDocumentData>
    ): void {
        if (requestCode === com.jumio.nv.NetverifySDK.REQUEST_CODE) {
            const scanReference = intent.getStringExtra(com.jumio.nv.NetverifySDK.EXTRA_SCAN_REFERENCE) as string;

            if (resultCode === android.app.Activity.RESULT_OK) {
                const intentData = intent.getParcelableExtra(com.jumio.nv.NetverifySDK.EXTRA_SCAN_DATA) as com.jumio.nv.NetverifyDocumentData;

                let documentData = {} as Partial<com.jumio.nv.NetverifyDocumentData>;

                for (const prop in intentData) {
                    if (prop.startsWith('get')) {
                        try {
                            const processedKey = prop[3].toLowerCase() + prop.slice(4, prop.length);

                            documentData = {
                                ...documentData,
                                [processedKey]: intentData[prop]()
                            };
                        } catch (e) {
                            Utils.error(e);
                        }
                    }
                }

                const {
                    issuingCountry,
                    selectedCountry,
                    gender
                } = documentData;

                finishedScan({
                    ...documentData,
                    issuingCountry: com.jumio.nv.IsoCountryConverter.convertToAlpha2(issuingCountry),
                    selectedCountry: com.jumio.nv.IsoCountryConverter.convertToAlpha2(selectedCountry),
                    genderStr: this.getGender(gender)
                }, scanReference);
            } else if (resultCode === android.app.Activity.RESULT_CANCELED) {
                const errorMessage = intent.getStringExtra(com.jumio.nv.NetverifySDK.EXTRA_ERROR_MESSAGE) as string;
                const errorCode = intent.getStringExtra(com.jumio.nv.NetverifySDK.EXTRA_ERROR_CODE) as string;

                cancelWithError({ code: errorCode, message: errorMessage }, scanReference);
            }

            this.destroy();
        }
    }

    public destroy() {
        if (this.onActivityResultCallback) {
            Application.android.off('activityResult', this.onActivityResultCallback);

            this.onActivityResultCallback = null;
        }

        if (this.netverifySDK) {
            this.netverifySDK.destroy();
            this.netverifySDK = null;
        }
    }

    private getGender(gender: com.jumio.nv.enums.NVGender) {
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

    private mapDocumentType(documentType: string): com.jumio.nv.data.document.NVDocumentType {
        // Need the console log, otherwise the Android marshalling malfunctions. Will break if removed
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

    private mapDataCenter(datacenter: string): com.jumio.core.enums.JumioDataCenter {
        switch(datacenter.toUpperCase()) {
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