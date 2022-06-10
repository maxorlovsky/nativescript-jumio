var NsjumiopluginDelegateImpl_1;
import { Common, Utils } from './jumio.common';
import { Frame } from '@nativescript/core/ui/frame';
export class Jumio extends Common {
    constructor({ merchantApiToken, merchantApiSecret, datacenter }) {
        super(merchantApiToken, merchantApiSecret, datacenter);
    }
    init({ customerId, callbackUrl = null, preSelectedData = null, cancelWithError = null, finishInitWithError = null, finishedScan = null }) {
        this.cancelWithError = cancelWithError;
        this.finishInitWithError = finishInitWithError;
        this.finishedScan = finishedScan;
        let config = this.config;
        config = NetverifyConfiguration.new();
        config.enableVerification = true;
        config.apiToken = this.merchantApiToken;
        config.apiSecret = this.merchantApiSecret;
        config.dataCenter = this.mapDataCenter(this.datacenter);
        if (callbackUrl) {
            config.callbackUrl = callbackUrl;
        }
        if (preSelectedData) {
            const { country, documentType } = preSelectedData;
            config.preselectedCountry = ISOCountryConverter.convertToAlpha3(country);
            config.preselectedDocumentTypes = this.mapDocumentType(documentType);
            config.preselectedDocumentVariant = 2;
        }
        this.delegate = NsjumiopluginDelegateImpl.createWithOwnerResultCallback(new WeakRef(this), this.rootVC(), (netverifyViewController, documentData, scanReference) => {
            this.finishedScan(documentData, scanReference);
        });
        config.delegate = this.delegate;
        config.customerInternalReference = customerId;
        try {
            this.netverifyViewController = NetverifyViewController.alloc().initWithConfiguration(config);
            this.rootVC().presentViewControllerAnimatedCompletion(this.netverifyViewController, false, () => {
                Utils.log('presentViewControllerAnimatedCompletion done');
            });
        }
        catch (e) {
            Utils.error('EXCEPTION', e);
            throw new Error(e);
        }
    }
    rootVC() {
        const appWindow = UIApplication.sharedApplication.keyWindow;
        if (appWindow.rootViewController) {
            return appWindow.rootViewController;
        }
        Utils.error('rootViewController not found');
        let topMostFrame = Frame.topmost();
        if (topMostFrame) {
            let viewController = topMostFrame.currentPage && topMostFrame.currentPage.ios;
            if (viewController) {
                while (viewController.parentViewController) {
                    viewController = viewController.parentViewController;
                }
                while (viewController.presentedViewController) {
                    viewController = viewController.presentedViewController;
                }
                return viewController;
            }
        }
        Utils.error('ViewController not found');
        return null;
    }
    mapDocumentType(documentType) {
        switch (documentType.toUpperCase()) {
            case 'IDENTITY_CARD':
                return 4;
            case 'PASSPORT':
                return 1;
            case 'DRIVER_LICENSE':
                return 2;
            case 'VISA':
                return 8;
            default:
                return 4;
        }
    }
    mapDataCenter(datacenter) {
        switch (datacenter.toUpperCase()) {
            case 'EU':
                return 1;
            case 'US':
                return 0;
            case 'SG':
                return 2;
            default:
                return 1;
        }
    }
}
let NsjumiopluginDelegateImpl = NsjumiopluginDelegateImpl_1 = class NsjumiopluginDelegateImpl extends NSObject {
    static new() {
        return super.new();
    }
    static createWithOwnerResultCallback(owner, vc, callback) {
        const delegate = NsjumiopluginDelegateImpl_1.new();
        delegate._owner = owner;
        delegate._callback = callback;
        delegate._vc = vc;
        return delegate;
    }
    netverifyViewControllerDidCancelWithErrorScanReferenceAccountId(netverifyViewController, error, scanReference, accountId) {
        if (error) {
            Utils.error(error.code, error.message);
        }
        if (this._owner.get().cancelWithError) {
            this._owner.get().cancelWithError(error, scanReference);
        }
        this._vc.dismissViewControllerAnimatedCompletion(true, null);
        this._owner.get().netverifyViewController.destroy();
    }
    netverifyViewControllerDidFinishInitializingWithError(netverifyViewController, error) {
        if (error) {
            Utils.error(error.code, error.message);
        }
        if (this._owner.get().finishInitWithError) {
            this._owner.get().finishInitWithError(error);
        }
        if (error) {
            this._vc.dismissViewControllerAnimatedCompletion(true, null);
            this._owner.get().netverifyViewController.destroy();
        }
    }
    netverifyViewControllerDidFinishWithDocumentDataScanReferenceAccountIdAuthenticationResult(netverifyViewController, documentData, scanReference, accountId, authenticationResult) {
        Utils.log("Good with scan reference: %@", scanReference);
        const { gender, selectedCountry, issuingCountry } = documentData;
        const genderStr = this.getGender(gender);
        this._callback(netverifyViewController, Object.assign(Object.assign({}, documentData), { issuingCountry: ISOCountryConverter.convertToAlpha2(issuingCountry), selectedCountry: ISOCountryConverter.convertToAlpha2(selectedCountry), genderStr }), scanReference);
        this._vc.dismissViewControllerAnimatedCompletion(true, null);
        this._owner.get().netverifyViewController.destroy();
    }
    getGender(gender) {
        switch (gender) {
            case 2:
                return "Female";
            case 1:
                return "Male";
            case 3:
                return "Unspecified";
            case 0:
            default:
                return "Unknown";
        }
    }
};
NsjumiopluginDelegateImpl = NsjumiopluginDelegateImpl_1 = __decorate([
    NativeClass(),
    ObjCClass(NetverifyViewControllerDelegate)
], NsjumiopluginDelegateImpl);
//# sourceMappingURL=jumio.ios.js.map