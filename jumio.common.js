import { ContentView } from '@nativescript/core/ui/content-view';
export class Common extends ContentView {
    constructor(merchantApiToken, merchantApiSecret, datacenter) {
        super();
        this.merchantApiToken = merchantApiToken;
        this.merchantApiSecret = merchantApiSecret;
        this.datacenter = datacenter;
    }
}
export class Utils {
    static error(...args) {
        console.log('ERROR', '[nativescript-jumio]', ...args);
    }
    static log(...args) {
        console.log('[nativescript-jumio]', ...args);
    }
}
//# sourceMappingURL=jumio.common.js.map