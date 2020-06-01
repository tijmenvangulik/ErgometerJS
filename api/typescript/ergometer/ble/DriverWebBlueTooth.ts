/**
 * Created by tijmen on 17-07-16.
 */
/**
 * Created by tijmen on 01-02-16.
 */
namespace ergometer.ble {
  

  export function hasWebBlueTooth() : boolean {
    return ( navigator && typeof navigator.bluetooth !== 'undefined' );
  }
  
  interface ListenerMap  {
      [name : string] : (data:ArrayBuffer)=>void;
  }
  interface ListenerCharacteristicMap  {
    [name : string] : webbluetooth.BluetoothRemoteGATTCharacteristic;
  }
  export class DriverWebBlueTooth implements IDriver {

    private _device: webbluetooth.BluetoothDevice;
    private _server : webbluetooth.BluetoothRemoteGATTServer;
    private _disconnectFn : ()=>void;
    private _listenerMap : ListenerMap= {};
    //needed to prevent early free of the characteristic
    private _listerCharacteristicMap : ListenerCharacteristicMap= {};

    //should queue the read and writes, this may be the cause of the blocking issues, this is a work arround for the chrome web blue tooth problem
    //private _functionQueue : utils.FunctionQueue = new utils.FunctionQueue(1); //1 means one at a time

   

    constructor (private _performanceMonitor : MonitorBase,
      private _scanServices : string[],
      private _scanOptionalServices : string[])  {
        
     

    }

