# Introduction

Java script ergometer driver for concept 2 performance monitor with BLE. 
(The PM5) Works on all major platforms using cordova and node/electron",


I hope this project will become a shared effort to make it easier to write next generation ergometer software.

Tijmen 
Tijmen@vangulik

# Project features

* The project is open source and and it is based on open source project. (appache 2 license) 
* Uses low power bluetooth (BLE) connection (only PM5).
* Usb (hid) support for PM3/4/5
* Written in typescript which is compiled to javascript. You can use the driver without typescript.
* Platform independent (mobile / desktop / web ) I have not yet been able to test all platforms but it should work on:
  
  * Mobile using cordova: iOS,android, Windows 
  * Mobile react native: iOS,android   
  * Desktop using Electron  MacOS X, Windows, Linux
  * Server using Node MacOS X, Windows, Linux (inc Raspberry PI)
  * Web: chromium based browsers

Basically ErgometerJS needs javascript and a blue tooth driver which can be (noble,cordova-plugin-ble or web bluetooth)

* API definitions can be found in a separate typescript definition file (ergometer.d.ts).  

    http://www.concept2.com/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf

# Change Log

[View change log](ChangeLog.md)

# Licenses

[License text](LICENSE.txt)

Components

- The project : Apache license 2.
- Bleat : Mit license
- Electron: Mit license

# platforms

|            | pm3-5 usb   | Bluetooth  |
|------------|-------------|------------|    
|Web         | yes **      | yes **     |
|Cordova     | android     | yes        |
|Electron    | yes         | yes        |
|React native|             | *          |

* the demo contains an limeted proof of concept, there are other libraries
 which have better suport. it is not difficult to support other usb/ble drivers ( react-native-ble-plx may be an better option)
** chromium based browsers

# Todo
* usb ios support
* Add more commands

# Known problems
                  
* There are problems in the PM5 BLE firmware. Some csafe commands give back invalid responses. 
I hope concept2 will it. See

http://www.c2forum.com/viewtopic.php?f=15&t=93321

* React native: the used blue tooth library does not (yet?) support direct reading and writing to characteristics.
due to this the csafe commands and the power curve do not work.

# Installation

To make it work you need:

* An concept2 ergometer with PM5
* An PC or Mac, android or iphone with BLE capability.
* npm which can be downloaded from https://www.npmjs.com
(for the electron usb demo you can use an older PM3 device)

Do a download or checkout from github (https://github.com/tijmenvangulik/ErgometerJS)


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


# Usage for Bluetooth (BLE)                                                                                                                                                                                                                            
Create this class to acCess the performance data
                                                                     
    var performanceMonitor= new ergometer.PerformanceMonitorBle();                                                       
                                                                                                                 
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
    
[ergometer.d.ts](https://github.com/tijmenvangulik/MobileErgometer/blob/master/api/lib/ergometer.d.ts)
    
## CSafe

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


    this.performanceMonitor.newCsafeBuffer()
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

    var buffer=this.performanceMonitor.newCsafeBuffer();
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
always send raw commands. For example

    this.performanceMonitor.newCsafeBuffer()
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

Command merging
Long config commands can be merged into one command for efficency when they are directly after each other in the buffer.

When you set sortCommands to true the commands are sorted so they can be merged without caring about the the order in which you add the commands. 

### Creating workouts

#### public commands

setProgram,setDistance,setWorkoutType, setScreenState and setConfigureWorkout are public and work fine for USB and bluetooth. 

Web bluetooth has only a small packet size of 20 bytes, so we need to split the commands to make it work on the web.

##### distance

Use the following code to set a distance and go to the workout screen: 

    await performanceMonitor.newCsafeBuffer()
        .setDistance({value:3000,unit:ergometer.Unit.distanceMeter})
        .setProgram({value:ergometer.Program.Programmed})
        .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})
        .send();

##### Configure JustRow
        await this.performanceMonitor.newCsafeBuffer()
           .setWorkoutType({value: ergometer.WorkoutType.justRowSplits})
           .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})
           .send();

##### Configure 2000m/400m splits

    await performanceMonitor.newCsafeBuffer()
        .setWorkoutType({value: ergometer.WorkoutType.fixedDistanceSplits})
        .setWorkoutDuration({value:2000,durationType:ergometer.WorkoutDurationType.distance})        
        .send()
    await this.performanceMonitor.newCsafeBuffer()
        .setSplitDuration({value:400,durationType:ergometer.WorkoutDurationType.distance})
        .setConfigureWorkout({programmingMode:true})
        .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})        
        .send()

#### proprietary commands

The next examples only work for blue tooth. For USB you need authentication to use these proprietary commands. Please contact Concept2 for information how to do the authentication. 

##### Configure fixe time
 
