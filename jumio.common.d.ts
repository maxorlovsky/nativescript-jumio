import { ContentView } from '@nativescript/core/ui/content-view';
declare type DocumentType = 'identity_card' | 'driver_license' | 'passport' | 'visa';
declare type Datacenter = 'EU' | 'US' | 'SG';
interface PreSelectedData {
    country: string;
    documentType: DocumentType;
}
export interface OnResultCallbacks<Error, DocumentData> {
    cancelWithError: (error: Error, scanReference: string | null) => void;
    finishedScan: (documentData: Partial<DocumentData> & {
        genderStr: string;
    }, scanReference: string | null) => void;
}
export interface InitArgs<Error, DocumentData> extends OnResultCallbacks<Error, DocumentData> {
    finishInitWithError: (error: Error) => void;
    customerId: string;
    callbackUrl?: string;
    preSelectedData?: PreSelectedData;
}
export declare class Common extends ContentView {
    protected merchantApiToken: string;
    protected merchantApiSecret: string;
    protected datacenter: Datacenter;
    constructor(merchantApiToken: string, merchantApiSecret: string, datacenter: Datacenter);
}
export declare class Utils {
    static error(...args: any[]): void;
    static log(...args: any[]): void;
}
export {};
