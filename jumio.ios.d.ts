import { Common, InitArgs, OnResultCallbacks } from './jumio.common';
export declare class Jumio extends Common {
    finishInitWithError: any;
    finishedScan: OnResultCallbacks<NetverifyError, NetverifyDocumentDataExtended>['finishedScan'];
    cancelWithError: OnResultCallbacks<NetverifyError, NetverifyDocumentDataExtended>['cancelWithError'];
    netverifyViewController: NetverifyViewController;
    private delegate;
    private config;
    constructor({ merchantApiToken, merchantApiSecret, datacenter }: {
        merchantApiToken: any;
        merchantApiSecret: any;
        datacenter: any;
    });
    init({ customerId, callbackUrl, preSelectedData, cancelWithError, finishInitWithError, finishedScan }: InitArgs<NetverifyError, NetverifyDocumentDataExtended>): void;
    rootVC(): UIViewController;
    private mapDocumentType;
    private mapDataCenter;
}
