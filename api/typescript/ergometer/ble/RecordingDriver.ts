/**
 * Created by tijmen on 16-02-16.
 */


namespace ergometer.ble {
  export interface IRecordDevice {
    address:string;
    name:string;
    rssi:number;
  }
  export interface IRecordCharacteristic {
    serviceUIID:string;
    characteristicUUID:string;
    data?: string;
  }
  export enum RecordingEventType {
    startScan,scanFoundFn,stopScan,connect,disconnectFn,disconnect,
    writeCharacteristic,readCharacteristic,
    enableNotification,notificationReceived,
    disableNotification
  }
  export interface IRecordingItem {
    timeStamp : number;
    eventType : string;
    timeStampReturn? : number;
    data? : IRecordCharacteristic | IRecordDevice;
    error? : any;
  }
  export class RecordingDriver implements IDriver {
    private _realDriver :  IDriver;
    private _startTime : number;
    private _events : IRecordingItem[] = [];

    public  _performanceMonitor : MonitorBase;

    constructor (performanceMonitor : MonitorBase,realDriver : IDriver)  {
      this._performanceMonitor =performanceMonitor;
      this._realDriver=realDriver;
    }

    protected getRelativeTime() : number {
      return utils.getTime()-this._startTime
    }
    public addRecording(eventType : RecordingEventType,data? : IRecordCharacteristic|IRecordDevice)  : IRecordingItem {
      var newRec : IRecordingItem ={
        timeStamp: this.getRelativeTime(),
        eventType : RecordingEventType[eventType]
      };
      if (data) {
        newRec.data= data;
      }
      this._events.push(newRec);
      return newRec;
    }

    public get events():ergometer.ble.IRecordingItem[] {
      return this._events;
    }
    public set events(value: ergometer.ble.IRecordingItem[]) {
      this._events = value;
    }

    public clear() {
      this._events=[];
    }
    public startRecording() {
      this.clear();
      this._startTime=utils.getTime();
    }


    protected recordResolveFunc(resolve : ()=>void, rec : IRecordingItem) : ()=>void {
      return ()=>{
        rec.timeStampReturn= this.getRelativeTime();
        resolve()
      };
    }
    protected recordResolveBufferFunc(resolve : (data : ArrayBuffer)=>void, rec : IRecordingItem) : (data : ArrayBuffer)=>void {
      return (data : ArrayBuffer)=>{
        rec.timeStampReturn= this.getRelativeTime();

        (<IRecordCharacteristic>rec.data).data = utils.typedArrayToHexString(data);
        resolve(data)
      };
    }
    protected recordErrorFunc(reject : (e)=>void, rec : IRecordingItem) : (e )=>void {
      return (e)=>{
        rec.timeStampReturn= this.getRelativeTime();
        rec.error = e;
        reject(e);
      };
    }
    public startScan( foundFn? :  IFoundFunc) : Promise<void> {
      return new Promise<void>((resolve, reject ) => {
        var rec =this.addRecording(RecordingEventType.startScan);
        this._realDriver.startScan((device : IDevice)=>{
          this.addRecording(RecordingEventType.scanFoundFn,{
            address: device.address,
            name: device.name,
            rssi: device.rssi
          });
          foundFn(device);
        })
            .then(this.recordResolveFunc(resolve,rec),
                this.recordErrorFunc(reject,rec));
      });
    }
    public stopScan() {
      this.addRecording(RecordingEventType.stopScan)
      this._realDriver.stopScan();
    }
    public connect(device : IDevice,disconnectFn : ()=>void) : Promise<void> {

      return new Promise<void>((resolve, reject ) => {
        var rec =this.addRecording(RecordingEventType.connect);
        this._realDriver.connect(device,()=>{
          this.addRecording(RecordingEventType.disconnectFn)
          disconnectFn();
        }).then(this.recordResolveFunc(resolve,rec),
            this.recordErrorFunc(reject,rec));
      });
    }
    public disconnect() {
      this.addRecording(RecordingEventType.disconnect);
      this._realDriver.disconnect();
    }
    public writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void> {

      return new Promise<void>((resolve, reject ) => {
        var rec =this.addRecording(RecordingEventType.writeCharacteristic,{
          serviceUIID:serviceUIID,
          characteristicUUID:characteristicUUID,
          data: utils.typedArrayToHexString(data.buffer)
        });
        this._realDriver.writeCharacteristic(serviceUIID,characteristicUUID,data)
            .then(this.recordResolveFunc(resolve,rec),
                this.recordErrorFunc(reject,rec));
      });
    }
    public readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer> {
      return new Promise<ArrayBuffer>((resolve, reject ) => {
        var rec =this.addRecording(RecordingEventType.readCharacteristic,{
          serviceUIID:serviceUIID,
          characteristicUUID:characteristicUUID
        });
        this._realDriver.readCharacteristic(serviceUIID,characteristicUUID)
            .then(this.recordResolveBufferFunc(resolve,rec),
                this.recordErrorFunc(reject,rec));
      });
    }

    public enableNotification(serviceUIID : string,characteristicUUID:string, receive:(data:ArrayBuffer) =>void) : Promise<void> {
      /*
      //make a wrapper for each call otherwise it returns the
      class ReturnWrapper {

          constructor (private serviceUIID,private characteristicUUID,private receive,private driver)  {

          }
          public getReturnFunc() {
              return (data:ArrayBuffer) => {
              this.driver.addRecording(RecordingEventType.notificationReceived,{
                  serviceUIID:this.serviceUIID,
                  characteristicUUID:this.characteristicUUID,
                  data:utils.typedArrayToHexString(data)});
              this.receive(data);
          }
      }
      }
      var receivedWrapper = new ReturnWrapper(serviceUIID,characteristicUUID,receive,this);
      */

      return  new Promise<void>((resolve, reject ) => {
        var rec =this.addRecording(RecordingEventType.enableNotification,{
          serviceUIID:serviceUIID,
          characteristicUUID:characteristicUUID
        });
        this._realDriver.enableNotification(serviceUIID, characteristicUUID,
            (data:ArrayBuffer) => {
              this.addRecording(RecordingEventType.notificationReceived,{
                serviceUIID:serviceUIID,
                characteristicUUID:characteristicUUID,
                data:utils.typedArrayToHexString(data)});
              receive(data);
            })
            .then(this.recordResolveFunc(resolve,rec),
                this.recordErrorFunc(reject,rec));
      });
    }
    public disableNotification(serviceUIID : string,characteristicUUID:string) : Promise<void> {
      return new Promise<void>((resolve, reject ) => {
        var rec =this.addRecording(RecordingEventType.disableNotification,{
          serviceUIID:serviceUIID,
          characteristicUUID:characteristicUUID
        });
        this._realDriver.disableNotification(serviceUIID,characteristicUUID)
            .then(this.recordResolveFunc(resolve,rec),
                this.recordErrorFunc(reject,rec));
      });
    }

  }
}