    //simple wrapper for bleat characteristic functions
    private getCharacteristic(serviceUid : string,characteristicUid : string) : Promise<webbluetooth.BluetoothRemoteGATTCharacteristic> {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`getCharacteristic ${characteristicUid} `);
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
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`onDisconnected `);
      if (this._disconnectFn)
        this._disconnectFn();
      this.clearConnectionVars();
    }

    private clearConnectionVars() {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`clearConnectionVars `);
      if (this._device)
        this._device.removeEventListener('ongattserverdisconnected',this.onDisconnected);
      this._device=null;
      this._server=null;
      this._disconnectFn=null;
      this._listenerMap={};
      this._listerCharacteristicMap={};
    }

    public connect(device : IDevice,disconnectFn : ()=>void) : Promise<void> {

      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`connect `);


      return new Promise<void>((resolve, reject) => {
        try {


          var newDevice = device._internalDevice;
                                      
          newDevice.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
          newDevice.ongattserverdisconnected=this.onDisconnected.bind(this) ;
          
          newDevice.gatt.connect().then((server : webbluetooth.BluetoothRemoteGATTServer)=>{
            this._device=newDevice;
            this._server=server;
            this._disconnectFn=disconnectFn;
            resolve();
          },reject);

        }
        catch (e) {
          reject(e);
        }
      })

    }
    public disconnect() {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`disconnect `);

      if (this._server && this._server.connected) this._server.disconnect();
      else this.clearConnectionVars();
    }

    public startScan( foundFn? : IFoundFunc ) : Promise<void> {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`startScan `);

      return  new Promise<void>((resolve, reject) => {
        try {
          navigator.bluetooth.requestDevice(
              {
                filters: [
                  {   services: this._scanServices
                  }

                ],
                optionalServices: this._scanOptionalServices
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
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`stopScan `);

      if ( typeof navigator.bluetooth.cancelRequest !== 'undefined' )
        return navigator.bluetooth.cancelRequest()
      else return new Promise<void>((resolve, reject) => {
          resolve();
        }
      );
    }
    /*
    public writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void> {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`writeCharacteristic ${characteristicUUID} : ${data} `);

      //run read and write one at a time , wait for the result and then call the next
      //this is a workaround for a problem of web blue tooth
      //not yet tested!
      return this._functionQueue.add(
          this.doWriteCharacteristic,
          this,serviceUIID,characteristicUUID,data);
    }
    */
    public writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void> {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`writeCharacteristic ${characteristicUUID} : ${data} `);
      if (!this._device || !this._device.gatt || !this._device.gatt.connected) {
         this.onDisconnected(null);
         return Promise.reject("Not connected");
      }  
      return new Promise<void>((resolve, reject) => {
        try {

          this.getCharacteristic(serviceUIID,characteristicUUID)
              .then(( characteristic : webbluetooth.BluetoothRemoteGATTCharacteristic) => {
                return characteristic.writeValue(data.buffer)
              })
              .then(resolve)
              .catch(e=>{
                 reject(e);
                 //when an write gives an error asume that we are disconnected
                 if (!this._device.gatt.connected)
                    this.onDisconnected(null);
              });
        }
        catch (e) {
          reject(e);
        }

      })

    }
    /*
    public readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer> {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`readCharacteristic ${characteristicUUID}  `);

      //run read and write one at a time , wait for the result and then call the next
      //this is a workaround for a problem of web blue tooth
      //not yet tested!
      return this._functionQueue.add(
          this.doReadCharacteristic,
          this,serviceUIID,characteristicUUID);
    }
    */
    public readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer> {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`readCharacteristic ${characteristicUUID}  `);
       if (!this._device || !this._device.gatt || !this._device.gatt.connected) {
          this.onDisconnected(null);
          return Promise.reject("Not connected");
       }
      
      return new Promise<ArrayBuffer>((resolve, reject) => {
        try {
          this.getCharacteristic(serviceUIID,characteristicUUID)
              .then(( characteristic : webbluetooth.BluetoothRemoteGATTCharacteristic) => {
                return characteristic.readValue()
              })
              .then((data : DataView)=>{
            if (this._performanceMonitor.logLevel==LogLevel.trace)
                  this._performanceMonitor.traceInfo(`doReadCharacteristic ${characteristicUUID} : ${utils.typedArrayToHexString(data.buffer)} `);

                resolve(data.buffer);
            })
            .catch(e=>{
              reject(e);
              //when an write gives an error asume that we are disconnected
              if (!this._device.gatt.connected)
                 this.onDisconnected(null);
           });;

        }
        catch (e) {
          reject(e);
        }
      })
    }

    private onCharacteristicValueChanged(event:webbluetooth.CharacteristicsValueChangedEvent) {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`onCharacteristicValueChanged ${event.target.uuid} : ${utils.typedArrayToHexString(event.target.value.buffer)} `);
      
      try {
        if (!this._device.gatt.connected) {
          this.onDisconnected(null);
          throw "Not connected";
        }
        let func=this._listenerMap[event.target.uuid];
        if (func) func(event.target.value.buffer)
      }
      catch(e) {
        if (this._performanceMonitor)
          this._performanceMonitor.handleError(e.toString());
        else throw e;
      }

    }
    /*private onCharacteristicValueChanged(uuid,buffer) : Promise<void> {
      return new Promise<void>((resolve, reject) => {
        try {
          let func=this._listerMap[uuid];
          if (func) {
              func(buffer);
              resolve();
          }
          else throw "characteristics uuid "+uuid.toString()+" not found in map";
        }
        catch(e) {
          if (this._performanceMonitor)
            this._performanceMonitor.handleError(e.toString());
          reject(e);
        }

      });
    }
    
    private onCharacteristicValueChanged(event:webbluetooth.CharacteristicsValueChangedEvent) {
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`onCharacteristicValueChanged ${event.target.uuid} : ${utils.typedArrayToHexString(event.target.value.buffer)} `);
      //this may prevent hanging, just a test
        //process one at a time to prevent dead locks
      this._functionQueue.add(
            this.doOnCharacteristicValueChanged,this,event.target.uuid,event.target.value.buffer);

      return true;
    }
    */
    public enableNotification(serviceUIID : string,characteristicUUID:string, receive:(data:ArrayBuffer) =>void) : Promise<void> {
      
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`enableNotification ${characteristicUUID}  `);
      
      if (!this._device.gatt.connected) {
          this.onDisconnected(null);
          return Promise.reject("Not connected");
      }
      return new Promise<void>((resolve, reject) => {
        try {
          this.getCharacteristic(serviceUIID,characteristicUUID)
              .then(( characteristic : webbluetooth.BluetoothRemoteGATTCharacteristic) => {

                return characteristic.startNotifications().then(_ => {
                  this._listenerMap[characteristicUUID]=receive;
                  //bug fix: this prevents the chracteristic from being free-ed
                  this._listerCharacteristicMap[characteristicUUID]=characteristic;
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
      //only disable when receive is
      if (this._performanceMonitor.logLevel==LogLevel.trace)
        this._performanceMonitor.traceInfo(`disableNotification ${characteristicUUID}  `);

      return new Promise<void>((resolve, reject) => {
          try {
            if (typeof this._listenerMap[characteristicUUID]!== 'undefined' && this._listenerMap[characteristicUUID]) {

              this.getCharacteristic(serviceUIID, characteristicUUID)
                  .then((characteristic: webbluetooth.BluetoothRemoteGATTCharacteristic) => {
                    characteristic.stopNotifications().then(() => {
                      this._listenerMap[characteristic.uuid] = null;
                      this._listerCharacteristicMap[characteristic.uuid] = null;

                      characteristic.removeEventListener('characteristicvaluechanged', this.onCharacteristicValueChanged);
                      resolve();
                    }, reject);
                  });
            }
            else resolve();//just resolve nothing to do
          }
          catch (e) {
            reject(e);
          }
        })
      }


  }
}