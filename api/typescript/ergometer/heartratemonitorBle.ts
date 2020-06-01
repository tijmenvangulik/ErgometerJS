namespace ergometer {

    export interface HeartRateDeviceInfo {
        //values filled when the device is found

        connected : boolean;
        name : string;
        address : string;
        quality : number;

         /** @internal */
         _internalDevice : ble.IDevice; //for internal usage when you use this I can not guarantee compatibility
    }
    export interface HeartRateData {
        heartRate?: number;
        //intervals between heart beats
        rrIntervals?: number[];
        //heartRate converted to energy
        energyExpended?: number;
        //device has made contact with the body and is measuring
        contactDetected?: boolean;

    }
    export interface HeartRateDataEvent extends pubSub.ISubscription {
        (data : HeartRateData) : void;
    }
    export class HeartRateMonitorBle extends MonitorBase {
        private _driver: ble.IDriver;
        private _deviceInfo : HeartRateDeviceInfo;

        private _devices : HeartRateDeviceInfo[] =[];

        private _heartRateDataEvent = new pubSub.Event<HeartRateDataEvent>();
        public get driver():ergometer.ble.IDriver {
           return this._driver;
        }

        public get heartRateDataEvent():pubSub.Event<HeartRateDataEvent> {
            return this._heartRateDataEvent;
        }
        protected initialize() {
            super.initialize();

            if (bleCentral.available()) this._driver= new bleCentral.DriverBleCentral([ble.HEART_RATE_DEVICE_SERVICE])            
            else if ((typeof bleat !== 'undefined' ) && bleat) this._driver = new ble.DriverBleat();
            else if ((typeof simpleBLE !== 'undefined' ) && simpleBLE ) this._driver = new ble.DriverSimpleBLE();
            else if (ble.hasWebBlueTooth()) this._driver= new ble.DriverWebBlueTooth(this,[ble.HEART_RATE_DEVICE_SERVICE],[]);
            else this.handleError("No suitable blue tooth driver found to connect to the ergometer. You need to load bleat on native platforms and a browser with web blue tooth capability.") ;

        }

        public disconnect() {
            if (this.connectionState>=MonitorConnectionState.deviceReady)  {
                this.driver.disconnect();
                this.changeConnectionState(MonitorConnectionState.deviceReady)
            }
        }

        public get deviceInfo():ergometer.HeartRateDeviceInfo {
            return this._deviceInfo;
        }
        private _registeredGuids  = {};

        public currentDriverIsWebBlueTooth() : boolean {
            return  this._driver instanceof ble.DriverWebBlueTooth;
         } 
    
 /**
         *
         * @param device
         */
        protected removeDevice(device : DeviceInfo) {
            this._devices=this._devices.splice(this._devices.indexOf(device),1);
        }

        /**
         *
         * @param device
         */
        protected addDevice(device : DeviceInfo) {
            var existing = this.findDevice(device.name);
            if (existing) this.removeDevice(existing);

            this._devices.push(device);
            //sort on hightest quality above
            this._devices.sort((device1,device2 : DeviceInfo) : number=>{ return device2.quality-device1.quality });
        }

        /**
         *
         * @param name
         * @returns {DeviceInfo}
         */
        protected findDevice(name : string) : DeviceInfo {
            var result : DeviceInfo=null;
            this._devices.forEach((device)=> {
                if (device.name==name) result=device;
            });
            return result;
        }

        /**
         *
         */
        public stopScan() {
            if (this.connectionState==MonitorConnectionState.scanning) {
                this.driver.stopScan();            }

        }

        /**
         * Scan for device use the deviceFound to connect .
         * @param deviceFound
         */
        public startScan(deviceFound : (device : HeartRateDeviceInfo)=>boolean,errorFn? : ErrorHandler ) :Promise<void> {



            this._devices=[];
            // Save it for next time we use the this.
            //localStorage.setItem('deviceName', this._deviceName);

            // Call stop before you start, just in case something else is running.
            this.stopScan();
            this.changeConnectionState(MonitorConnectionState.scanning);

            // Only report s once.
            //evothings.easyble.reportDeviceOnce(true);


            return this.driver.startScan(
                (device) => {
                    // Do not show un-named devices.
                    /*var deviceName = device.advertisementData ?
                     device.advertisementData.kCBAdvDataLocalName : null;
                     */
                    if (!device.name) {
                        return
                    }

                    // Print "name : mac address" for every device found.
                    this.debugInfo(device.name + ' : ' + device.address.toString().split(':').join(''));
                    
                    // If my device is found connect to it.
                    //find any thing starting with PM and then a number a space and a serial number
                    
                    this.showInfo('Status: DeviceInfo found: ' + device.name);
                    var deviceInfo : HeartRateDeviceInfo={
                        connected:false,
                        _internalDevice: device,
                        name:device.name,
                        address:device.address,
                        quality: 2* (device.rssi + 100) };
                    this.addDevice(deviceInfo);
                    if ( deviceFound && deviceFound(deviceInfo)) {
                        this.connectToDevice(deviceInfo.name);
                    }

                }

            ).then(()=> {
                this.showInfo('Status: Scanning...');
            }).catch(
                this.getErrorHandlerFunc("Scan error",errorFn)
            );

        }



        /**
         * connect to a specific device. This should be a PM5 device which is found by the startScan. You can
         * only call this function after startScan is called. Connection to a device will stop the scan.
         * @param deviceName
         */
        public connectToDevice(deviceName : string) : Promise<void> {
            this.showInfo('Status: Connecting...');
            this.stopScan();
            this.changeConnectionState(MonitorConnectionState.connecting);
            var deviceInfo = this.findDevice(deviceName);
            if (!deviceInfo) throw `Device ${deviceName} not found`;
            this._deviceInfo = deviceInfo;


            return this.driver.connect(deviceInfo._internalDevice,
                () => {
                    this.changeConnectionState(MonitorConnectionState.deviceReady);
                    this.showInfo('Disconnected');
                    
                }
                ).then(()=> {
                    this.changeConnectionState(MonitorConnectionState.connected);
                    this.showInfo('Status: Connected');

                }).then( ()=> {
                    // Debug logging of all services, characteristics and descriptors
                    // reported by the BLE board.
                    this.deviceConnected();
                }).catch((errorCode)=> {
                    this.changeConnectionState(MonitorConnectionState.deviceReady);
                    this.handleError(errorCode);

                });
        }
        
        protected deviceConnected() {
            this.debugInfo("readServices success");


            this.debugInfo('Status: notifications are activated');
            //handle to the notification
            
            this.changeConnectionState(MonitorConnectionState.servicesFound);
            //first enable all notifications and wait till they are active
            //and then set the connection state to ready           
            this.driver.enableNotification(ble.HEART_RATE_DEVICE_SERVICE,ble.HEART_RATE_MEASUREMENT,this.handleDataHeartRate.bind(this)).then(()=>{
                //fix problem of notifications not completaly ready yet
                
                    this.changeConnectionState(MonitorConnectionState.readyForCommunication);   
              
                             
            }).catch(this.handleError);

            
        }
        protected handleDataHeartRate(data:ArrayBuffer) {
            var value =  new DataView(data);
            let flags = value.getUint8(0);
            let rate16Bits = flags & 0x1;
            let result : HeartRateData= {
            };
            let index = 1;
            
            if (rate16Bits) {
              result.heartRate = value.getUint16(index, /*littleEndian=*/true);
              index += 2;
            } else {
              result.heartRate = value.getUint8(index);
              index += 1;
            }
            
            let contactDetected = flags & 0x2;
            let contactSensorPresent = flags & 0x4;
            if (contactSensorPresent) {
              result.contactDetected = !!contactDetected;
            }
            let energyPresent = flags & 0x8;
            if (energyPresent) {
              result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
              index += 2;
            }
            let rrIntervalPresent = flags & 0x10;
            if (rrIntervalPresent) {
              let rrIntervals : number[] = [];
              for (; index + 1 < value.byteLength; index += 2) {
                rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
              }
              result.rrIntervals = rrIntervals;
              
            }
            this.heartRateDataEvent.pub(result);
        }
        
    }


}