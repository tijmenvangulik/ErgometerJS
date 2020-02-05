namespace ergometer.usb {

    export class DeviceWebHid implements IDevice {
        
        private _disconnect : DisconnectFunc;
        private _onError : (err:any)=>void;
        private _deviceInfo : webhid.HIDDevice;
       

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
        
        private disconnected(device) {
           if (device==this._deviceInfo) {
               this.detachDisconnect();
               if (this._disconnect) {
                this._disconnect();
               }
           } 
        }
        private received : DataView[];
        private _receiveData : (data:DataView)=>void;
        public open(disconnect : DisconnectFunc,error : (err:any)=>void,receiveData : (data:DataView)=>void) : Promise<void> {
            
            if (!this._deviceInfo.opened) {
                this._disconnect=disconnect;
                this._receiveData=receiveData;
                this._deviceInfo.oninputreport= this.receivedReport.bind(this);
                //this._deviceInfo.addEventListener('oninputreport', this.receivedReportd.bind(this));
                //navigator.hid.ondisconnect=this.disconnected.bind(this);
                //navigator.hid.addEventListener('ondisconnect', this.disconnected.bind(this));
                this._deviceInfo.productId;
            }
            return this._deviceInfo.open();
        }
        private detachDisconnect() {
            navigator.hid.removeEventListener('disconnect', this.disconnected)

        }
        public close() : Promise<void> {
            this.detachDisconnect();
            return this._deviceInfo.close();
        }
        
        public sendData( data : ArrayBuffer) : Promise<void> {
           if (data.byteLength>USB_CSAVE_SIZE) 
            return Promise.reject(`Trying to send to much data, the buffer must be smaller or equal to ${USB_CSAVE_SIZE} and is ${data.byteLength}`) 
          var buf = new ArrayBuffer(USB_CSAVE_SIZE);
          var view=new Int8Array(buf);
          view.set(new Int8Array(data),0);
          return this._deviceInfo.sendReport(REPORT_TYPE, buf);
        }
        private receivedReport(ev: webhid.HIDInputReportEvent) {
            var inputData= ev.data;    
            //todo chack on ev.reportId==REPORT_TYPE
            if (inputData && inputData.byteLength==USB_CSAVE_SIZE) {         
                //copy all results into a buffer of 120
                var endByte=USB_CSAVE_SIZE-1;
                while (endByte>=0 && inputData.getUint8(endByte)==0) endByte--;
                if (endByte>=0 && inputData.getUint8(endByte)==csafe.defs.FRAME_END_BYTE) {
                    
                    //return the the data 
                    var view=new DataView(inputData.buffer,0,endByte);
                    this._receiveData(view);
                }
                else this.callError("end csafe frame not found");
            }
            else this.callError("nothing read");
            
        }
        
    }
    

    export class DriverWebHid implements IDriver {
       
       public requestDevics() : Promise<Devices> {
        return new Promise((resolve : (devices : Devices)=>void,reject)=>{
            try {
                navigator.hid.requestDevice({ filters: [{
                    vendorId: CONCEPT2_VENDOR_ID,
                    
                }]}).then((devices)=>{
                    if (devices.length>0) {
                        var device=devices[0];
                        var deviceInfo= new DeviceWebHid(device);
                        //deviceInfo.serialNumber=device.;
                        deviceInfo.productId=device.productId;
                        deviceInfo.vendorId=device.vendorId;
                        deviceInfo.productName=device.productName;
                        
                        resolve([deviceInfo]);

                    }
                    else reject("device not found");
                }).catch(reject);                
            } catch (error) {           
                return Promise.reject(error); 
            }   
           });
        }
    }
}