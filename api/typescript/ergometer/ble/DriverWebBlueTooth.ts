/**
 * Created by tijmen on 17-07-16.
 */
/**
 * Created by tijmen on 01-02-16.
 */
module ergometer.ble {

  export function hasWebBlueTooth() : boolean {
    return ( navigator && typeof navigator.bluetooth !== 'undefined' );
  }

  interface ListerMap  {
      [name : string] : (data:ArrayBuffer)=>void;
  }

  export class DriverWebBlueTooth implements IDriver {



    private _device: webbluetooth.BluetoothDevice;
    private _server : webbluetooth.BluetoothRemoteGATTServer;
    private _disconnectFn : ()=>void;
    private _listerMap : ListerMap= {};
    public performanceMonitor : PerformanceMonitor;

    //simple wrapper for bleat characteristic functions
    private getCharacteristic(serviceUid : string,characteristicUid : string) : Promise<webbluetooth.BluetoothRemoteGATTCharacteristic> {
      return new Promise<webbluetooth.BluetoothRemoteGATTCharacteristic>((resolve, reject) => {

        if (!this._server || !this._server.connected)
          reject("server not connected")
        else
          this._server.getPrimaryService(serviceUid)
              .then((service: webbluetooth.BluetoothRemoteGATTService ) => {
                return service.getCharacteristic(characteristicUid)
              })
              .then(resolve,reject);

      });
    }

    private onDisconnected(event :Event) {
      if (this._disconnectFn)
        this._disconnectFn();
      this.clearConnectionVars();
    }

    private clearConnectionVars() {
      if (this._device)
        this._device.removeEventListener('ongattserverdisconnected',this.onDisconnected);
      this._device=null;
      this._server=null;
      this._disconnectFn=null;
      this._listerMap={};
    }

    public connect(device : IDevice,disconnectFn : ()=>void) : Promise<void> {



      return new Promise<void>((resolve, reject) => {
        try {


          var newDevice = device._internalDevice;
          newDevice.gatt.connect().then((server : webbluetooth.BluetoothRemoteGATTServer)=>{
            this._device=newDevice;
            this._server=server;
            this._disconnectFn=disconnectFn;
            newDevice.addEventListener('ongattserverdisconnected', this.onDisconnected.bind(this) );
            resolve();
          },reject);

        }
        catch (e) {
          reject(e);
        }
      })

    }
    public disconnect() {

      if (this._server && this._server.connected) this._server.disconnect()
      else this.clearConnectionVars();
    }

    public startScan( foundFn? : IFoundFunc ) : Promise<void> {
      return  new Promise<void>((resolve, reject) => {
        try {
          navigator.bluetooth.requestDevice(
              {
                filters: [
                  {   services:[PMDEVICE]
                  }

                ],
                optionalServices: [PMDEVICE_INFO_SERVICE,PMCONTROL_SERVICE,PMROWING_SERVICE]
              }).then(device => {
                foundFn({
                  address: device.id,
                  name: device.name,
                  rssi: ( ( typeof device.adData !== 'undefined'  ) && device.adData.rssi)?device.adData.rssi:0,
                  _internalDevice: device
                });
          }).then(resolve,reject);

        }
        catch (e) {
          reject(e);
        }
      });

    }
    public stopScan() : Promise<void> {
      if ( typeof navigator.bluetooth.cancelRequest !== 'undefined' )
        return navigator.bluetooth.cancelRequest()
      else return new Promise<void>((resolve, reject) => {
          resolve();
        }
      );
    }
    public writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void> {
      return new Promise<void>((resolve, reject) => {
        try {

          this.getCharacteristic(serviceUIID,characteristicUUID)
              .then(( characteristic : webbluetooth.BluetoothRemoteGATTCharacteristic) => {
                return characteristic.writeValue(data.buffer)
              })
              .then(resolve,reject);
        }
        catch (e) {
          reject(e);
        }

      })

    }

    public readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer> {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        try {
          this.getCharacteristic(serviceUIID,characteristicUUID)
              .then(( characteristic : webbluetooth.BluetoothRemoteGATTCharacteristic) => {
                return characteristic.readValue()
              })
              .then((data : DataView)=>{ resolve(data.buffer); }, reject);

        }
        catch (e) {
          reject(e);
        }
      })
    }
    private onCharacteristicValueChanged(event:webbluetooth.CharacteristicsValueChangedEvent) {
      try {
        let func=this._listerMap[event.target.uuid];
        if (func) func(event.target.value.buffer)
      }
      catch(e) {
        if (this.performanceMonitor)
          this.performanceMonitor.handleError(e.toString())
        else throw e;
      }

    }
    public enableNotification(serviceUIID : string,characteristicUUID:string, receive:(data:ArrayBuffer) =>void) : Promise<void> {
      return new Promise<void>((resolve, reject) => {
        try {
          this.getCharacteristic(serviceUIID,characteristicUUID)
              .then(( characteristic : webbluetooth.BluetoothRemoteGATTCharacteristic) => {

                return characteristic.startNotifications().then(_ => {
                  this._listerMap[characteristicUUID]=receive;
                  characteristic.addEventListener('characteristicvaluechanged',this.onCharacteristicValueChanged.bind(this));
                  resolve();
              },reject)
          }).then(resolve,reject);

        }
        catch (e) {
          reject(e);
        }
      })
    }

    public disableNotification(serviceUIID : string,characteristicUUID:string) : Promise<void> {
      return new Promise<void>((resolve, reject) => {
        try {
            this.getCharacteristic(serviceUIID,characteristicUUID)
              .then(( characteristic : webbluetooth.BluetoothRemoteGATTCharacteristic) => {
                 characteristic.stopNotifications().then(()=>{
                   this._listerMap[characteristic.uuid]=null;
                   characteristic.removeEventListener('characteristicvaluechanged',this.onCharacteristicValueChanged);
                   resolve();
                 },reject);
              });

        }
        catch (e) {
          reject(e);
        }
      })
    }

  }
}