/**
 * Created by tijmen on 01-02-16.
 */
namespace ergometer.ble {

    export interface IDevice {
        address :string;
        name : string;
        rssi : number;
        _internalDevice :any;
    }
    export interface IFoundFunc {
        (device : IDevice) : void;
    }
    export interface IDriver {
        startScan( foundFn? :  IFoundFunc) : Promise<void>;
        stopScan() :void;
        connect(device : IDevice,disconnectFn : ()=>void) : Promise<void>;
        disconnect():void;
        writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void>;
        readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer>
        enableNotification(serviceUIID : string,characteristicUUID:string, receive:(data:ArrayBuffer) =>void) : Promise<void>;
        disableNotification(serviceUIID : string,characteristicUUID:string) : Promise<void>;
    }
}