/**
 * Created by tijmen on 23-01-16.
 */

declare module bleat {
    export var onError : (msg : string)=>void;
    export function init(readyFn, errorFn, adapterName);
    export interface FoundFunc { (device : Device) : void }
    export function startScan(serviceUUIDs :string | FoundFunc , foundFn? : FoundFunc);
    export function stopScan();

    export interface ErrorFunc {
        (e : string): void;
    }
    export interface EmptyCallback {
        () : void;
    }
    export interface Services {
        [serviceID: string] : Service;
    }
    export interface Service {
        uuid : string;
        primary: boolean;
        //includedServices = {};
        characteristics : Characteristics;
    }

    export interface Device {
        address :string;
        name : string;
        rssi : number;
        //serviceUUIDs = serviceUUIDs;
        connected : boolean;
        //services
        services : Services;
        disconnect();
        connect(connectFn : EmptyCallback, disconnectFn : EmptyCallback, suppressDiscovery? : boolean,errorFn? : ErrorFunc);
    }

    export interface Characteristic {
        uuid  : string;
        //properties = properties;
        descriptors : Descriptors;
        read(completeFn : (data : ArrayBuffer)=>void,errorFn? : ErrorFunc);
        write(bufferView, completeFn :(data : ArrayBufferView)=>void,errorFn? : ErrorFunc);
        enableNotify(notifyFn : (data : ArrayBuffer)=>void, completeFn? :EmptyCallback,errorFn? : ErrorFunc);
        disableNotify(completeFn,errorFn? :ErrorFunc );
    }
    export interface Characteristics {
        [characteristicID: string] : Characteristic;
    }
    export interface Descriptor {
        uuid : string;
    }
    export interface Descriptors {
        [descriptorID: string] : Descriptor;
    }
}