20:00/4:00 splits, power goal of 100 watts

    await this.performanceMonitor.newCsafeBuffer()
        .setWork({hour:0,minute:20,second:0})
        .setProgram({value:ergometer.Program.Programmed})
        .send();
    await this.performanceMonitor.newCsafeBuffer()
        .setSplitDuration({value:400,durationType:ergometer.WorkoutDurationType.distance})
        .send();
    await this.performanceMonitor.newCsafeBuffer()
        .setPower({value:100,unit:ergometer.Unit.powerWatts})
        .setProgram({value:ergometer.Program.Programmed})
        .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})
        .send();

##### Configure 20:00/4:00 splits

    await performanceMonitor.newCsafeBuffer()
        .setWorkoutType({value: ergometer.WorkoutType.fixedTimeSplits})
        .setWorkoutDuration({value:20*60*100,durationType:ergometer.WorkoutDurationType.time})        
        .send();

    await performanceMonitor.newCsafeBuffer()
        .setSplitDuration({value:4*60*100,durationType:ergometer.WorkoutDurationType.time})
        .setConfigureWorkout({programmingMode:true})
        .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})        
        .send();

##### Configure Fixed Time Interval 2:00/:30 rest

    await performanceMonitor.newCsafeBuffer()
       .setWorkoutType({value: ergometer.WorkoutType.fixedTimeInterval})
       .setWorkoutDuration({value:2*60*100,durationType:ergometer.WorkoutDurationType.time})        
       .send();
       
    await performanceMonitor.newCsafeBuffer()
       .setRestDuration({value:30})
       .setConfigureWorkout({programmingMode:true})
       .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})                
       .send();

##### Configure variable interval v500m/1:00r…4

Interval 1: 500m/1:00r, target pace of 1:40
Interval 2: 3:00/0:00r, target pace of 1:40

    await performanceMonitor.newCsafeBuffer()
        .setWorkoutIntervalCount({value:0}) //start set workout interval #1
        .setWorkoutType({value: ergometer.WorkoutType.variableInterval})
        .setIntervalType({value: ergometer.IntervalType.distance})
        .send()

    await performanceMonitor.newCsafeBuffer()
        .setWorkoutDuration({value:500,durationType:ergometer.WorkoutDurationType.distance})        
        .setRestDuration({value:60})
        .send();
        
    await performanceMonitor.newCsafeBuffer()
        .setTargetPaceTime({value:(1*60+40)*100})
        .setConfigureWorkout({programmingMode:true})
        .send();

    //Interval 2: 3:00/0:00r, target pace of 1:40
    await performanceMonitor.newCsafeBuffer()
        .setWorkoutIntervalCount({value:1}) //start set workout interval #2
        .setIntervalType({value: ergometer.IntervalType.time})
        .send()

    await performanceMonitor.newCsafeBuffer()
        .setWorkoutDuration({value:3*60*100,durationType:ergometer.WorkoutDurationType.time})        
        .setRestDuration({value:0})
        .send();

    await this.performanceMonitor.newCsafeBuffer()
        .setTargetPaceTime({value:(1*60+40)*100})
        .setConfigureWorkout({programmingMode:true})
        .send();

        //go to screen
    await this.performanceMonitor.newCsafeBuffer()
        .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})                
        .send();

# Usage for Usb

An usb device has a quicker way of finding devices but does not have all the concept2 BLE events. So the api is a bit different. The csafe part is exactly the same as for the ble device.

To create an Usb monitor:

    var performanceMonitor= new ergometer.PerformanceMonitorUsb();  

    //to find out which concept2 devices are connected
    var foundDevice;
    this.performanceMonitor.requestDevics().then(devices=>{
        //here a list of concept 2 devices are returned
        //you can loop the devices
        devices.forEach( (device) => {
            console.log(device.productName);
            foundDevice=device;
        })
    });
    //to connect to an device you can use the connectToDevice
    if (foundDevice)
        performanceMonitor.connectToDevice(foundDevice);

to disconnect from the performance monitor call the disconnect method.

    performanceMonitor.disconnect()

you can retreive data from the monitor by connecting to events. when you do not subscribe 
to any of the training/stroke/power curve events then the monitor will not do any csafe commands
to get data. You have to do your own csafe calls to get data.

## logEvent
returns error, info and trace messages. (same event as in the blue tooth ergometer)

## connectionStateChangedEvent
Get info on the connection state.  (same event as in the blue tooth ergometer)

    performanceMonitor.connectionStateChangedEvent.sub(this,(oldState,newState)=>{
        console.log("new connection state="+newState.toString());       
    });

## strokeStateEvent
Using this event you can see if the rower is doing is rowing and you can see in which phase he is.

    performanceMonitor.strokeStateEvent.sub(this,(oldState : ergometer.StrokeState,newState : ergometer.StrokeState)=>{
        console.log("New state:"+newState.toString());
    })

