namespace ergometer.usb {
    export type DisconnectFunc = ()=>void;
    export type Devices = IDevice[];

    //keep it simple and not to far away from web-hid
    export interface IDevice {
      readonly vendorId : number;
      readonly productId : number;
      readonly productName : string;
      readonly serialNumber : string;
      
      open(disconnect : ()=>void,error : (err:any)=>void,receiveData : (data:DataView)=>void) : Promise<void>;
      close() : Promise<void>;
      sendData( data : ArrayBuffer) : Promise<void>;
      
    }
    
    export interface IDriver {
        requestDevics() : Promise<Devices>;
    }

    
    
}