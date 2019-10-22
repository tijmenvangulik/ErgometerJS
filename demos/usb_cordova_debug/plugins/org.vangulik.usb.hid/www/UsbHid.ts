namespace cordova_usb_hid {

    export type ErrorCallBack = (e: any)=>void;
    export type VoidCallBack = ()=>void;
    export type ReadCallBack = (data : ArrayBuffer)=>void;
    export interface UsbHidDevice {
        name : string;
        vendorId : string;
        productId : string;
        serialNumber : string;
        productName : string;

    }
    export type UsbHidDevices = UsbHidDevice[];
    export interface PermissonOptions {

    }
    export interface OpenOptions {
        packetSize? : number;
        timeout?: number;
        skippZeroResults? : boolean;
        skippFirstByteZero? : boolean
    }
    export interface WriteOptions {
        packetsize? : number;
        timeout? : number;
    }        
    /** @internal */   
    function buf2hex(buffer : ArrayBuffer) : string { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }



    export class UsbHidPlugin {
        public enumerateDevices() : Promise<UsbHidDevices> {
            return new Promise((successCallback,errorCallback)=>{
                cordova.exec(
                    successCallback,
                    errorCallback,
                    'UsbHid',
                    'enumerateDevices',
                    []
                );
            })        
        }
        public requestPermission(device : UsbHidDevice) : Promise<void>{
            return new Promise((successCallback,errorCallback)=>{
                cordova.exec(
                    successCallback,
                    errorCallback,
                    'UsbHid',
                    'requestPermission',
                    [{'opts': device}]
                );
            })
            
        }
        public open(opts? : OpenOptions) : Promise<void> {
            if (!opts) opts={};
            return new Promise((successCallback,errorCallback)=>{
                cordova.exec(
                    successCallback,
                    errorCallback,
                    'UsbHid',
                    'open',
                        [{'opts': opts}]
                );
            })
            
        }
        
        public write(data : ArrayBuffer,opts? : WriteOptions) : Promise<void> {
            var writeOpts : any=opts;
            if (!writeOpts) writeOpts={};
            
            writeOpts.data=buf2hex(data);
            return new Promise((successCallback,errorCallback)=>{
                cordova.exec(
                    successCallback,
                    errorCallback,
                    'UsbHid',
                    'writeHex',
                    [{'opts': writeOpts}]
                );
            });
            
        }
        
        public close() : Promise<void> {
            return new Promise((successCallback,errorCallback)=>{
                cordova.exec(
                    successCallback,
                    errorCallback,
                    'UsbHid',
                    'close',
                    []
                );
            })
            
        }
        public registerReadCallback(readCallback : ReadCallBack): Promise<ArrayBuffer> {
            return new Promise((successCallback,errorCallback)=>{
                cordova.exec(
                    (value)=>{
                        if (typeof value == "object" && value.registerReadCallback) 
                        successCallback();
                        else readCallback(value);
                    },
                    errorCallback,
                    'UsbHid',
                    'registerReadCallback',
                    []
                );
            });
            
        }
    }


}
interface CordovaPlugins {
    UsbHid : cordova_usb_hid.UsbHidPlugin;     
}   


/** @internal */ 
var exec = require('cordova/exec');
/** @internal */ 
var usbhid = new cordova_usb_hid.UsbHidPlugin();
/** @internal */ 
module.exports = usbhid;