## trainingDataEvent
Information on the selected training and the state of the training.

    performanceMonitor.trainingDataEvent.sub(this,(data :ergometer.TrainingData)=>{
        console.log("training data :"+JSON.stringify(data,null,"  "));
    });

## strokeDataEvent
Data on the last stroke.

    performanceMonitor.strokeDataEvent.sub(this,(data: ergometer.StrokeData)=>{
        console.log("stroke data:"+JSON.stringify(data,null,"  "));
    });

## powerCurveEvent
The power curve. When you connect to this event the data will be retreived. (same event as in the blue tooth ergometer)

    performanceMonitor.powerCurveEvent.sub(this,(data : number[])=>{
        console.log("stroke data:"+JSON.stringify(data,null,"  "));
    })

## csafe comnunication

Csafe communication is done the same way as the ble commnunication.
See the csafe paragraph of the previous chapter how to do csafe commands.

    this.performanceMonitor.newCsafeBuffer()

# heart rate

When the end user has an PM5 he will normally connect a heart rate device to the concept2 performance monitor and the
device will send the heart rate to ergometerjs. Hover older devices like the PM3 do not have heart rate support. For
this I have included a class HeartRateMonitorBle which can directly to a blue tooth heart rate device. 

HeartRateMonitorBle makes use of the same driver infra structure as the ergometer PerformanceMonitorBle class. The inter face of the heart rate monitor is similar to the blue tooth class the main difference is that this class has a heartRateDataEvent for reading the heart rate.

To start the connection first start scanning for a device,                                                          
you should call when the cordova deviceready event is called (or later)  
                                           
    performanceMonitor.startScan((device : ergometer.HeartRateDeviceInfo) : boolean => {                                       
      //return true when you want to connect to the device                                                           
       return device.name=='My device name';                                                                         
    });  
                                                                                                                 
to connect at at a later time 
                                                                                     
    performanceMonitor.connectToDevice('my device name'); 
                                                           
the devices which where found during the scan are collected in
                                                     
    performanceMonitor.devices   
                                                                                        
when you connect to a device the scan is stopped, when you want to stop the scan earlier you need to call 
         
    performanceMonitor.stopScan()

To disconnect call

    performanceMonitor.disconnect()
to receive the heart rate information you have to subscribe to the heartRateDataEvent event

    performanceMonitor.heartRateDataEvent.sub(this,this.hearRateData);

An demo of the api is in included in the electron usb debug example.
         
# Examples
            

## Electron

Use this when you want tow write a desktop app using html 5. ErgometerJS can connect
using noble to an PM5 device or using.

[demos/simple_electron](demos/simple_electron/README.md)                 


## Record an replay

Record and replay the bluetooth communication. Handy for debugging without
 having to row on an ergometer. This demo is written using electron, this makes it ideal for
 debugging the communication because you can do not need to place it on a phone to make it worrk.
 
[demos/recording](demos/recording/README.md)                 
                 
## Ionic 2

Popular GUI frame work for writing hml5 apps for mobile apps. Since it is html 5
the app is re-usable in web or electron.

[demos/ionic_test](demos/ionic_test/README.md)

## React native

Write mobile apps using native components in react using javascript.

Know problem: the used blue tooth library does not (yet?) support direct reading and writing to characteristics.
due to this the csafe commands and the power curve do not work.

[demos/react_native](demos/react_native/README.md)

## Web bluetooth
This is for web application. Directy access the ergometer from the webbrowser. This feature
is at the point of writing only works in the latest chrome on a mac and linux.

[demos/webbluetooth](demos/webbluetooth/README.md)

## Node/electron Usb (hid device)

An example how to connect to an older PM3-4 monitor using usb. Blue tooth native library is not installed, but it can still make use of blue tooth using chrome web ble in electron.

[demos/usb_electron](demos/usb_electron/README.md)

Version which includes all the ergometer js source for debuging purpose.

[demos/usb_electron_debug](demos/usb_electron_debug/README.md)


## Web hid example

Future versions will support web hid. With this you can connect using usb to your pm5 directly from chrome. The feature is not yet stable but 
it works in in chrome canary. with experimental features turned on.

https://github.com/robatwilliams/awesome-webhid#status

[demos/web_usb_debug](demos/web_usb_debug/README.md)

## cordova usb example (includes ble heart rate samle).

for cordova I have created an usb hid plugin which needs to be installed

  https://github.com/tijmenvangulik/cordova-usb-hid

The demo compiles by including the original source code. This is good for debugging. It is better to
include the lib when you only the lib.

This sample also includes an example how to connect to an heart rate device directly using the HeartRateMonitorBle class. This is usefull for connecting to a PM3 device which does not have heart rate support.

[demos/usb_cordova_debug](demos/usb_cordova_debug/ReadMe.md)

# cordova ble example

Blue tooth example using cordova for mobile platforms.

[demos/ble_cordova_debug](demos/ble_cordova_debug/README.md)
