/**
 * Created by tijmen on 01-02-16.
 */
namespace ergometer.ble {

    export class DriverBleat implements IDriver {

        private _device:bleat.Device;

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
                    },disconnectFn,false,(e)=>{
                      reject(e);
                    });
                }
                catch (e) {
                    reject(e);
                }
            })

        }
        public disconnect() {
            if (this._device) this._device.disconnect();
        }

        public startScan( foundFn? : IFoundFunc ) : Promise<void> {
            return  new Promise<void>((resolve, reject) => {
                try {
                    bleat.startScan((device)=> {
                        foundFn({
                            address: device.address,
                            name: device.name,
                            rssi: device.adData.rssi,
                            _internalDevice: device
                        })
                    }, reject);
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });

        }
        public stopScan() : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
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
                    var dataView = new DataView(data.buffer);
                    this.getCharacteristic(serviceUIID,characteristicUUID).write(dataView,resolve,reject);
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
                    this.getCharacteristic(serviceUIID, characteristicUUID).read(
                        (data : DataView)=>{ resolve(data.buffer); }, reject);

                }
                catch (e) {
                    reject(e);
                }
            })
        }

        public enableNotification(serviceUIID : string,characteristicUUID:string, receive:(data:ArrayBuffer) =>void) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    this.getCharacteristic(serviceUIID, characteristicUUID).enableNotify(
                        (data : DataView)=>{ receive(data.buffer) }, resolve, reject);

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