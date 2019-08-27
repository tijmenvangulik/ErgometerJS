/**
 * Created by tijmen on 03/04/2017.
 */
/**
 * Created by tijmen on 01-02-16.
 *
 * see simpleBLE.d.ts for the definitions of the simpleBLE
 * It assumes that there simple ble is already imported as a var named simpleBLE
 *
 */
namespace ergometer.ble {

  export class DriverSimpleBLE implements IDriver {


    public connect(device : IDevice,disconnectFn : ()=>void) : Promise<void> {
      return new Promise<void>((resolve, reject) => {
      //  simpleBLE.connect("");
      })

    }
    public disconnect() {
      simpleBLE.disconnect();
    }

    public startScan( foundFn? : IFoundFunc ) : Promise<void> {
      return  new Promise<void>((resolve, reject) => {
      //  simpleBLE.scan();
      });

    }
    public stopScan() : Promise<void> {
      return new Promise<void>((resolve, reject) => {

      })
    }
    public writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void> {
      return new Promise<void>((resolve, reject) => {


      })

    }

    public readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer> {
      return new Promise<ArrayBuffer>((resolve, reject) => {

      })
    }

    public enableNotification(serviceUIID : string,characteristicUUID:string, receive:(data:ArrayBuffer) =>void) : Promise<void> {
      return new Promise<void>((resolve, reject) => {

      })
    }

    public disableNotification(serviceUIID : string,characteristicUUID:string) : Promise<void> {
      return new Promise<void>((resolve, reject) => {

      })
    }

  }
}