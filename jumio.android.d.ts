import { Common, InitArgs } from './jumio.common';
interface JumioError {
    code: string;
    message: string;
}
export declare class Jumio extends Common {
    private netverifySDK;
    private androidActivity;
    private onActivityResultCallback;
    constructor({ merchantApiToken, merchantApiSecret, datacenter }: {
        merchantApiToken: any;
        merchantApiSecret: any;
        datacenter: any;
    });
    init({ customerId, callbackUrl, preSelectedData, cancelWithError, finishInitWithError, finishedScan }: InitArgs<JumioError, com.jumio.nv.NetverifyDocumentData>): void;
    private onActivityResult;
    private cleanupSDK;
    private getGender;
    private mapDocumentType;
    private mapDataCenter;
}
export {};
