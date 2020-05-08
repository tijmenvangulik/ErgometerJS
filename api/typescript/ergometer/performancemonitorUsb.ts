/**
 * Concept 2 ergometer Performance Monitor api for Cordova
 *
 * This will will work with the PM5
 *
 * Created by tijmen on 01-06-15.
 * License:
 *
 * Copyright 2016 Tijmen van Gulik (tijmen@vangulik.org)
 * Copyright 2016 Tijmen van Gulik (tijmen@vangulik.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace ergometer {

    export class UsbDevice {
        /** @internal */ 
        _internalDevice: usb.IDevice;
        vendorId : number;
        productId : number;
        productName : string;
        serialNumber : string;
    }
    export type UsbDevices = UsbDevice[];
    
    const WAIT_TIME_MEASURING = 30;//min ms when actively getting data when rowing or starting to row
    const WAIT_TIME_INIT = 500;//min ms
    const WAIT_TIME_LOW_RES = 200;

    export interface StrokeStateChangedEvent extends pubSub.ISubscription {
        (oldState : StrokeState,newState : StrokeState, duration : number) : void;
    }
    export interface TrainingDataEvent extends pubSub.ISubscription {
        (data : TrainingData) : void;
    }
    export interface StrokeDataEvent extends pubSub.ISubscription {
        (data : StrokeData) : void;
    }

    export class StrokeData {
        dragFactor =0;
        workDistance =0 ; 
	    workTime =0;
        splitTime=0;
	    power =0;
	    strokesPerMinuteAverage =0;
	    strokesPerMinute =0;
        distance =0;
	      //time =0;  //does not yet work remove for now
        totCalories =0; // accumulated calories burned  CSAFE_GETCALORIES_CMD
	    caloriesPerHour =0;  // calories/Hr derived from pace (GETPACE)
        heartRate =0;
    }
    export class TrainingData 
    { 
        workoutType : WorkoutType; 
        duration =0;//ms	
        distance =0;
        workoutState : WorkoutState; 
        workoutIntervalCount =0;
        intervalType : IntervalType = IntervalType.none;
        restTime  =0;
        endDistance  =0;
        endDuration =0;	
    };

    export class PerformanceMonitorUsb extends PerformanceMonitorBase {
        
        private _driver: usb.IDriver;
        private _device : ergometer.usb.IDevice;
        
        private _nSPMReads = 0;
        private _nSPM = 0 ;
    
        private _strokeStateEvent = new pubSub.Event<StrokeStateChangedEvent>();
        private _trainingDataEvent = new pubSub.Event<TrainingDataEvent>();
        
        private _strokeDataEvent = new pubSub.Event<StrokeDataEvent>();

        private _strokeData = new StrokeData();
        private _trainingData= new TrainingData();
        private _strokeState: ergometer.StrokeState;
        private _lastTrainingTime = new Date().getTime();

        private _lastLowResUpdate: number =null;

        //sending and reading
        public get strokeData() : StrokeData{
            return this._strokeData;
        }
        public get trainingData() : TrainingData {
            return this._trainingData;
        }        
     
        get strokeState(): StrokeState {
            return this._strokeState;
        }
        get device() : ergometer.usb.IDevice {
            return this._device;
        }
        
        public get strokeStateEvent(): pubSub.Event<StrokeStateChangedEvent> {
            return this._strokeStateEvent;
        }
        public get trainingDataEvent(): pubSub.Event<TrainingDataEvent>  {
            return this._trainingDataEvent;
        }
        public get strokeDataEvent(): pubSub.Event<StrokeDataEvent>  {
            return this._strokeDataEvent;
        }
        
        static canUseNodeHid() : boolean {
            return typeof nodehid!="undefined"
        }
        static canUseWebHid() : boolean {
            return typeof navigator.hid!="undefined"
        }
        static canUseCordovaHid() : boolean {
            return typeof cordova!="undefined" && typeof cordova.plugins!="undefined" && typeof cordova.plugins.UsbHid!="undefined"
        }
        static canUseUsb() : boolean {
            return PerformanceMonitorUsb.canUseNodeHid() || 
                    PerformanceMonitorUsb.canUseWebHid() ||
                    PerformanceMonitorUsb.canUseCordovaHid();
        }
        protected initialize() {
            super.initialize();
            if (PerformanceMonitorUsb.canUseNodeHid()) {
                this._driver= new ergometer.usb.DriverNodeHid();
            }
            else if (PerformanceMonitorUsb.canUseCordovaHid()) {
                this._driver= new ergometer.usb.DriverCordovaHid();
            }
            else if (PerformanceMonitorUsb.canUseWebHid()) {
                this._driver= new ergometer.usb.DriverWebHid();
            }
            this._splitCommandsWhenToBig=false;
            this._receivePartialBuffers=false;  
        }

        public get driver():ergometer.usb.IDriver {
            return this._driver;
        }
        public set driver(value : ergometer.usb.IDriver) {
           this._driver=value;
        }
        
        protected driver_write( data:ArrayBufferView) :Promise<void> {
            if (this.connectionState!=ergometer.MonitorConnectionState.readyForCommunication)
              return Promise.reject("Can not write, erogmeter is not connected");
            return new Promise((resolve,reject)=>{
                this._device.sendData(data.buffer)
                .then(resolve) 
                .catch((err)=>{
                    //the usb has not an disconnect event, assume an error is an disconnect
                    this.disconnected();
                    reject(err);
                })
            })
            
        }
        private receiveData(data:DataView) {
            this.handeReceivedDriverData(data);
        }

        public sendCSafeBuffer(csafeBuffer : ergometer.csafe.IBuffer) : Promise<void> {
            
            if (this.connectionState!=ergometer.MonitorConnectionState.readyForCommunication)
              return Promise.reject("can not send data, not connected"); 
            return new Promise((resolve,reject)=>{
                if (this.connectionState!=ergometer.MonitorConnectionState.readyForCommunication)
                  reject("can not send data, not connected");
                //if buzy try again later, send receive one at a time
                /*if (this.csafeSendBuzy) {
                    return Promise.reject("can not send data, ergometer send is aready buzy");
                }
                else*/ 
                {
                    this.traceInfo("send "+JSON.stringify(csafeBuffer.rawCommands));
                    //the send will resolve when all is received
                    super.sendCSafeBuffer(csafeBuffer).then(()=>{
                        resolve();
                        
                    }).catch( (e)=>{
                        this.disconnected();//the usb has not an disconnect event, assume an error is an disconnect
                        this.handleError(e);
                        this.traceInfo("end buzy");
                        reject(e);
                    })
                }
                
            });
        }
        
        public requestDevics() : Promise<UsbDevices> { 
            if (!this._driver) return Promise.reject("driver not set");
            return new Promise((resolve,reject)=>{
                this._driver.requestDevics().then((driverDevices)=>{
                    var result : UsbDevices= [];
                    driverDevices.forEach((driverDevice)=>{
                        var device= new UsbDevice();
                        device.productId=driverDevice.productId;
                        device.productName=driverDevice.productName;
                        device.vendorId=driverDevice.vendorId;
                        device.serialNumber=driverDevice.serialNumber;
                        device._internalDevice=driverDevice;
                        result.push(device);
                    });
                    resolve(result);
                }).catch(reject);  
            });
        
        }

        public disconnect() {
            if (this.connectionState>=MonitorConnectionState.deviceReady)  {
                if (this._device)
                  this._device.close();
                this.changeConnectionState(MonitorConnectionState.deviceReady)
            }
        }
        private disconnected() {
            
            if (this._device) {
                this.changeConnectionState(MonitorConnectionState.deviceReady )        
                this._device=null;
            }
              
        }
        
        public connectToDevice(device : UsbDevice)  : Promise<void>{
            if (!this._driver) return Promise.reject("driver not set");
            if (!device) return Promise.reject("device is null");
            this._device=device._internalDevice;
            this.changeConnectionState(MonitorConnectionState.connecting);
            var result=this._device.open(this.disconnected,
                this.handleError.bind(this),
                this.receiveData.bind(this));
            result.then(()=>{
                this.changeConnectionState(MonitorConnectionState.connected);
                this.changeConnectionState(MonitorConnectionState.readyForCommunication);
            })
            return result;
        }
        
        protected getPacketSize() : number {
            return usb.USB_CSAVE_SIZE-1;
        }

        protected highResolutionUpdate() : Promise<void> {
            this.traceInfo("start high res update");
            var previousStrokeState = this.strokeState;
            return new Promise((resolve,reject)=>{
                this.newCsafeBuffer()
                .getStrokeState({
                    onDataReceived: (strokeState : ergometer.StrokeState) =>{
                        // Update the stroke phase.
                        this.newStrokeState(strokeState);
                        
                    }
                })
                
                .send()
                .then(()=>{  //send returns a promise
                    this.traceInfo("end high res update");
                    if (this.strokeState != previousStrokeState)
                    {	
                        // If this is the dwell, complete the power curve.
                        //if (_previousStrokePhase == StrokePhase_Drive)
                        var now= new Date().getTime();
                        var doPowerCurveUpdate=this.strokeState == StrokeState.recoveryState;
                        if (  doPowerCurveUpdate||
                            this._lastLowResUpdate==null ||
                            (!this.isWaiting && (now-this._lastLowResUpdate)>WAIT_TIME_LOW_RES ))
                        {   
                            this._lastLowResUpdate=now;
                            this.traceInfo("Start low res update");
                            this.lowResolutionUpdate().then(()=>{
                                if (doPowerCurveUpdate && this.powerCurveEvent.count>0) {
                                    this.traceInfo("start power curveupdate");
                                    this.handlePowerCurve().then(()=>{
                                        this.traceInfo("end power curve and end low res update");
                                        this.traceInfo("resolve high");
                                        resolve()
                                    }).catch(reject); 
                                }
                                else {
                                    this.traceInfo("end low res update");
                                    this.traceInfo("resolve high");
                                    resolve();
                                }
                                   	
                            }).catch(reject);	
                            				
                        }
                        else { 
                            this.traceInfo("resolve high");
                            resolve();
                            
                        }
                    }
                    else { 
                        this.traceInfo("resolve high");
                        resolve();  
                    }
                })
                .catch(reject);
            })
            
            
        }
        private handlePowerCurve() : Promise<void>{
            return this.newCsafeBuffer()
                .getPowerCurve({
                    onDataReceived: (curve : number[]) =>{
                        this.powerCurveEvent.pub(curve);
                        this._powerCurve=curve;
                    }
                })
                .send();
        }

        protected connected() {
            super.connected();
            //when connected start monitoring after all is handled
            setTimeout(()=>{
                this.autoUpdate();
            },500);
            
        }
        private _autoUpdating = false;
        
        private listeningToEvents() {
            return 
        }
        protected autoUpdate(first=true) {
            
            this.traceInfo("auto update :"+first);
            //check on start if any one is listening, if not then
            //do not start the auto updating llop
            if (first && (this.strokeStateEvent.count==0 && 
                this.trainingDataEvent.count==0 &&
                this.strokeStateEvent.count==0))  return;
            
                //preventing starting update twice 
            //and stop when not connected any more
            if (this.connectionState==MonitorConnectionState.readyForCommunication
                && (!first || !this._autoUpdating)) {
              
              this._autoUpdating=true;
              //do not update while an csafe read write action is active
              //it is possible but you can get unexpected results because it may
              //change the order of things
             
                //ensure that allways an next update is called
            try {
                
                this.update().then(()=>{                
                    this.nextAutoUpdate();
                }).catch(error=>{
                    this.handleError(error);  
                    this.nextAutoUpdate();
                });
            } catch (error) {
                this.handleError(error);
                this.nextAutoUpdate();
            }
              
           }
           else {
            this.traceInfo("no auto update")
             this._autoUpdating=false;
           }
        }
        protected isWaiting() : boolean{
            const waitingStates= [WorkoutState.waitToBegin,
                WorkoutState.workoutEnd,
                WorkoutState.terminate,
                WorkoutState.workoutLogged,
                WorkoutState.rearm];
            return (this.strokeState== StrokeState.waitingForWheelToReachMinSpeedState)
            && waitingStates.indexOf(this.trainingData.workoutState)>=0;
        }
        protected nextAutoUpdate() {
            this.traceInfo("nextAutoUpdate");
            var waitTime=this.isWaiting()?WAIT_TIME_INIT:WAIT_TIME_MEASURING;
            if (this.connectionState==MonitorConnectionState.readyForCommunication) {
                setTimeout(()=>{this.autoUpdate(false)},waitTime);
            }
            else this._autoUpdating=false;
        }

        protected update() : Promise<void> {
            return new Promise((resolve,reject)=>{
                this.highResolutionUpdate().then(()=>{
                    var currenttime = new Date().getTime();
               
                    var diff = currenttime- this._lastTrainingTime; //note _lastTraingTime is initialized in trainingDataUpdate, which is called in the begining
                    
                    //when work out is buzy update every second, before update every 200 ms
                    if ( ( this.trainingData.workoutState!=WorkoutState.workoutRow && diff>200) ||
                        ( this.trainingData.workoutState==WorkoutState.workoutRow && diff>1000) ) {
                            this.traceInfo("start training update")
                            this.trainingDataUpdate().then(
                                ()=>{
                                    this.traceInfo("resolved training update")
                                    resolve();
                                },reject);
                        }
                        
                    else resolve();
                }).catch(reject);
            })
        }
        
        private _startPhaseTime : number =0;

        protected calcStrokeStateDuration() : number {
            var duration=0;
            
            if (this.strokeState == StrokeState.recoveryState ||
                this.strokeState  == StrokeState.drivingState) 
            {
                var endPhase =  new Date().getTime();
                duration = endPhase - this._startPhaseTime;
                this._startPhaseTime = endPhase;
            }
            if (this.strokeState == StrokeState.waitingForWheelToAccelerateState ||
                this.strokeState == StrokeState.waitingForWheelToReachMinSpeedState) {
                   this._startPhaseTime= new Date().getTime()
            }
            return duration;
        }

        protected lowResolutionUpdate() : Promise<void> {
        

            return this.newCsafeBuffer()
            .getDragFactor({
                onDataReceived: (value : number) => {
                    this.strokeData.dragFactor=value;
                }
            })
            .getWorkDistance({
                onDataReceived: (value : number) => {
                    this.strokeData.workDistance=value;
                }
            })
            /*.getWork({onDataReceived: (value) => {		
                 this.strokeData.time=value;
            }})*/
            .getPace({
                onDataReceived: (pace : number) => {
                    var caloriesPerHour=0;
                    var paced = pace/1000.0; // formular needs pace in sec/m (not sec/km)
                    if (pace>0) {
                        //get cal/hr: Calories/Hr = (((2.8 / ( pace * pace * pace )) * ( 4.0 * 0.8604)) + 300.0)
                        var paced = pace/1000.0; // formular needs pace in sec/m (not sec/km)
                    caloriesPerHour = Math.round(( (2.8 / (paced*paced*paced) ) * ( 4.0 * 0.8604) ) + 300.0) ;
                    }
                    this.strokeData.caloriesPerHour=caloriesPerHour;
                    // get pace in seconds / 500m           
                    var fPace = pace / 2.0;
                    this.strokeData.splitTime= fPace*1000;//from seconds to ms
                }                 
            })
            .getCalories({
                onDataReceived: (value : number) => { 		
                    this.strokeData.totCalories=value;
                }
                
            })
            .getCadence({
                onDataReceived: (value : number) => {
 		
                    if ( value > 0)
                    {                        
                        this._nSPM += value;
                        this._nSPMReads++;
                        
                        this.strokeData.strokesPerMinute = value;
                        this.strokeData.strokesPerMinuteAverage = this._nSPM / this._nSPMReads;
                    }
                }
            })
            .getPower({
                onDataReceived: (value : number) => { 		
                    this.strokeData.power=value;
                }
                
            })
            .getWorkTime({
                onDataReceived: (value : number) => { 		
                    this.strokeData.workTime=value;
                }
                
            })
            .getHorizontal({
                onDataReceived: (value : number) => {
                    this.strokeData.distance=value;
                }
                
            })
            .getHeartRate({
                onDataReceived: (value : number) => {		
                    this.strokeData.heartRate=value;                   
                }
                
            })
            .send()
            .then(()=>{
                /*console.log({
                    workTime:this.strokeData.workTime,
                    distance:this.strokeData.distance ,
                    workDistance: this.strokeData.workDistance

                });*/
                this.traceInfo("after low res update");
                this.strokeDataEvent.pub(this.strokeData);
            });
        }
        

        protected newStrokeState(state : StrokeState) {
            if (state!=this.strokeState) {
                var oldState=this.strokeState;
                this._strokeState=state;
                var duration = this.calcStrokeStateDuration();
                
                this.strokeStateEvent.pub(oldState,state,duration);
            }
        }

        protected trainingDataUpdate() : Promise<void>{
            this._lastTrainingTime= new Date().getTime();
            
            var changed = false;
            var strokeDataChanged =false;
            var actualDistance=0;
            var actualTime=0;
            var duration=0;
            var distance=0;
            return this.newCsafeBuffer()             
                .getWorkoutType(
                    {onDataReceived: (value) => {
                        if (this.trainingData.workoutType!=value)	{
                            this.trainingData.workoutType=value;
                            changed=true;
                        }	
                        
                    }})
                .getWorkoutState(
                        {onDataReceived: (value) => {		
                            if (this.trainingData.workoutState!=value)	{
                                this.trainingData.workoutState=value;
                                changed=true;
                            }
                        }})
                .getWorkoutIntervalCount(
                        {onDataReceived: (value) => {		
                            if (this.trainingData.workoutIntervalCount!=value)	{
                                this.trainingData.workoutIntervalCount=value;
                                changed=true;
                            }
                        }})    
                .getWorkoutIntervalType(
                    {onDataReceived: (value) => {		
                        if (this.trainingData.intervalType!=value)	{
                            this.trainingData.intervalType=value;
                            changed=true;
                        }
                    }})
                .getWorkoutIntervalRestTime(
                    {onDataReceived: (value) => {		
                        if (this.trainingData.restTime!=value)	{
                            this.trainingData.restTime=value;
                            changed=true;
                        }
                    }})
                .getWorkTime({onDataReceived: (value) => {		
                    duration=value;
                }})
                .getWorkDistance({onDataReceived: (value) => {		
                    distance=value;
                }})
                .getWork({onDataReceived: (value) => {		
                    actualTime=value;
                    
                }})
                .getHorizontal({onDataReceived: (value) => {		
                    actualDistance=value;
                }})                       
                .send()
                .then(()=>{
                   /* console.log({
                        duration:duration,
                        distance:distance,
                        actualTime:actualTime,
                        actualDistance:actualDistance,
                        workoutState:this.trainingData.workoutState
                    });*/
                    //total time and distance can be changed because the rower is rowing.
                    //the work time and work distance should be 0 for initial change
                    if ( this.strokeState<=StrokeState.waitingForWheelToAccelerateState && 
                        actualDistance==0 ) { 
                        
                        //we are here just before the rower starts, if there are still values
                        //of the previous race, then reset
                        if (this._nSPM!=0) {
                            this.resetStartRowing();
                            strokeDataChanged=true;
                        }
                            
                        var durationRound = Math.round(duration);
                        
                        if (this.trainingData.duration!=durationRound) 
                        {
                            this.trainingData.duration=durationRound;
                            changed = true;
                        }
                        var distanceRound = Math.round(distance);
                        if (this.trainingData.distance!=distanceRound) 
                        {
                            this.trainingData.distance=distanceRound;
                            changed = true;
                        }
                    }
                    //if (_trainingData.workoutState==wsWorkoutLogged) {
                    //    _trainingData.endDuration=_trainingData.endDuration;
                    //}
                    if (this.trainingData.workoutState==WorkoutState.workoutLogged && 
                        ( (this.trainingData.endDuration===0) &&
                           (this.trainingData.endDistance===0)) ) {
                        //otherwise the work time does not reflect the last time and distance
                        if ( this.trainingData.workoutType>=WorkoutType.fixedDistanceNoAplits &&
                            this.trainingData.workoutType<=WorkoutType.fixedTimeAplits ) {
                            
                            if (this.trainingData.duration && this.trainingData.duration>0) { //doing an fixed time
                                this.strokeData.workTime = this.trainingData.duration;
                                this.strokeData.workDistance = distance;
                                //this.strokeData.time=duration;
                                this.strokeData.distance = distance;
                                this.trainingData.endDistance= distance;
                                this.trainingData.endDuration=this.trainingData.duration;
                                //console.log("Fixed time Send stroke state and training");
                            }
                            else if (this.trainingData.distance>0) { //doing a fixed distance
                                this.strokeData.workTime = duration;
                                this.strokeData.workDistance = 0;
                                //this.strokeData.time=duration;
                                this.strokeData.distance = distance;
                                this.trainingData.endDistance= this.trainingData.distance;
                                this.trainingData.endDuration=duration;
                                //console.log("Fixed distance Send stroke state and training");
                            }
                            strokeDataChanged=true;//send the updated last end time/ duration to the server
                        }
                        changed= true;
                    }
                    if (this.trainingData.workoutState!=WorkoutState.workoutLogged &&
                        ( this.trainingData.endDistance || this.trainingData.endDistance!=0 ||  
                            this.trainingData.endDuration!=0 || this.trainingData.endDuration)) {
                            this.trainingData.endDistance=0;
                            this.trainingData.endDuration=0;
                        changed=true;
                    }
                    if (strokeDataChanged) this._strokeDataEvent.pub(this.strokeData);
                    if (changed) this.trainingDataEvent.pub(this.trainingData);
                    
                });
        }
        private resetStartRowing() {
            //reset the averages
            this._nSPM=0;
            this._nSPMReads=0;
            
            this.strokeData.dragFactor =0;
            //this.strokeData.workDistance =0 ; 
            //this.strokeData.workTime =0;
            this.strokeData.splitTime=0;
            this.strokeData.power =0;
            this.strokeData.strokesPerMinuteAverage =0;
            this.strokeData.strokesPerMinute =0;
            this.strokeData.distance =0;
            //this.strokeData.time =0;
            this.strokeData.totCalories =0; // accumulated calories burned  CSAFE_GETCALORIES_CMD
            this.strokeData.caloriesPerHour =0;  // calories/Hr derived from pace (GETPACE)
            this.strokeData.heartRate =0;
        }
        
    }

}