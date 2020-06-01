namespace bleCentral {
    export function available() {
        return typeof ble !== 'undefined' && typeof ble.connectedPeripheralsWithServices =="function";
    }
    export class DriverBleCentral implements ergometer.ble.IDriver {
        
        private _device : BLECentralPlugin.PeripheralDataExtended

        
        public connect(device : ergometer.ble.IDevice,disconnectFn : ()=>void) : Promise<void> {
            
            return new Promise<void>((resolve, reject) => {
                ble.connect(device.address, (periferalData)=>{
                    this._device=periferalData;
                    resolve();
                    
                }, disconnectFn)
            })
        }
        constructor (private _scanServices : string[]) {}
        
        public disconnect() {
            ble.disconnect(this._device.id);
        }

        public startScan( foundFn? : ergometer.ble.IFoundFunc ) : Promise<void> {
            
            return  new Promise<void>((resolve, reject) => {
                ble.startScan(this._scanServices, (foundData)=>{
                    if (foundFn) foundFn({
                        address: foundData.id,
                        name: foundData.name,
                        rssi: foundData.rssi,
                        _internalDevice:foundData
                    })
                } ,reject)
                resolve();
           });

        }
        public stopScan() : Promise<void> {
            return ble.withPromises.stopScan();
        }
        public writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void> {
            return ble.withPromises.write(this._device.id, serviceUIID, characteristicUUID, data.buffer);

        }

        public readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer> {
            return ble.withPromises.read(this._device.id, serviceUIID, characteristicUUID);
        }

        public enableNotification(serviceUIID : string,characteristicUUID:string, receive:(data:ArrayBuffer) =>void) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                console.trace("enableNotification "+characteristicUUID)
                ble.startNotification(this._device.id, serviceUIID, characteristicUUID, receive,reject);
               
                //console.log("resolved enableNotification"+characteristicUUID);
                resolve(); 
       
            })
        }

        public disableNotification(serviceUIID : string,characteristicUUID:string) : Promise<void> {
            //console.trace("disableNotification "+characteristicUUID);
            return ble.withPromises.stopNotification(this._device.id, serviceUIID, characteristicUUID)
            
        }

    }
}