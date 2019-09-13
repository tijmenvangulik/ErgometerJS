namespace ergometer.usb {
    
    export class DeviceNodeHid implements IDevice {
        
        private _disconnect : DisconnectFunc;
        private _onError : (err:any)=>void;
        private _deviceInfo : nodehid.Device;
        private _hid : nodehid.HID;

        public  vendorId : number;
        public  productId : number;
        public  productName : string;
        public serialNumber : string;

        constructor (deviceInfo) {
            
            this._deviceInfo=deviceInfo;
        }
        public callError(err : any) {
            if (this._onError)
              this._onError(err);
        }
        private _receiveData : (data:DataView)=>void;
        public open(disconnect : DisconnectFunc,error : (err:any)=>void,receiveData : (data:DataView)=>void) : Promise<void> {
            
            this._hid= new nodehid.HID(this._deviceInfo.path);
            this._receiveData=receiveData;
            //there is no disconnect in hid api?
            //shoud fix this another way
            this._onError=error;
            this._hid.on('error', (err)=> {
               //should do some error handling
               this.callError(err);
             });

            this._hid.readTimeout(500);//csafe should be returned directly, do not wait too long
            this._disconnect=disconnect;

            
            this._deviceInfo.productId;
            
            return Promise.resolve();
        }
        public close() : Promise<void> {
            this._hid.close();
            return Promise.resolve();
        }
        
        public sendData( data : ArrayBuffer) : Promise<void> {
            return new Promise<void>((resolve,reject)=>{
                try {
                    if (data.byteLength>USB_CSAVE_SIZE) 
                      throw `Trying to send to much data, the buffer must be smaller or equal to ${USB_CSAVE_SIZE} and is ${data.byteLength}`
                    var buf = new ArrayBuffer(WRITE_BUF_SIZE);
                    var view=new Int8Array(buf);
                    view.set([REPORT_TYPE],0);
                    view.set(new Int8Array(data),1);
                    var written= this._hid.write(Array.from(view));
                    
                    if(written!=WRITE_BUF_SIZE)
                        throw `Only ${written} bytes written to usb device. it should be ${WRITE_BUF_SIZE}`;
                    //resolve the send
                    resolve();
                    //start listening to the result
                    this.readData();
                } catch (error) {
                    this.callError(error);
                    reject(error); 
                }
                
                
            });
        }
        public readData() {
           
            try {    
                this._hid.read((err,inputData)=>{
                    if (err) this.callError(err);
                    else {
                        if (inputData && inputData.length==WRITE_BUF_SIZE && inputData[0]==REPORT_TYPE) {
                            //copy all results into a buffer of 121
                            var endByte=WRITE_BUF_SIZE-1;
                            while (endByte>=0 && inputData[endByte]==0) endByte--;
                            if (endByte>=0 && inputData[endByte]==csafe.defs.FRAME_END_BYTE) {
                                var buf = new ArrayBuffer(WRITE_BUF_SIZE);
                                var ar=new Int8Array(buf);
                                ar.set(inputData,0);
                                //return the the data except for the first byte
                                var view=new DataView(ar.buffer,1,endByte);
                                this._receiveData(view);
                            }
                            else this.callError("end csafe frame not found");
                        }
                        else this.callError("nothing read");
                    }
                });
    
            } catch (error) {
                this.callError(error);
            
            }
          
        }
    }
    

    export class DriverNodeHid implements IDriver {
       
       public requestDevics() : Promise<Devices> {
        try {
            var result : Devices= [];
            var devices = nodehid.devices();
            devices.forEach((device)=>{
                //add all concept 2 devices
                if (device.vendorId==CONCEPT2_VENDOR_ID) {
                    var deviceInfo= new DeviceNodeHid(device);
                    deviceInfo.serialNumber=device.serialNumber;
                    deviceInfo.productId=device.productId;
                    deviceInfo.vendorId=device.vendorId;
                    deviceInfo.productName=device.product;
                    result.push(deviceInfo);
                }            
            })  
        } catch (error) {           
            return Promise.reject(error); 
        }   
        
        return Promise.resolve(result);
       }
    }
}