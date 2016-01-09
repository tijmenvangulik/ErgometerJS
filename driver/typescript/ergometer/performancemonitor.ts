/**
 * Concept 2 ergometer Performance Monitor for Cordova
 *
 * This will will work with the PM5
 *
 * Created by tijmen on 01-06-15.
 * License:
 *
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
/// <reference path="../typings/evothings/ble.d.ts"/>
/// <reference path="../typings/evothings/easyble.d.ts"/>
/// <reference path="../typings/evothings/evothings.d.ts"/>
/// <reference path="../typings/evothings/util.d.ts"/>
/// <reference path="utils.ts"/>
/// <reference path="pubsub.ts"/>

module ergometer {

    export interface RowingGeneralStatusEvent extends pubSub.ISubscription {
        (data : RowingGeneralStatus) : void;
    }
    export interface RowingAdditionalStatus1Event extends pubSub.ISubscription {
        (data : RowingAdditionalStatus1) : void;
    }
    export interface RowingAdditionalStatus2Event extends pubSub.ISubscription {
        (data : RowingAdditionalStatus2) : void;
    }
    export interface RowingStrokeDataEvent extends pubSub.ISubscription {
        (data : RowingStrokeData) : void;
    }
    export interface RowingAdditionalStrokeDataEvent extends pubSub.ISubscription {
        (data : RowingAdditionalStrokeData) : void;
    }
    export interface RowingSplitIntervalDataEvent extends pubSub.ISubscription {
        (data : RowingSplitIntervalData) : void;
    }
    export interface RowingAdditionalSplitIntervalDataEvent extends pubSub.ISubscription {
        (data : RowingAdditionalSplitIntervalData) : void;
    }
    export interface WorkoutSummaryDataEvent extends pubSub.ISubscription {
        (data : WorkoutSummaryData) : void;
    }
    export interface AdditionalWorkoutSummaryDataEvent extends pubSub.ISubscription {
        (data : AdditionalWorkoutSummaryData) : void;
    }
    export interface AdditionalWorkoutSummaryData2Event extends pubSub.ISubscription {
        (data : AdditionalWorkoutSummaryData2) : void;
    }
    export interface HeartRateBeltInformationEvent extends pubSub.ISubscription {
        (data : HeartRateBeltInformation) : void;
    }

    export enum MonitorConnectionState {inactive,deviceReady,scanning,connecting,connected,servicesFound}

    export enum LogLevel {error,info,debug,trace};

    export interface LogEvent extends pubSub.ISubscription {
        (text : string,logLevel : LogLevel) : void;
    }
    export interface ConnectionStateChangedEvent extends pubSub.ISubscription {
        (oldState : MonitorConnectionState,newState : MonitorConnectionState) : void;
    }

    export interface DeviceInfo {
        //values filled when the device is found

        connected : boolean;
        name : string;
        address : string;
        quality : number;
        //values filed when the device is connected:
        serial? : string;
        hardwareRevision? : string;
        firmwareRevision? : string;
        manufacturer? : string;
        /** @internal */
        _internalDevice : evothings.easyble.EasyBLEDevice; //for internal usage when you use this I can not guarantee compatibility
    }

    /**
     *
     * Usage:
     *
     * Create this class to acess the performance data
     *   var performanceMonitor= new ergometer.PerformanceMonitor();
     *
     * after this connect to the events to get data
     *   performanceMonitor.rowingGeneralStatusEvent.sub(this,this.onRowingGeneralStatus);
     * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
     * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
     * the documentation in the properties You must set the multi plex property before connecting
     *   performanceMonitor.multiplex=true;
     *
     * to start the connection first start scanning for a device,
     * you should call when the cordova deviceready event is called (or later)
     *   performanceMonitor.startScan((device : ergometer.DeviceInfo) : boolean => {
     *      //return true when you want to connect to the device
     *       return device.name=='My device name';
     *   });
     *  to connect at at a later time
     *    performanceMonitor.connectToDevice('my device name');
     *  the devices which where found during the scan are collected in
     *    performanceMonitor.devices
     *  when you connect to a device the scan is stopped, when you want to stop the scan earlier you need to call
     *    performanceMonitor.stopScan
     *
     */
    export class PerformanceMonitor {

        private _device:evothings.easyble.EasyBLEDevice;
        private _connectionState : MonitorConnectionState = MonitorConnectionState.inactive;

        //events
        private _logEvent= new pubSub.Event<LogEvent>();
        private _connectionStateChangedEvent = new pubSub.Event<ConnectionStateChangedEvent>();

        
        //ergomter data events
        private _rowingGeneralStatusEvent: pubSub.Event<RowingGeneralStatusEvent>;
        private _rowingAdditionalStatus1Event: pubSub.Event<RowingAdditionalStatus1Event>;
        private _rowingAdditionalStatus2Event: pubSub.Event<RowingAdditionalStatus2Event>;
        private _rowingStrokeDataEvent: pubSub.Event<RowingStrokeDataEvent>;
        private _rowingAdditionalStrokeDataEvent: pubSub.Event<RowingAdditionalStrokeDataEvent>;
        private _rowingSplitIntervalDataEvent: pubSub.Event<RowingSplitIntervalDataEvent>;
        private _rowingAdditionalSplitIntervalDataEvent: pubSub.Event<RowingAdditionalSplitIntervalDataEvent>;
        private _workoutSummaryDataEvent: pubSub.Event<WorkoutSummaryDataEvent>;
        private _additionalWorkoutSummaryDataEvent: pubSub.Event<AdditionalWorkoutSummaryDataEvent>;
        private _additionalWorkoutSummaryData2Event: pubSub.Event<AdditionalWorkoutSummaryData2Event>;
        private _heartRateBeltInformationEvent: pubSub.Event<HeartRateBeltInformationEvent>;
        
        
        private _deviceInfo : DeviceInfo;

        private _rowingGeneralStatus : RowingGeneralStatus;
        private _rowingAdditionalStatus1 : RowingAdditionalStatus1;
        private _rowingAdditionalStatus2 : RowingAdditionalStatus2;
        private _rowingStrokeData : RowingStrokeData;
        private _rowingAdditionalStrokeData : RowingAdditionalStrokeData;
        private _rowingSplitIntervalData : RowingSplitIntervalData;
        private _rowingAdditionalSplitIntervalData : RowingAdditionalSplitIntervalData;
        private _workoutSummaryData : WorkoutSummaryData;
        private _additionalWorkoutSummaryData : AdditionalWorkoutSummaryData;
        private _additionalWorkoutSummaryData2 : AdditionalWorkoutSummaryData2;
        private _heartRateBeltInformation : HeartRateBeltInformation;
        private _devices : DeviceInfo[] =[];
        private _multiplex : boolean = false;
        private _multiplexSubscribeCount: number =0;
        private _sampleRate : SampleRate = SampleRate.rate500ms;
        private _autoReConnect : boolean = true;
        private _logLevel : LogLevel = LogLevel.error;

        /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @returns {LogLevel}
         */
        get logLevel():LogLevel {
            return this._logLevel;
        }

        /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @param value
         */
        set logLevel(value:LogLevel) {
            this._logLevel = value;
        }

        /**
         * when the connection is lost re-connect
         * @returns {boolean}
         */
        get autoReConnect():boolean {
            return this._autoReConnect;
        }

        /**
         *
         * when the connection is lost re-connect
         * @param value
         */
        set autoReConnect(value:boolean) {
            this._autoReConnect = value;
        }

        /**
         * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
         * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
         * the documentation in the properties You must set the multi plex property before connecting
         *
         * @returns {boolean}
         */
        public get multiplex():boolean {
            return this._multiplex;
        }

        /**
         * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
         * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
         * the documentation in the properties You must set the multi plex property before connecting
         * @param value
         */
        public set multiplex(value:boolean) {
            if (value != this._multiplex) {
                if (this.connectionState>=MonitorConnectionState.servicesFound)
                  throw "property multiplex can not be changed after the connection is made.";
                this._multiplex = value;

            }
        }

        /**
         * an array of of performance monitor devices which where found during the scan.
         * the array is sorted by connection quality (best on top)
         *
         * @returns {DeviceInfo[]}
         */
        public get devices():ergometer.DeviceInfo[] {
            return this._devices;
        }

        /**
         * The values of the last rowingGeneralStatus event
         *
         * @returns {RowingGeneralStatus}
         */
        public get rowingGeneralStatus():RowingGeneralStatus {
            return this._rowingGeneralStatus;
        }

        /**
         * The values of the last rowingAdditionalStatus1 event
         * @returns {RowingAdditionalStatus1}
         */
        public get rowingAdditionalStatus1():RowingAdditionalStatus1 {
            return this._rowingAdditionalStatus1;
        }

        /**
         * The values of the last RowingAdditionalStatus2 event
         * @returns {RowingAdditionalStatus2}
         */
        public get rowingAdditionalStatus2():RowingAdditionalStatus2 {
            return this._rowingAdditionalStatus2;
        }

        /**
         *  The values of the last rowingStrokeData event
         * @returns {RowingStrokeData}
         */
        public get rowingStrokeData():RowingStrokeData {
            return this._rowingStrokeData;
        }

        /**
         * The values of the last rowingAdditionalStrokeData event
         * @returns {RowingAdditionalStrokeData}
         */
        public get rowingAdditionalStrokeData():RowingAdditionalStrokeData {
            return this._rowingAdditionalStrokeData;
        }

        /**
         * The values of the last rowingSplitIntervalData event
         * @returns {RowingSplitIntervalData}
         */
        public get rowingSplitIntervalData():RowingSplitIntervalData {
            return this._rowingSplitIntervalData;
        }

        /**
         * The values of the last rowingAdditionalSplitIntervalData event
         * @returns {RowingAdditionalSplitIntervalData}
         */
        public get rowingAdditionalSplitIntervalData():RowingAdditionalSplitIntervalData {
            return this._rowingAdditionalSplitIntervalData;
        }

        /**
         * The values of the last workoutSummaryData event
         * @returns {WorkoutSummaryData}
         */
        public get workoutSummaryData():WorkoutSummaryData {
            return this._workoutSummaryData;
        }

        /**
         * The values of the last additionalWorkoutSummaryData event
         * @returns {AdditionalWorkoutSummaryData}
         */
        public get additionalWorkoutSummaryData():AdditionalWorkoutSummaryData {
            return this._additionalWorkoutSummaryData;
        }

        /**
         * The values of the last AdditionalWorkoutSummaryData2 event
         * @returns {AdditionalWorkoutSummaryData2}
         */
        public get additionalWorkoutSummaryData2():AdditionalWorkoutSummaryData2 {
            return this._additionalWorkoutSummaryData2;
        }

        /**
         * The values of the last heartRateBeltInformation event
         * @returns {HeartRateBeltInformation}
         */
        public get heartRateBeltInformation():HeartRateBeltInformation {
            return this._heartRateBeltInformation;
        }


        /**
         * read rowingGeneralStatus data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingGeneralStatusEvent>}
         */
        public get rowingGeneralStatusEvent(): pubSub.Event<RowingGeneralStatusEvent> {
            return this._rowingGeneralStatusEvent;
        }

        /**
         * read rowingGeneralStatus1 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus1Event>}
         */
        public get rowingAdditionalStatus1Event():pubSub.Event<RowingAdditionalStatus1Event> {
            return this._rowingAdditionalStatus1Event;
        }

        /**
         * read rowingAdditionalStatus2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus2Event>}
         */
        public get rowingAdditionalStatus2Event():pubSub.Event<RowingAdditionalStatus2Event> {
            return this._rowingAdditionalStatus2Event;
        }

        /**
         * read rowingStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingStrokeDataEvent>}
         */
        public get rowingStrokeDataEvent():pubSub.Event<RowingStrokeDataEvent> {
            return this._rowingStrokeDataEvent;
        }

        /**
         * read rowingAdditionalStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStrokeDataEvent>}
         */
        public get rowingAdditionalStrokeDataEvent():pubSub.Event<RowingAdditionalStrokeDataEvent> {
            return this._rowingAdditionalStrokeDataEvent;
        }

        /**
         * read rowingSplitIntervalDat data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingSplitIntervalDataEvent>}
         */
        public get rowingSplitIntervalDataEvent():pubSub.Event<RowingSplitIntervalDataEvent> {
            return this._rowingSplitIntervalDataEvent;
        }

        /**
         * read rowingAdditionalSplitIntervalData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalSplitIntervalDataEvent>}
         */
        public get rowingAdditionalSplitIntervalDataEvent():pubSub.Event<RowingAdditionalSplitIntervalDataEvent> {
            return this._rowingAdditionalSplitIntervalDataEvent;
        }

        /**
         * read workoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<WorkoutSummaryDataEvent>}
         */
        public get workoutSummaryDataEvent():pubSub.Event<WorkoutSummaryDataEvent> {
            return this._workoutSummaryDataEvent;
        }

        /**
         * read additionalWorkoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryDataEvent>}
         */
        public get additionalWorkoutSummaryDataEvent():pubSub.Event<AdditionalWorkoutSummaryDataEvent> {
            return this._additionalWorkoutSummaryDataEvent;
        }

        /**
         * read additionalWorkoutSummaryData2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryData2Event>}
         */
        public get additionalWorkoutSummaryData2Event():pubSub.Event<AdditionalWorkoutSummaryData2Event> {
            return this._additionalWorkoutSummaryData2Event;
        }

        /**
         * read heartRateBeltInformation data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<HeartRateBeltInformationEvent>}
         */
        public get heartRateBeltInformationEvent():pubSub.Event<HeartRateBeltInformationEvent> {
            return this._heartRateBeltInformationEvent;
        }

        /**
         * event which is called when the connection state is changed. For example this way you
         * can check if the device is disconnected.
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<ConnectionStateChangedEvent>}
         */
        public get connectionStateChangedEvent(): pubSub.Event<ConnectionStateChangedEvent> {
            return this._connectionStateChangedEvent;
        }
        /**
         * returns error and other log information. Some errors can only be received using the logEvent
         * @returns {pubSub.Event<LogEvent>}
         */
        public get logEvent(): pubSub.Event<LogEvent> {
            return this._logEvent;
        }

        /**
         * Get device information of the connected device.
         * @returns {DeviceInfo}
         */
        public get deviceInfo():ergometer.DeviceInfo {
            return this._deviceInfo;
        }

        /**
         * read the performance montitor sample rate. By default this is 500 ms
         * @returns {number}
         */
        public get sampleRate():SampleRate {
            return this._sampleRate;
        }

        /**
         * Change the performance monitor sample rate.
         * @param value
         */
        public set sampleRate(value:SampleRate) {
            if (value!=this._sampleRate) {
                try {
                    var dataView = new DataView(new ArrayBuffer(1));
                    dataView.setUint8(0,value);
                    this._device.writeCharacteristic(ble.ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC,dataView,
                        ()=>{this._sampleRate = value;},
                        (e)=>{this.handleError(e);});
                }
                catch(e) {
                    this.handleError(e);
                }
            }

        }

        /**
         * disconnect the current connected device
         */
        protected disconnect() {
            if (this.connectionState>=MonitorConnectionState.deviceReady)  {
                if (this._device)
                    this._device.close();
                this.connectionState=MonitorConnectionState.deviceReady
            }
        }

        /**
         * read the current connection state
         * @returns {MonitorConnectionState}
         */
        public get connectionState():MonitorConnectionState {
            return this._connectionState;
        }

        /**
         *
         * @param value
         */
        protected changeConnectionState(value : MonitorConnectionState) {
            if (this._connectionState!=value) {
                var oldValue=this._connectionState;
                this._connectionState=value;
                this.connectionStateChangedEvent.pub(oldValue,value);
            }
        }

        /**
         * To work with this class you will need to create it.
         */
        public constructor() {
            this.initialize();

        }

        /**
         *
         */
        protected enableMultiplexNotification() {
            if (this._multiplexSubscribeCount==0)
                this._device.enableNotification(ble.MULTIPLEXED_INFO_CHARACTERISIC,
                    (data:ArrayBuffer) => { this.handleDataCallbackMulti(data);},
                    this.handleError);
            this._multiplexSubscribeCount++;
        }

        /**
         *
         */
        protected disableMultiPlexNotification() {
            this._multiplexSubscribeCount--;
            if (this._multiplexSubscribeCount==0)
                this._device.disableNotification(ble.MULTIPLEXED_INFO_CHARACTERISIC, ()=> {
                }, this.handleError);
        }

        /**
         *
         */
        protected enableDisableNotification() {
            if (this.connectionState>=MonitorConnectionState.servicesFound) {
                if (this.rowingGeneralStatusEvent.count > 0) {
                    if (this.multiplex) {
                       this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.ROWING_STATUS_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleRowingGeneralStatus);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.ROWING_STATUS_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }

                if (this.rowingAdditionalStatus1Event.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.EXTRA_STATUS1_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleRowingAdditionalStatus1);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.EXTRA_STATUS1_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }

                if (this.rowingAdditionalStatus2Event.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.EXTRA_STATUS2_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleRowingAdditionalStatus2);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.EXTRA_STATUS2_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }

                if (this.rowingStrokeDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.STROKE_DATA_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleRowingStrokeData);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.STROKE_DATA_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }

                if (this.rowingAdditionalStrokeDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.EXTRA_STROKE_DATA_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleRowingAdditionalStrokeData);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.EXTRA_STROKE_DATA_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }

                if (this.rowingSplitIntervalDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.SPLIT_INTERVAL_DATA_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleRowingSplitIntervalData);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.SPLIT_INTERVAL_DATA_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }

                if (this.rowingAdditionalSplitIntervalDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleRowingAdditionalSplitIntervalData);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }

                if (this.workoutSummaryDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.ROWING_SUMMARY_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleWorkoutSummaryData);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.ROWING_SUMMARY_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }

                if (this.additionalWorkoutSummaryDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.EXTRA_ROWING_SUMMARY_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleAdditionalWorkoutSummaryData);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.EXTRA_ROWING_SUMMARY_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }
                if (this.additionalWorkoutSummaryData2Event.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    //this data is only available for multi ples
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                }

                if (this.heartRateBeltInformationEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ble.HEART_RATE_BELT_INFO_CHARACTERISIC,
                            (data:ArrayBuffer) => {
                                this.handleDataCallback(data, this.handleHeartRateBeltInformation);
                            },
                            this.handleError);
                    }
                }
                else {
                    if (this.multiplex) this.disableMultiPlexNotification();
                    else this._device.disableNotification(ble.HEART_RATE_BELT_INFO_CHARACTERISIC, ()=> {
                    }, this.handleError);
                }

            }
        }

        /**
         *
         */
        protected initialize() {
            /*document.addEventListener(
                'deviceready',
                 ()=> {
                     evothings.scriptsLoaded(()=>{
                         this.onDeviceReady();})},
                false);   */

            var enableDisableFunc = ()=>{this.enableDisableNotification()};
            this._rowingGeneralStatusEvent = new pubSub.Event<RowingGeneralStatusEvent>();
            this.rowingGeneralStatusEvent.registerChangedEvent(enableDisableFunc);

            this._rowingAdditionalStatus1Event = new pubSub.Event<RowingAdditionalStatus1Event>();
            this.rowingAdditionalStatus1Event.registerChangedEvent(enableDisableFunc);

            this._rowingAdditionalStatus2Event = new pubSub.Event<RowingAdditionalStatus2Event>();
            this.rowingAdditionalStatus2Event.registerChangedEvent(enableDisableFunc);

            this._rowingStrokeDataEvent = new pubSub.Event<RowingStrokeDataEvent>();
            this.rowingStrokeDataEvent.registerChangedEvent(enableDisableFunc);

            this._rowingAdditionalStrokeDataEvent = new pubSub.Event<RowingAdditionalStrokeDataEvent>();
            this.rowingAdditionalStrokeDataEvent.registerChangedEvent(enableDisableFunc);

            this._rowingSplitIntervalDataEvent = new pubSub.Event<RowingSplitIntervalDataEvent>();
            this.rowingSplitIntervalDataEvent.registerChangedEvent(enableDisableFunc);

            this._rowingAdditionalSplitIntervalDataEvent = new pubSub.Event<RowingAdditionalSplitIntervalDataEvent>();
            this.rowingAdditionalSplitIntervalDataEvent.registerChangedEvent(enableDisableFunc);

            this._workoutSummaryDataEvent = new pubSub.Event<WorkoutSummaryDataEvent>();
            this.workoutSummaryDataEvent.registerChangedEvent(enableDisableFunc);

            this._additionalWorkoutSummaryDataEvent = new pubSub.Event<AdditionalWorkoutSummaryDataEvent>();
            this.additionalWorkoutSummaryDataEvent.registerChangedEvent(enableDisableFunc);

            this._additionalWorkoutSummaryData2Event = new pubSub.Event<AdditionalWorkoutSummaryData2Event>();
            this.additionalWorkoutSummaryData2Event.registerChangedEvent(enableDisableFunc);

            this._heartRateBeltInformationEvent = new pubSub.Event<HeartRateBeltInformationEvent>();
            this.heartRateBeltInformationEvent.registerChangedEvent(enableDisableFunc);

        }

        /**
         * When low level initialization complete, this function is called.
         */
        /*
        protected onDeviceReady() {
            // Report status.
           this.changeConnectionState( MonitorConnectionState.deviceReady);
            if (this._active)
              this.startConnection();

        }
        */

        /**
         * Print debug info to console and application UI.
         * @param info
         */
        protected traceInfo(info : string) {
            if (this.logLevel>=LogLevel.trace)
                this.logEvent.pub(info,LogLevel.trace);
        }

        /**
         *
         * @param info
         */
        protected debugInfo(info : string) {
            if (this.logLevel>=LogLevel.debug)
                this.logEvent.pub(info,LogLevel.debug);
        }

        /**
         *
         * @param info
         */
        protected showInfo(info : string) {
            if (this.logLevel>=LogLevel.info)
                this.logEvent.pub(info,LogLevel.info);
        }

        /**
         *
         * @param error
         */
        protected handleError(error:string) {
            if (this.logLevel>=LogLevel.error)
                this.logEvent.pub(error,LogLevel.error);
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
        protected stopScan() {
            if (this.connectionState==MonitorConnectionState.scanning) {
                evothings.easyble.stopScan();            }

        }

        /**
         * Scan for device use the deviceFound to connect .
         * @param deviceFound
         */
        public startScan(deviceFound : (device : DeviceInfo)=>boolean ) {
            this._devices=[];
            // Save it for next time we use the this.
            //localStorage.setItem('deviceName', this._deviceName);

            // Call stop before you start, just in case something else is running.
            this.stopScan();
            this.changeConnectionState(MonitorConnectionState.scanning);

            evothings.easyble.closeConnectedDevices();

            // Only report devices once.
            evothings.easyble.reportDeviceOnce(true);


            evothings.easyble.startScan(
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
                     if ( device.name.match(/PM\d \d*/g) ) {

                        this.showInfo('Status: DeviceInfo found: ' + device.name);
                        var deviceInfo : DeviceInfo={
                            connected:false,
                            _internalDevice: device,
                            name:device.name,
                            address:device.address,
                            quality: 2* (device.rssi + 100) };
                        this.addDevice(deviceInfo);
                        if ( deviceFound(deviceInfo)) {
                            this.connectToDevice(deviceInfo.name);
                        }

                    }
                },
                 (error)=> {
                    this.showInfo('Error: startScan: ' + error);
                });
            this.showInfo('Status: Scanning...');
        }


        /**
         * connect to a specific device. This should be a PM5 device which is found by the startScan. You can
         * only call this function after startScan is called. Connection to a device will stop the scan.
         * @param deviceName
         */
        public connectToDevice(deviceName : string) {
            this.showInfo('Status: Connecting...');
            this.stopScan();
            this.changeConnectionState(MonitorConnectionState.connecting);
            var deviceInfo = this.findDevice(deviceName);
            if (!deviceInfo) throw `Device ${deviceName} not found`;
            this._deviceInfo =deviceInfo;
            deviceInfo._internalDevice.connect(
                 (device)=> {
                    this.changeConnectionState(MonitorConnectionState.connected);
                    this._device = device;
                    this.showInfo('Status: Connected');
                    this.readServices(this._device);
                },
                (errorCode)=> {
                    var deviceName = this.deviceInfo.name;
                    this.changeConnectionState(MonitorConnectionState.deviceReady);
                    if (errorCode=="EASYBLE_ERROR_DISCONNECTED") {
                        this.showInfo('Disconnected');
                        if (this.autoReConnect) {
                            this.startScan((device : DeviceInfo)=>{
                                return device.name==deviceName});
                        }
                    }
                    else this.handleError(errorCode);

                });
        }

        /**
         *  Dump all information on named device to the debug info
         *  this is called when the log level is set to trace
         * @param device
         */
        protected readServices(device) {
            // Read all services.
            device.readServices(
                null,
                 () =>{
                     this.debugInfo("readServices success");
                     if (this.logLevel>LogLevel.trace)
                        this.logAllServices(this._device);
                     this.readPheripheralInfo(()=>{
                         // Debug logging of all services, characteristics and descriptors
                         // reported by the BLE board.
                         this.deviceConnected(this._device);
                     });

                },
                 (error) =>{
                     this.handleError('Error: Failed to read services: ' + error);
                     this.changeConnectionState(MonitorConnectionState.deviceReady);
                });
        }

        /**
         *
         * @param UUID
         * @param readValue
         */
        protected readStringCharacteristic(UUID : string,readValue : (value : string) =>void ) {
            try {
                this._device.readCharacteristic(UUID,(data:ArrayBuffer)=>{
                    readValue( utils.bufferToString(data));
                },(e)=>{this.handleError(e);readValue("");});
            }
            catch(e) {
                readValue("");
                this.handleError(e);
            }

        }

        /**
         *
         * @param done
         */
        protected readSampleRate(done : ()=>void ) {
            //allways call done, don not let get errors into the way
            try {
                this._device.readCharacteristic(ble.ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC,(data:ArrayBuffer)=>{
                    var view = new DataView(data);
                    this._sampleRate= view.getUint8(0);
                    done();
                },(e)=>{this.handleError(e);done();});
            }
            catch(e) {
                this.handleError(e);
                done();
            }


        }

        /**
         *
         * @param done
         */
        protected readPheripheralInfo(done : ()=>void) {

            //todo: should implement is a less tricky way. is the readCharacteristic really none blocking?, it not it can be written different
            this.readStringCharacteristic(ble.SERIALNUMBER_CHARACTERISTIC, (value : string)=> {
                    this._deviceInfo.serial=value;
                    this.readStringCharacteristic(ble.HWREVISION_CHARACTERISIC, (value : string)=> {
                        this._deviceInfo.hardwareRevision=value;
                        this.readStringCharacteristic(ble.FWREVISION_CHARACTERISIC, (value : string)=> {
                            this._deviceInfo.firmwareRevision=value;
                            this.readStringCharacteristic(ble.MANUFNAME_CHARACTERISIC, (value : string)=> {
                                this._deviceInfo.manufacturer=value;
                                this._deviceInfo.connected=true;
                                this.readSampleRate(()=>{done();})
                            });
                        });
                    });
                });
        }


        /**
         *   Debug logging of found services, characteristics and descriptors.
         * @param device
         */
        protected logAllServices(device) {
            // Here we simply print found services, characteristics,
            // and descriptors to the debug console in Evothings Workbench.

            // Notice that the fields prefixed with "__" are arrays that
            // contain services, characteristics and notifications found
            // in the call to device.readServices().

            // Print all services.
            this.traceInfo('Found services:');
            for (var serviceUUID in device.__services) {
                var service = device.__services[serviceUUID];
                this.traceInfo('  service: ' + service.uuid);

                // Print all characteristics for service.
                for (var characteristicUUID in service.__characteristics) {
                    var characteristic = service.__characteristics[characteristicUUID];
                    this.traceInfo('    characteristic: ' + characteristic.uuid);

                    // Print all descriptors for characteristic.
                    for (var descriptorUUID in characteristic.__descriptors) {
                        var descriptor = characteristic.__descriptors[descriptorUUID];
                        this.traceInfo('      descriptor: ' + descriptor.uuid);
                    }
                }
            }
        }


        /**
         *
         * @param data
         */
        protected handleRowingGeneralStatus(data:DataView) {
            var parsed:RowingGeneralStatus = {
                elapsedTime: utils.getUint24(data, ble.PM_Rowing_Status_BLE_Payload.ELAPSED_TIME_LO) * 10, //in mili seconds
                distance: utils.getUint24(data, ble.PM_Rowing_Status_BLE_Payload.DISTANCE_LO) / 10,
                workoutType: data.getUint8(ble.PM_Rowing_Status_BLE_Payload.WORKOUT_TYPE),
                intervalType: data.getUint8(ble.PM_Rowing_Status_BLE_Payload.INTERVAL_TYPE),
                workoutState: data.getUint8(ble.PM_Rowing_Status_BLE_Payload.WORKOUT_STATE),
                rowingState: data.getUint8(ble.PM_Rowing_Status_BLE_Payload.ROWING_STATE),
                strokeState: data.getUint8(ble.PM_Rowing_Status_BLE_Payload.STROKE_STATE),
                totalWorkDistance:utils.getUint24(data, ble.PM_Rowing_Status_BLE_Payload.TOTAL_WORK_DISTANCE_LO),
                workoutDuration:utils.getUint24(data, ble.PM_Rowing_Status_BLE_Payload.WORKOUT_DURATION_LO),
                workoutDurationType :data.getUint8(ble.PM_Rowing_Status_BLE_Payload.WORKOUT_DURATION_TYPE),
                dragFactor : data.getUint8(ble.PM_Rowing_Status_BLE_Payload.DRAG_FACTOR),
            };
            if (parsed.workoutDurationType==WorkoutDurationType.timeDuration)
                parsed.workoutDuration=parsed.workoutDuration*10;//in mili seconds
            if (JSON.stringify(this.rowingGeneralStatus) !== JSON.stringify(parsed)) {
                this._rowingGeneralStatus=parsed;
                this.rowingGeneralStatusEvent.pub(parsed);

            }


        }

        /**
         *
         * @param data
         */
        protected handleRowingAdditionalStatus1(data:DataView) {
            var parsed:RowingAdditionalStatus1 = {
                elapsedTime: utils.getUint24(data, ble.PM_Extra_Status1_BLE_Payload.ELAPSED_TIME_LO)* 10, //in mili seconds
                speed : data.getUint16(ble.PM_Extra_Status1_BLE_Payload.SPEED_LO)/1000,  // m/s
                strokeRate : data.getUint8(ble.PM_Extra_Status1_BLE_Payload.STROKE_RATE),
                heartRate : utils.valueToNullValue(data.getUint8(ble.PM_Extra_Status1_BLE_Payload.HEARTRATE),255),
                currentPace : data.getUint16(ble.PM_Extra_Status1_BLE_Payload.CURRENT_PACE_LO)/100,
                averagePace : data.getUint16(ble.PM_Extra_Status1_BLE_Payload.AVG_PACE_LO)/100,
                restDistance : data.getUint16(ble.PM_Extra_Status1_BLE_Payload.REST_DISTANCE_LO),
                restTime : utils.getUint24(data,ble.PM_Extra_Status1_BLE_Payload.REST_TIME_LO)*10, //mili seconds
                averagePower : null
            };
            if (data.byteLength==ble.PM_Mux_Extra_Status1_BLE_Payload.BLE_PAYLOAD_SIZE)
                parsed.averagePower=data.getUint16(ble.PM_Mux_Extra_Status1_BLE_Payload.AVG_POWER_LO);

            if ( JSON.stringify(this.rowingAdditionalStatus1) !== JSON.stringify(parsed)) {
                this._rowingAdditionalStatus1=parsed;
                this.rowingAdditionalStatus1Event.pub(parsed);
            }
        }

        /**
         *
         * @param data
         */
        protected handleRowingAdditionalStatus2(data:DataView) {
            var parsed:RowingAdditionalStatus2;
            if (data.byteLength == ble.PM_Extra_Status2_BLE_Payload.BLE_PAYLOAD_SIZE) {
                parsed = {
                    elapsedTime: utils.getUint24(data, ble.PM_Extra_Status2_BLE_Payload.ELAPSED_TIME_LO) * 10, //in mili seconds
                    intervalCount: data.getUint8(ble.PM_Extra_Status2_BLE_Payload.INTERVAL_COUNT),
                    averagePower: data.getUint16(ble.PM_Extra_Status2_BLE_Payload.AVG_POWER_LO),
                    totalCalories: data.getUint16(ble.PM_Extra_Status2_BLE_Payload.TOTAL_CALORIES_LO),
                    splitAveragePace: data.getUint16(ble.PM_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_PACE_LO) * 10,// ms,
                    splitAveragePower: data.getUint16(ble.PM_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_POWER_LO),//watt
                    splitAverageCalories: data.getUint16(ble.PM_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_CALORIES_LO), // cal/hour
                    lastSplitTime: data.getUint16(ble.PM_Extra_Status2_BLE_Payload.LAST_SPLIT_TIME_LO) *100, //the doc 0.1 factor is this right?
                    lastSplitDistance: utils.getUint24(data, ble.PM_Extra_Status2_BLE_Payload.LAST_SPLIT_DISTANCE_LO)
                };
            }
            else {
                parsed = {
                    elapsedTime: utils.getUint24(data, ble.PM_Mux_Extra_Status2_BLE_Payload.ELAPSED_TIME_LO) * 10, //in mili seconds
                    intervalCount: data.getUint8(ble.PM_Mux_Extra_Status2_BLE_Payload.INTERVAL_COUNT),
                    averagePower: null,
                    totalCalories: data.getUint16(ble.PM_Mux_Extra_Status2_BLE_Payload.TOTAL_CALORIES_LO),
                    splitAveragePace: data.getUint16(ble.PM_Mux_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_PACE_LO)* 10, //ms,
                    splitAveragePower: data.getUint16(ble.PM_Mux_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_POWER_LO),//watt
                    splitAverageCalories: data.getUint16(ble.PM_Mux_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_CALORIES_LO), // cal/hour
                    lastSplitTime: data.getUint16(ble.PM_Mux_Extra_Status2_BLE_Payload.LAST_SPLIT_TIME_LO) *100, //the doc 0.1 factor is this right?
                    lastSplitDistance: utils.getUint24(data, ble.PM_Mux_Extra_Status2_BLE_Payload.LAST_SPLIT_DISTANCE_LO)

                }

                if (JSON.stringify(this.rowingAdditionalStatus2) !== JSON.stringify(parsed)) {
                    this._rowingAdditionalStatus2 = parsed;
                    this.rowingAdditionalStatus2Event.pub(parsed);
                }
            }
        }

        /**
         *
         * @param data
         */
        protected handleRowingStrokeData(data:DataView)  {

            var parsed:RowingStrokeData;
            if (data.byteLength == ble.PM_Stroke_Data_BLE_Payload.BLE_PAYLOAD_SIZE) {
                parsed = {
                    elapsedTime: utils.getUint24(data, ble.PM_Stroke_Data_BLE_Payload.ELAPSED_TIME_LO) * 10, //in mili seconds
                    distance: utils.getUint24(data, ble.PM_Stroke_Data_BLE_Payload.DISTANCE_LO) / 10, //meter
                    driveLength: data.getUint8(ble.PM_Stroke_Data_BLE_Payload.DRIVE_LENGTH) / 100, //meters
                    driveTime: data.getUint8(ble.PM_Stroke_Data_BLE_Payload.DRIVE_TIME) * 10, //ms
                    strokeRecoveryTime: data.getUint16(ble.PM_Stroke_Data_BLE_Payload.STROKE_RECOVERY_TIME_LO) * 10, //ms
                    strokeDistance: data.getUint16(ble.PM_Stroke_Data_BLE_Payload.STROKE_DISTANCE_LO) / 100,//meter
                    peakDriveForce: data.getUint16(ble.PM_Stroke_Data_BLE_Payload.PEAK_DRIVE_FORCE_LO) / 10, //lbs
                    averageDriveForce: data.getUint16(ble.PM_Stroke_Data_BLE_Payload.AVG_DRIVE_FORCE_LO) / 10, //lbs
                    workPerStroke: data.getUint16(ble.PM_Stroke_Data_BLE_Payload.WORK_PER_STROKE_LO) / 10, //jouls
                    strokeCount: data.getUint16(ble.PM_Stroke_Data_BLE_Payload.STROKE_COUNT_LO)
                }
            }
            else {
                parsed = {
                    elapsedTime: utils.getUint24(data, ble.PM_Mux_Stroke_Data_BLE_Payload.ELAPSED_TIME_LO) * 10, //in mili seconds
                    distance: utils.getUint24(data, ble.PM_Mux_Stroke_Data_BLE_Payload.DISTANCE_LO) / 10, //meter
                    driveLength: data.getUint8(ble.PM_Mux_Stroke_Data_BLE_Payload.DRIVE_LENGTH) / 100, //meters
                    driveTime: data.getUint8(ble.PM_Mux_Stroke_Data_BLE_Payload.DRIVE_TIME) * 10, //ms
                    strokeRecoveryTime: data.getUint16(ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_RECOVERY_TIME_LO) * 10, //ms
                    strokeDistance: data.getUint16(ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_DISTANCE_LO) / 100,//meter
                    peakDriveForce: data.getUint16(ble.PM_Mux_Stroke_Data_BLE_Payload.PEAK_DRIVE_FORCE_LO) / 10, //lbs
                    averageDriveForce: data.getUint16(ble.PM_Mux_Stroke_Data_BLE_Payload.AVG_DRIVE_FORCE_LO) / 10, //lbs
                    workPerStroke: null,
                    strokeCount: data.getUint16(ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_COUNT_LO)
                }

            }

            if (JSON.stringify(this.rowingStrokeData) !== JSON.stringify(parsed)) {
                this._rowingStrokeData = parsed;
                this.rowingStrokeDataEvent.pub(parsed);
            }

        }

        /**
         *
         * @param data
         */
        protected handleRowingAdditionalStrokeData(data:DataView)  {

            var parsed:RowingAdditionalStrokeData = {
                elapsedTime: utils.getUint24(data, ble.PM_Extra_Stroke_Data_BLE_Payload.ELAPSED_TIME_LO) * 10, //in mili seconds
                strokePower : data.getUint16(ble.PM_Extra_Stroke_Data_BLE_Payload.STROKE_POWER_LO) ,  //watts
                strokeCalories : data.getUint16(ble.PM_Extra_Stroke_Data_BLE_Payload.STROKE_CALORIES_LO), //cal/hr
                strokeCount :data.getUint16(ble.PM_Extra_Stroke_Data_BLE_Payload.STROKE_COUNT_LO),
                projectedWorkTime : utils.getUint24(data, ble.PM_Extra_Stroke_Data_BLE_Payload.PROJ_WORK_TIME_LO)*1000, //ms
                projectedWorkDistance : utils.getUint24(data, ble.PM_Extra_Stroke_Data_BLE_Payload.PROJ_WORK_DIST_LO), //meter
                workPerStroke : null //filled when multiplexed is true
            }
            if (data.byteLength==ble.PM_Mux_Extra_Stroke_Data_BLE_Payload.BLE_PAYLOAD_SIZE)
                parsed.workPerStroke =  data.getUint16(ble.PM_Mux_Extra_Stroke_Data_BLE_Payload.WORK_PER_STROKE_LO);
            if (JSON.stringify(this.rowingAdditionalStrokeData) !== JSON.stringify(parsed)) {
                this._rowingAdditionalStrokeData = parsed;
                this.rowingAdditionalStrokeDataEvent.pub(parsed);
            }
        }

        /**
         *
         * @param data
         */
        protected handleRowingSplitIntervalData(data:DataView)  {

            var parsed:RowingSplitIntervalData = {
                elapsedTime: utils.getUint24(data, ble.PM_Split_Interval_Data_BLE_Payload.ELAPSED_TIME_LO) * 10, //in mili seconds
                distance :  utils.getUint24(data, ble.PM_Split_Interval_Data_BLE_Payload.DISTANCE_LO)/10, //meters
                intervalTime : utils.getUint24(data, ble.PM_Split_Interval_Data_BLE_Payload.SPLIT_TIME_LO)*100,
                intervalDistance : utils.getUint24(data, ble.PM_Split_Interval_Data_BLE_Payload.SPLIT_DISTANCE_LO),
                intervalRestTime : data.getUint16(ble.PM_Split_Interval_Data_BLE_Payload.REST_TIME_LO)*1000,
                intervalRestDistance : data.getUint16(ble.PM_Split_Interval_Data_BLE_Payload.REST_DISTANCE_LO),//meter
                intervalType : data.getUint8(ble.PM_Split_Interval_Data_BLE_Payload.TYPE),
                intervalNumber : data.getUint8(ble.PM_Split_Interval_Data_BLE_Payload.INT_NUMBER),
        }

            if (JSON.stringify(this.rowingSplitIntervalData) !== JSON.stringify(parsed)) {
                this._rowingSplitIntervalData = parsed;
                this.rowingSplitIntervalDataEvent.pub(parsed);
            }
        }

        /**
         *
         * @param data
         */
        protected handleRowingAdditionalSplitIntervalData(data:DataView)  {

            var parsed:RowingAdditionalSplitIntervalData = {
                elapsedTime: utils.getUint24(data, ble.PM_Extra_Split_Interval_Data_BLE_Payload.ELAPSED_TIME_LO) * 10, //in mili seconds
                intervalAverageStrokeRate :  data.getUint8(ble.PM_Extra_Split_Interval_Data_BLE_Payload.STROKE_RATE),
                intervalWorkHeartrate :  data.getUint8(ble.PM_Extra_Split_Interval_Data_BLE_Payload.WORK_HR),
                intervalRestHeartrate :   data.getUint8(ble.PM_Extra_Split_Interval_Data_BLE_Payload.REST_HR),
                intervalAveragePace :  data.getUint16(ble.PM_Extra_Split_Interval_Data_BLE_Payload.AVG_PACE_LO)*10, //ms lbs
                intervalTotalCalories : data.getUint16(ble.PM_Extra_Split_Interval_Data_BLE_Payload.CALORIES_LO),
                intervalAverageCalories : data.getUint16(ble.PM_Extra_Split_Interval_Data_BLE_Payload.AVG_CALORIES_LO),
                intervalSpeed : data.getUint16(ble.PM_Extra_Split_Interval_Data_BLE_Payload.SPEED_LO)/1000, //m/s
                intervalPower : data.getUint16(ble.PM_Extra_Split_Interval_Data_BLE_Payload.POWER_LO),
                splitAverageDragFactor :  data.getUint8(ble.PM_Extra_Split_Interval_Data_BLE_Payload.AVG_DRAG_FACTOR),
                intervalNumber :  data.getUint8(ble.PM_Extra_Split_Interval_Data_BLE_Payload.INT_NUMBER)
            }

            if (JSON.stringify(this.rowingAdditionalSplitIntervalData) !== JSON.stringify(parsed)) {
                this._rowingAdditionalSplitIntervalData = parsed;
                this.rowingAdditionalSplitIntervalDataEvent.pub(parsed);
            }
        }

        /**
         *
         * @param data
         */
        protected handleWorkoutSummaryData(data:DataView)  {

            var parsed:WorkoutSummaryData = {
                logEntryDate : data.getUint16(ble.PM_Workout_Summary_Data_BLE_Payload.LOG_DATE_LO),
                logEntryTime : data.getUint16(ble.PM_Workout_Summary_Data_BLE_Payload.LOG_TIME_LO),
                elapsedTime : utils.getUint24(data, ble.PM_Workout_Summary_Data_BLE_Payload.ELAPSED_TIME_LO) * 10,
                distance :  utils.getUint24(data, ble.PM_Workout_Summary_Data_BLE_Payload.DISTANCE_LO)/10,
                averageStrokeRate : data.getUint8(ble.PM_Workout_Summary_Data_BLE_Payload.AVG_SPM),
                endingHeartrate : data.getUint8(ble.PM_Workout_Summary_Data_BLE_Payload.END_HR),
                averageHeartrate : data.getUint8(ble.PM_Workout_Summary_Data_BLE_Payload.AVG_HR),
                minHeartrate : data.getUint8(ble.PM_Workout_Summary_Data_BLE_Payload.MIN_HR),
                maxHeartrate : data.getUint8(ble.PM_Workout_Summary_Data_BLE_Payload.MAX_HR),
                dragFactorAverage : data.getUint8(ble.PM_Workout_Summary_Data_BLE_Payload.AVG_DRAG_FACTOR),
                recoveryHeartRate : data.getUint8(ble.PM_Workout_Summary_Data_BLE_Payload.RECOVERY_HR),
                workoutType  : data.getUint8(ble.PM_Workout_Summary_Data_BLE_Payload.WORKOUT_TYPE),
                averagePace : null
            }

            if (data.byteLength==ble.PM_Workout_Summary_Data_BLE_Payload.BLE_PAYLOAD_SIZE) {
                parsed.averagePace = data.getUint16(ble.PM_Workout_Summary_Data_BLE_Payload.AVG_PACE_LO);
            }
            if (JSON.stringify(this.workoutSummaryData) !== JSON.stringify(parsed)) {
                this._workoutSummaryData = parsed;
                this.workoutSummaryDataEvent.pub(parsed);
            }
        }

        /**
         *
         * @param data
         */
        protected handleAdditionalWorkoutSummaryData(data:DataView)  {

            var parsed:AdditionalWorkoutSummaryData;
            if (data.byteLength==ble.PM_Extra_Workout_Summary_Data_BLE_Payload.DATA_BLE_PAYLOAD_SIZE) {
                parsed = {
                    logEntryDate : data.getUint16(ble.PM_Extra_Workout_Summary_Data_BLE_Payload.LOG_DATE_LO),
                    logEntryTime : data.getUint16(ble.PM_Extra_Workout_Summary_Data_BLE_Payload.LOG_DATE_HI),
                    intervalType : data.getUint8(ble.PM_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_TYPE),
                    intervalSize: data.getUint16(ble.PM_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_SIZE_LO),//meters or seconds
                    intervalCount:   data.getUint8(ble.PM_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_COUNT),
                    totalCalories: data.getUint16(ble.PM_Extra_Workout_Summary_Data_BLE_Payload.WORK_CALORIES_LO),
                    watts: data.getUint16(ble.PM_Extra_Workout_Summary_Data_BLE_Payload.WATTS_LO),
                    totalRestDistance :  utils.getUint24(data, ble.PM_Extra_Workout_Summary_Data_BLE_Payload.TOTAL_REST_DISTANCE_LO) ,
                    intervalRestTime : data.getUint16(ble.PM_Extra_Workout_Summary_Data_BLE_Payload.INTERVAL_REST_TIME_LO),
                    averageCalories : data.getUint16(ble.PM_Extra_Workout_Summary_Data_BLE_Payload.AVG_CALORIES_LO)
                }

            }
            else {
                parsed = {
                    logEntryDate : data.getUint16(ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.LOG_DATE_LO),
                    logEntryTime : data.getUint16(ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.LOG_TIME_LO),
                    intervalType : null,
                    intervalSize: data.getUint16(ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_SIZE_LO),//meters or seconds
                    intervalCount:   data.getUint8(ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_COUNT),
                    totalCalories: data.getUint16(ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.WORK_CALORIES_LO),
                    watts: data.getUint16(ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.WATTS_LO),
                    totalRestDistance :  utils.getUint24(data, ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.TOTAL_REST_DISTANCE_LO) ,
                    intervalRestTime : data.getUint16(ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.INTERVAL_REST_TIME_LO),
                    averageCalories : data.getUint16(ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.AVG_CALORIES_LO)
                }

            }

            if (JSON.stringify(this.additionalWorkoutSummaryData) !== JSON.stringify(parsed)) {
                this._additionalWorkoutSummaryData = parsed;
                this.additionalWorkoutSummaryDataEvent.pub(parsed);
            }
        }

        /**
         *
         * @param data
         */
        protected handleAdditionalWorkoutSummaryData2(data:DataView)  {

            var parsed:AdditionalWorkoutSummaryData2 = {
                    logEntryDate : data.getUint16(ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.LOG_DATE_LO),
                    logEntryTime : data.getUint16(ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.LOG_DATE_HI),
                    averagePace : data.getUint16(ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.AVG_PACE_LO),
                    gameIdentifier : data.getUint8(ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.GAME_ID),
                    gameScore :  data.getUint16(ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.GAME_SCORE_LO),
                    ergMachineType : data.getUint8(ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.MACHINE_TYPE),
                }

            if (JSON.stringify(this.additionalWorkoutSummaryData2) !== JSON.stringify(parsed)) {
                this._additionalWorkoutSummaryData2 = parsed;
                this.additionalWorkoutSummaryData2Event.pub(parsed);
            }
        }


        /**
         *
         * @param data
         */
        protected handleHeartRateBeltInformation(data:DataView)  {

            var parsed:HeartRateBeltInformation = {
                manufacturerId : data.getUint8(ble.PM_Heart_Rate_Belt_Info_BLE_Payload.MANUFACTURER_ID),
                deviceType: data.getUint8(ble.PM_Heart_Rate_Belt_Info_BLE_Payload.DEVICE_TYPE),
                beltId : data.getUint32(ble.PM_Heart_Rate_Belt_Info_BLE_Payload.BELT_ID_LO),
            }

            if (JSON.stringify(this.heartRateBeltInformation) !== JSON.stringify(parsed)) {
                this._heartRateBeltInformation = parsed;
                this.heartRateBeltInformationEvent.pub(parsed);
            }
        }

        /**
         *
         * @param device
         * @internal
         */
        protected deviceConnected(device:evothings.easyble.EasyBLEDevice) {
            // First Read all services so easy ble can map the Characteristic to handles
            device.readServices(
                null,
                ()=> {
                    this.debugInfo("readServices success");

                    // Debug logging of all services, characteristics and descriptors
                    // reported by the BLE board.
                    this.logAllServices(this._device);

                    this.debugInfo('Status: notifications are activated');
                    //handle to the notification

                    this.changeConnectionState(MonitorConnectionState.servicesFound);
                    this.enableDisableNotification();


                },
                (error)=> {
                    this.handleError('Error: Failed to read services: ' + error);
                });

        }

        /**
         *
         * @param data
         */
        protected handleDataCallbackMulti(data:ArrayBuffer) {
            //this.debugInfo("multi data received: " + evothings.util.typedArrayToHexString(data));

            var ar = new DataView(data);
            var dataType:ble.PM_Multiplexed_Info_Type_ID = ar.getUint8(0);
            ar = new DataView(data, 1);
            switch (dataType) {
                case ble.PM_Multiplexed_Info_Type_ID.ROWING_GENERAL_STATUS : {
                    if (this.rowingGeneralStatusEvent.count>0) this.handleRowingGeneralStatus(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.ROWING_ADDITIONAL_STATUS1 : {
                    if (this.rowingAdditionalStatus1Event.count>0) this.handleRowingAdditionalStatus1(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.ROWING_ADDITIONAL_STATUS2 : {
                    if (this.rowingAdditionalStatus2Event.count>0) this.handleRowingAdditionalStatus2(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.STROKE_DATA_STATUS : {
                    if (this.rowingStrokeDataEvent.count>0) this.handleRowingStrokeData(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.EXTRA_STROKE_DATA_STATUS : {
                    if (this.rowingAdditionalStrokeDataEvent.count>0) this.handleRowingAdditionalStrokeData(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.SPLIT_INTERVAL_STATUS : {
                    if (this.rowingSplitIntervalDataEvent.count>0) this.handleRowingSplitIntervalData(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.EXTRA_SPLIT_INTERVAL_STATUS : {
                    if (this.rowingAdditionalSplitIntervalDataEvent.count>0) this.handleRowingAdditionalSplitIntervalData(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.WORKOUT_SUMMARY_STATUS : {
                    if (this.workoutSummaryDataEvent.count>0) this.handleWorkoutSummaryData(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.EXTRA_WORKOUT_SUMMARY_STATUS1 : {
                    if (this.additionalWorkoutSummaryDataEvent.count>0) this.handleAdditionalWorkoutSummaryData(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.HEART_RATE_BELT_INFO_STATUS : {
                    if (this.heartRateBeltInformationEvent.count>0) this.handleHeartRateBeltInformation(ar);
                    break;
                }
                case ble.PM_Multiplexed_Info_Type_ID.EXTRA_WORKOUT_SUMMARY_STATUS2 : {
                    if (this.additionalWorkoutSummaryData2Event.count>0) this.handleAdditionalWorkoutSummaryData2(ar);
                    break;
                }

            }
        };

        /**
         *
         * @param data
         * @param func
         */
        protected handleDataCallback(data:ArrayBuffer, func:(data:DataView)=>void) {
            //this.debugInfo("data received: " + evothings.util.typedArrayToHexString(data));

            var ar = new DataView(data);
            //call the function within the scope of the object
            func.apply(this,[ar]);
        };

    }

}