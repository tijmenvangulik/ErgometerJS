/**
 * Created by tijmen on 01-02-16.
 */
module ergometer.ble {

    export class DriverBleat implements IDriver {

        private _device:bleat.Device;
        private _initialized = false;

        //simple wrapper for bleat characteristic functions
        private getCharacteristic(serviceUid : string,characteristicUid : string) : bleat.Characteristic {
            var service= this._device.services[serviceUid];
            if (service) {
                var found = service.characteristics[characteristicUid];
                if (found) return found;
                else throw `characteristics ${characteristicUid} not found in service ${serviceUid}`;
            }
            else throw `service ${serviceUid} not found`
        }
        public connect(device : IDevice,disconnectFn : ()=>void) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    var newDevice : bleat.Device= device._internalDevice;
                    newDevice.connect(()=>{
                        this._device=newDevice;
                        resolve();
                    },disconnectFn,false,reject);
                }
                catch (e) {
                    reject(e);
                }
            })

        }
        public disconnect() : Promise<void>  {
            return new Promise<void>((resolve, reject) => {
                try {
                    if (this._device) this._device.disconnect();
                    else reject("Device not connected");
                }
                catch (e) {
                    reject(e);
                }
            })
        }
        public init(): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    if (this._initialized)
                        resolve();
                    else {
                        bleat.init(()=>{
                            resolve();
                            this._initialized=true
                        }, reject)
                    }
                }
                catch (e) {
                    reject(e);
                }
            })

        }
        public startScan( foundFn? : IFoundFunc ) : Promise<void> {
           return this.init()
                .then(()=>{
                return  new Promise<void>((resolve, reject) => {
                    try {
                        bleat.startScan((device)=> {
                            foundFn({
                                address: device.address,
                                name: device.name,
                                rssi: device.rssi,
                                _internalDevice: device
                            })
                        }, reject);
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                })
            })

        }
        public stopScan() : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    if (this._initialized)
                        bleat.stopScan(reject);
                    resolve();
                }
                catch (e) {
                        reject(e);
                }

            })
        }
        public writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    this.getCharacteristic(serviceUIID,characteristicUUID).write(data,resolve,reject);
                    resolve();
                }
                catch (e) {
                    reject(e);
                }

            })

        }

        public readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer> {
            return new Promise<ArrayBuffer>((resolve, reject) => {
                try {
                    this.getCharacteristic(serviceUIID, characteristicUUID).read(resolve, reject);

                }
                catch (e) {
                    reject(e);
                }
            })
        }

        public enableNotification(serviceUIID : string,characteristicUUID:string, receive:(data:ArrayBuffer) =>void) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    this.getCharacteristic(serviceUIID, characteristicUUID).enableNotify(receive, resolve, reject);

                }
                catch (e) {
                    reject(e);
                }
            })
        }

        public disableNotification(serviceUIID : string,characteristicUUID:string) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    this.getCharacteristic(serviceUIID, characteristicUUID).disableNotify(resolve, reject);

                }
                catch (e) {
                    reject(e);
                }
            })
        }

    }
}