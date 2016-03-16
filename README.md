# Introduction

Java script ergometer driver for concept 2 performance monitor with BLE. 
(The PM5) Works on all major platforms using cordova and node/electron",


I hope this project will become a shared effort to make it easier to write next generation ergometer software.

Tijmen 
Tijmen@vangulik

#change log
- 0.0.1 First version
- 0.0.2 New features: 

    * csafe framework 
    * power curve event and csafe command
    * some simple csafe commands
- 0.0.3 

 * easy ble is replaced by bleat (still uses the evothings ble drivers)
   Easy ble is replaced by bleat. With some small changes in bleat api my ergometer api is still backwards compatible. 
    
You only need to change the javascript included file

    <script src="libs/evothings/easyble/easyble.js"></script>

   to

    <script src="libs/bleat.js"></script>

 * bleat (https://github.com/thegecko/bleat) will allow multiple platforms

     * Android/iOS/Windows (using Evothings/Cordova/PhoneGap) https://github.com/evothings/cordova-ble/blob/master/ble.js
     * Mac/Linux/Windows (using noble on Node.js) https://github.com/sandeepmistry/noble
     * ChromeOS https://developer.chrome.com/apps/bluetoothLowEnergy

- 0.0.4
 
    * Electron demo for desktop apps
    * separated the demo code from the platform code
    * Refactored error handling
    * Renamed project from MobileErgometer to ErgometerJS
- 0.0.5

    * Improved npm build script and typescript config files
    * Send now returns a Promise. Changed the demo for this.
      I plan to make more use of promises to clean up some internal error handling code.
- 0.0.6
     * Refactored all internal error handling to make use of Promises
     * Made internal driver layer based on Promises which gives some more protection and 
       will make recording easier in the future.
- 0.0.7
     * More commands
     * Skipp some strange return values which look like corrupted or undocumented return values
     * Short hand notation for some simple get and set commands
     * Program command , the value now a correct type and the property program is now named value

- 0.0.8 
     * Record and replay events. This is use full for:
        - Writing code without the constant need of an ergometer 
        - You can test code in an phone emulator (emulators do not have access to blue tooth hardware)
        - Writing unit tests
        - Record issues and send them to some one else to fix.
     * added a demo project for record and replay

-0.0.9
     * Upgraded bleat 0.1.0 
        - The bleat bug fixes are not needed any more. 
        - Still use the bleat classic interface
        - The ergometer api is not changed but you will need to include other bleat javascript libraries in your html/javascript.
          See the demo's for the details
     * Upgraded to typescript 1.8.2
     * Made a start with implementing Web-bluetooth. In the future this allows you to run the app from a normal browser. 
       This is still work in progress
        
# Project features

* The project is open source and and it is based on open source project. (appache 2 license) 
* Uses low power blue tooth (BLE) connection.
* Written in typescript which is compiled to javascript. You can use the driver without typescript.
* Platform independent (cordova/ phonegap /ionic)
* For now the internal ble driver works with ios, android and windows 8.1.  
* API definitions can be found in a separate typescript definition file (ergometer.d.ts).  

    http://www.concept2.com/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf

# Licenses

Components

- The project : Apache license 2.
- Evothings : Apache 2 license.
- Bleat : Mit license
- Electron: Mit license

# Todo

* Add more commands
* Write a demo of an app which can really be used. (now it)

#Known problems
                  
* There are problems in the PM5 BLE firmware. Some csafe commands give back invalid responses. 
I hope they fix it soon. See

http://www.c2forum.com/viewtopic.php?f=15&t=93321

* ES6-Promises
The library uses ES6-Promises. I assume that the library is uses in modern browsers. If this is
not the case you need to include a poly fill javascript library:

 https://github.com/lahmatiy/es6-promise-polyfill

# Installation

To make it work you need:

* An concept2 ergometer with PM5
* An android or iphone with BLE capability.
* npm which can be downloaded from https://www.npmjs.com

Do a download or checkout from github (https://github.com/tijmenvangulik/MobileErgometer)


open a command prompt on the downloaded directory and type

    npm install

to build the driver and the demo from the original typescript source. (not required they are already build)

    npm run build

after the build the driver will be located in

    driver\lib\ergometer.js

the description of the interface can be viewed as type script definition file. (this is generated from the source)

    driver\lib\ergometer.d.ts

To use the library you need all the files in the lib directory and include it in your cordova phone gab app

	<script src="libs/ergometer.js"></script>
	<script src="libs/jquery/jquery.js"></script>
	<script src="libs/evothings/evothings.js"></script>
	<script src="libs/evothings/easyble/easyble.js"></script>


Demo Simple Cordova

first install Cordova

    npm install -g cordova
    (or the same as I used: npm install -g cordova@5.4.1 )

in the command line go to dir demos\simplecodova

add one ore more platforms which you want to test (only ios, android and windows (8.1) are possible)

    cordova platform add ios
    cordova platform add android
    cordova platform add windows
    
optional: update ble plugin to get the latest

    cordova plugin rm cordova-plugin-ble
    cordova plugin add cordova-plugin-ble

To build and run in the emulator 

    cordova run ios

Blue tooth will not work in an emulator so it is better to test directly on your device:

    cordova --device run ios

Check the console for the ergometer data. (you can read the log by starting a browser and debug the cordova app.
GabDebug is a handy tool for is. For debugging you should enable debug mode in the build properties the platform project)

#Evothings

The blue tooth drivers are from evo things. Evothings has also an nice feature that you can run an debug phone applications
on your phone without having to install an application. Go to evothings website if you want to know more about this.

    http://evothings.com

#Usage                                                                                                             
                                                                                                                 
Create this class to acCess the performance data
                                                                     
    var performanceMonitor= new ergometer.PerformanceMonitor();                                                       
                                                                                                                 
After this connect to the events to get data
                                                                        
    performanceMonitor.rowingGeneralStatusEvent.sub(this,this.onRowingGeneralStatus);                                 

On some android phones you can connect to a limited number of events. Use the multiplex property to overcome        
this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see     
the documentation in the properties You must set the multiplex property before connecting                          

    performanceMonitor.multiplex=true;                                                                                
                                                                                                                 
to start the connection first start scanning for a device,                                                          
you should call when the cordova deviceready event is called (or later)  
                                           
    performanceMonitor.startScan((device : ergometer.DeviceInfo) : boolean => {                                       
      //return true when you want to connect to the device                                                           
       return device.name=='My device name';                                                                         
    });  
                                                                                                                 
to connect at at a later time 
                                                                                     
    performanceMonitor.connectToDevice('my device name'); 
                                                           
the devices which where found during the scan are collected in
                                                     
    performanceMonitor.devices   
                                                                                        
when you connect to a device the scan is stopped, when you want to stop the scan earlier you need to call 
         
    performanceMonitor.stopScan 
    
More information can be found in the typescript definitions:
    
    https://github.com/tijmenvangulik/MobileErgometer/blob/master/api/lib/ergometer.d.ts
    
##CSafe

CSafe is used to send and receive commands. I have implemented an jquery like api which is:
- chainable (not required)
- Extensible (you add your own commands to the buffer object. A command can consist out of multiple commands)
- type safe
- multiple commands can be send in one requests to reduce the load

An example of a

when the connection state is ready for communcation you can start with csafe commands

    protected onConnectionStateChanged(oldState : ergometer.MonitorConnectionState, newState : ergometer.MonitorConnectionState) {  
            if (newState==ergometer.MonitorConnectionState.readyForCommunication) {


The csafeBuffer property is used to prepare one or multiple commands. Before adding commands you have
to clear the buffer. At then end call send to call the buffer. 
The next command can only be send after that the first command is send. Use the optional 
success and error parameters of the send function to start with the next command. You can also send the
next command when data is received.


    this.performanceMonitor.csafeBuffer
                .clear()
                .getStrokeState({
                    received: (strokeState : ergometer.StrokeState) =>{
                        this.showData(`stroke state: ${strokeState}`);
                    }
                })
                .getVersion({
                    received: (version : ergometer.csafe.IVersion)=> {
                        this.showData(`Version hardware ${version.HardwareVersion} software:${version.FirmwareVersion}`);
                    }
                })
                .setProgram({program:2})
                .send();


It is not required to chain the commands. You can also write code the classic way:

    var buffer=this.performanceMonitor.csafeBuffer;
    buffer.clear();
    buffer.setProgram({program:2}); 
    buffer.send();
    

It is possible to add new commands to the command buffer. 
for this you have to call commandManager.register to register your new command.
You have to pass on a function because the actual declaration is deferred to a later state.

There is one required command property where you define the main command. Some long commands like
the configuration command have a second detail command. You can specify this in the detailCommand property.
You do not have to set the start,stop,crc check,length bytes in the cdafe commands these values are automaticly
calculated. (except when there is an additional length in the data of a command, like the power curve)

    export interface ICommandStrokeState  {
        received : (state : StrokeState )=>void;
        onError? : ErrorHandler;
    }
    export interface IBuffer {
        getStrokeState(params : ICommandStrokeState) : IBuffer;
    }

    commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitor) =>{
        buffer.getStrokeState= function (params : ICommandStrokeState) : IBuffer {
            buffer.addRawCommand({
                waitForResponse:true,
                command : csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                detailCommand: csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKESTATE,
                onDataReceived : (data : DataView)=>{
                    if (params.received) params.received(data.getUint8(0))
                },
                onError:params.onError
            });
            return buffer;
        }
    })
    
There are many commands, I have not yet found time to add all the commands. If you added new ones
please commit them to github. When you not care about writing a user friendly command wrapper you can
allways send raw commands. For example

    this.performanceMonitor.csafeBuffer.clear()
        .addRawCommand({
                        waitForResponse:true,
                        command : csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                        detailCommand: csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKESTATE,
                        onDataReceived : (data : DataView)=>{
                            alert(data.getUint8(0));
                        }
                    })
        .send(); 
        .then(()=>{  //send returns a promise
           console.log("send done, you can send th next")
         }); 
                  
# Electron

go to the directory demos\simple_electron

install electron pre build including noble for the blue tooth 

    npm install

run the demo

    npm start
    
Optional: You can rebuild the javascipt from the type script by typing in the main folder.

    npm run build:simple_electron
    
Debugging electron

I found that WebStorm-EAP was a nice environment for debugging and developing electron applications.

# Record an replay
 
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