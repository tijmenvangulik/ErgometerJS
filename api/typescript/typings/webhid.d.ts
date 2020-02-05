declare namespace webhid {
    export interface HIDDeviceFilter {
        vendorId? : number;
        productId? : number;
        usagePage? : number;
        usage? : number;
    }
    
    export interface HIDDeviceRequestOptions {
        filters : HIDDeviceFilter[];
    }
    
    
    export interface HID extends EventTarget {
        onconnect : ((ev: HIDConnectionEvent) => any) | null;
        ondisconnect : (( ev: HIDConnectionEvent) => any) | null;
        getDevices() : Promise<HIDDevice[]>;
        requestDevice(
            options : HIDDeviceRequestOptions) : Promise<HIDDevice[]>;
    }
    
    
    
    export interface HIDConnectionEventInit extends EventInit {
          device : HIDDevice;
    }
    
    //[
    //    Constructor(DOMString type, HIDConnectionEventInit eventInitDict),
    //    SecureContext
    //] 
    export interface HIDConnectionEvent extends Event {
       readonly device : HIDDevice;
    }
    
    export interface HIDInputReportEventInit extends EventInit {
          device : HIDDevice;
          reportId : number;
          data : DataView;
    }
    
    //[
    //    Constructor(DOMString type, HIDInputReportEventInit eventInitDict),
    //    SecureContext
    //] 
    export interface HIDInputReportEvent extends Event {
        readonly device : HIDDevice;
        readonly reportId : number;
        readonly data : DataView;
    }
    
    
    export enum HIDUnitSystem {
        "none", "si-linear", "si-rotation", "english-linear",
        "english-rotation", "vendor-defined", "reserved"
    }
    
    export interface HIDReportItem {
        readonly  isAbsolute : boolean;
        readonly  isArray: boolean;
        readonly  isRange : boolean;
        readonly  hasNull : boolean;
        readonly  usages : number[];
        readonly usageMinimum : number;
        readonly usageMaximum : number;
        readonly   reportSize : number;
        readonly   reportCount : number;
        readonly   unitExponent : number;
        readonly  unitSystem : HIDUnitSystem;
        readonly  unitFactorLengthExponent : number;
        readonly  unitFactorMassExponent : number;
        readonly  unitFactorTimeExponent : number;
        readonly  unitFactorTemperatureExponent : number;
        readonly  unitFactorCurrentExponent : number
        readonly  unitFactorLuminousIntensityExponent : number;
        readonly  logicalMinimum : number;
        readonly  logicalMaximum : number;
        readonly  physicalMinimum : number;
        readonly  physicalMaximum : number;
        readonly  strings : string[];
    }
    
    export interface HIDReportInfo {
        readonly  reportId :number;
        readonly  items : HIDReportItem[];
    }
    
    export interface HIDCollectionInfo {
        readonly usagePage : number;
        readonly usage: number;
        readonly children : HIDCollectionInfo[];
        readonly inputReports : HIDReportInfo[];
        readonly outputReports: HIDReportInfo[];
        readonly featureReports: HIDReportInfo[];
    }
    
    
    export interface HIDDevice extends EventTarget {
        oninputreport : ((ev: HIDInputReportEvent) => any) | null;
        readonly  opened : boolean;
        readonly vendorId : number;
        readonly productId: number;
        readonly productName : string;
        readonly  collections : HIDCollectionInfo[];
        open() : Promise<void>;
        close() : Promise<void>;
        sendReport( reportId : number,  data : BufferSource) : Promise<void>;
        sendFeatureReport( reportId : number,  data : BufferSource) : Promise<void> ;
        receiveFeatureReport( reportId : number) : Promise<DataView> ;
    }
}
declare interface Navigator {
    readonly hid : webhid.HID;
}

