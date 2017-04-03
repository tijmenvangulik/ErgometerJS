/**
 * Created by tijmen on 03/04/2017.
 */
declare module simpleBLE {
   //write here the simple ble interface
  export interface IWriteResult {
    writeUUID : string;
    message : string;
  }
  export interface IReadResult {
    readUUID  : string;
    value : string;
  }
  export function scan();
  export function stopScan();
  export function connect(identifier : string);
  export function disconnect();
  export function write(msg : string,UUID : string) : Promise<IWriteResult>;
  export function read(UUID : string) : Promise<IReadResult>;
}