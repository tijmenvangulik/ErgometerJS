# Record an replay
 
The demo makes use of the standard web BLE support of chrome. You can also make use of noble. But this is more complex to install and windows support is limited. Chrome BLE is easier bug it needs an extra click for connecting to the device. (you can only connect to an blue tooth device when the end user clicks on an button to select the device.)
 
Recording records all low level communication between the blue tooth driver and the ergometer monitor. You will see
in the log a lot of events which are normally skipped because the are duplicate.

For replaying you should record the the initial connection sequence other wise the ergometer montior will not get into
connected state. After this you can replay any other recording

Because the recordings are done on the driver level and listening to blue tooth events is also record you will allways need 
to do a full run of the connection and the part which you want to replay. So you can not record the connection separate from a 100 meter
run these must be recorded in one go.

to start recording use

    performanceMonitor.recording=true;
    //then directly start the scan to connect
    performanceMonitor.startScan((device : ergometer.DeviceInfo) => {
                return true;
            });
    
To stop it use:
    
    performanceMonitor.recording=false;
    
To get the recording and convert it to json:

     console.log(JSON.stringify(this.performanceMonitor.recordingEvents, null, '\t')  );

     
To replay. (you could also load it from an json file, but you need json.parse to convert it to javascript)

module ergometer.recording {

    export const connection =
        [
            {
                "timeStamp": 841,
                "eventType": "startScan",
                "timeStampReturn": 847
            },
            {
                "timeStamp": 1204,
                "eventType": "scanFoundFn",
                "data": {
                    "address": "d2:c7:83:ad:5a:ae",
                    "name": "PM5 430070439",
                    "rssi": -56
                }
            },
        ]
    this.performanceMonitor.replay(ergometer.recording.connection);
    //then start the scan which will connect using the dummy data of the connection
     performanceMonitor.startScan((device : ergometer.DeviceInfo) => {
                     return true;
                 });
                 
       