/**
 * Created by tijmen on 23-01-16.
 */

declare module bleat {
    export interface ErrorFunc {
        (e : string): void;
    }

    export interface EmptyCallback {
        () : void;
    }
    export interface FoundFunc { (device : Device) : void }
    export function startScan(serviceUUIDs :string | FoundFunc , foundFn? : FoundFunc,errorFn? : ErrorFunc);
    export function stopScan(errorFn? : ErrorFunc);


    export interface Services {
        [serviceID: string] : Service;
    }
    export interface Service {
        uuid : string;
        primary: boolean;
        //includedServices = {};
        characteristics : Characteristics;
    }
    export interface DeviceInfo {
        rssi : number;
    }
    export interface Device {
        address :string;
        name : string;
        adData : DeviceInfo;

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
        read(completeFn : (data : DataView)=>void,errorFn? : ErrorFunc);
        write(bufferView : DataView, completeFn :EmptyCallback,errorFn? : ErrorFunc);
        enableNotify(notifyFn : (data : DataView)=>void, completeFn? :EmptyCallback,errorFn? : ErrorFunc);
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