namespace ergometer.usb {

    export class DeviceCordovaHid implements IDevice {
        private _device: cordova_usb_hid.UsbHidDevice;
        private _disconnect: DisconnectFunc;
        private _onError: (err: any) => void;

        public vendorId: number;
        public productId: number;
        public productName: string;
        public serialNumber: string;

        constructor(device) {
            this._device = device;
        }
        public callError(err: any) {
            if (this._onError)
                this._onError(err);
        }

        private disconnected(device) {

            if (this._disconnect) {
                this._disconnect();
            }

        }

        private _receiveData: (data: DataView) => void;

        public open(disconnect: DisconnectFunc, error: (err: any) => void, receiveData: (data: DataView) => void): Promise<void> {

            this._disconnect = disconnect;
            this._receiveData = receiveData;
            return new Promise((resolve,reject)=>{
                //cordova.plugins.UsbHid.registerReadCallback(this.receivedData.bind(this)).then(() => {
                    cordova.plugins.UsbHid.requestPermission(this._device)
                        .then(() => {
                            return cordova.plugins.UsbHid.open({
                                packetSize: usb.WRITE_BUF_SIZE,
                                timeout: 1000,
                                skippFirstByteZero: true
                            }); 
                        }).then(resolve,reject);
             //   }).catch(reject);
            });
              

        }

        public close(): Promise<void> {
            return cordova.plugins.UsbHid.close();
        }

        public sendData(data: ArrayBuffer): Promise<void> {
            if (data.byteLength > USB_CSAVE_SIZE)
                return Promise.reject(`Trying to send to much data, the buffer must be smaller or equal to ${USB_CSAVE_SIZE} and is ${data.byteLength}`);             
            return new Promise((resolve,reject)=>{
                try {
                    var buf = new ArrayBuffer(WRITE_BUF_SIZE);
                    var view = new Int8Array(buf);
                    view.set([REPORT_TYPE], 0);
                    view.set(new Int8Array(data), 1);
                    cordova.plugins.UsbHid.writeRead(buf).then((data: ArrayBuffer)=>{
                        resolve();
                        //handle the resolve later
                        setTimeout(()=>{
                            if (data && data.byteLength == usb.WRITE_BUF_SIZE ) {
        
                                var inputData = new DataView(data);
                
                                var endByte = WRITE_BUF_SIZE - 1;
                                while (endByte >= 1 && inputData.getUint8(endByte) == 0) endByte--;
                                if (endByte >= 1 && inputData.getUint8(endByte) == csafe.defs.FRAME_END_BYTE) {
                                    
                                    //return the the data except for the first byte
                                    var view = new DataView(inputData.buffer, 1, endByte);
                                    this._receiveData(view);
                                    
                                }
                                else this.callError("end csafe frame not found");
                            }
                        }),0;
                        
                        
                    }).catch(reject);
                }
                catch (e) {
                    reject(e);
                }
                
            });
            
        }
        /*
        private receivedData(data: ArrayBuffer) {
             
            if (data && data.byteLength == usb.WRITE_BUF_SIZE ) {

                var inputData = new DataView(data);

                var endByte = WRITE_BUF_SIZE - 1;
                while (endByte >= 1 && inputData.getUint8(endByte) == 0) endByte--;
                if (endByte >= 1 && inputData.getUint8(endByte) == csafe.defs.FRAME_END_BYTE) {

                    //return the the data except for the first byte
                    var view = new DataView(inputData.buffer, 1, endByte - 1);
                    this._receiveData(view);
                }
                else this.callError("end csafe frame not found");
            }
            else this.callError("nothing read");

        }
        */
    }

    export class DriverCordovaHid implements IDriver {

        public requestDevics(): Promise<Devices> {
            return new Promise((resolve: (devices: Devices) => void, reject) => {
                try {
                    cordova.plugins.UsbHid.enumerateDevices().then((cordovaDevices) => {
                        var result: Devices = [];
                        cordovaDevices.forEach((device) => {
                            //add all concept 2 devices

                            if (device.vendorId == CONCEPT2_VENDOR_ID.toString()) {
                                var deviceInfo = new DeviceCordovaHid(device);
                                deviceInfo.serialNumber = device.serialNumber;
                                deviceInfo.productId = parseInt(device.productId);
                                deviceInfo.vendorId = parseInt(device.vendorId);
                                deviceInfo.productName = device.productName;
                                result.push(deviceInfo);
                            }
                        });
                        resolve(result);

                    }, reject);
                }
                catch (e) {
                    reject(e)
                }
            });
        }
    }
}