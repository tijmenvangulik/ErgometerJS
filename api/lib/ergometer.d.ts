/**
 *
 * Created by tijmen on 01-06-15.
 *
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
declare namespace pubSub {
    interface ISubscription {
        (...args: any[]): void;
    }
    interface ISubscriptionItem {
        object: any;
        func: ISubscription;
    }
    interface IDictionary {
        [name: string]: ISubscriptionItem[];
    }
    class PubSub {
        private registry;
        pub(name: string, ...args: any[]): void;
        pubASync(name: string, ...args: any[]): void;
        sub(applyObject: any, name: string, fn: ISubscription): void;
        unsub(name: string, fn: ISubscription): void;
        subscribeCount(name: string): number;
    }
    interface ISubscriptionChanged {
        (sender: any, count: number): void;
    }
    class Event<T extends ISubscription> {
        protected _subscribed: ISubscriptionItem[];
        protected _subScriptionChangedEvent: ISubscriptionChanged;
        protected doChangedEvent(): void;
        protected findSubscription(event: T): ISubscriptionItem;
        sub(applyObject: any, event: T): void;
        unsub(event: T): void;
        protected doPub(args: any[]): void;
        pub: T;
        pubAsync: T;
        count: number;
        registerChangedEvent(func: ISubscriptionChanged): void;
    }
}
/**
 * Created by tijmen on 28-12-15.
 */
declare module ergometer {
    const enum RowingSampleRate {
        rate1sec = 0,
        rate500ms = 1,
        rate250ms = 2,
        rate100ms = 3,
    }
    const enum ErgmachineType {
        staticD = 0,
        staticC = 1,
        staticA = 2,
        staticB = 3,
        staticE = 5,
        staticDynamic = 8,
        slidesA = 16,
        slidesB = 17,
        slidesC = 18,
        slidesD = 19,
        slidesE = 20,
        slidesDynamic = 32,
        staticDyno = 64,
        staticSki = 128,
        num = 129,
    }
    const enum WorkoutType {
        justrowNoAplits = 0,
        justrowAplits = 1,
        fixeddistNoAplits = 2,
        fixeddistAplits = 3,
        fixedtimeNoAplits = 4,
        fixedtimeAplits = 5,
        fixedtimeInterval = 6,
        fixeddistInterval = 7,
        variableInterval = 8,
        variableUndefinedRestInterval = 9,
        fixedCalorie = 10,
        fixedWattMinutes = 11,
        num = 12,
    }
    const enum IntervalType {
        time = 0,
        dist = 1,
        rest = 2,
        timertUndefined = 3,
        distanceRestUndefined = 4,
        restUndefined = 5,
        cal = 6,
        calRestUndefined = 7,
        wattMinute = 8,
        wattMinuteRestUndefined = 9,
        none = 255,
    }
    const enum WorkoutState {
        waitToBegin = 0,
        workoutRow = 1,
        countDownPause = 2,
        intervalRest = 3,
        intervalWorktime = 4,
        intervalWorkDistance = 5,
        intervalRestEndToWorkTime = 6,
        intervalRestEndToWorkDistance = 7,
        intervalWorktimeTorest = 8,
        intervalWorkDistanceToEest = 9,
        workoutEnd = 10,
        terminate = 11,
        workoutLogged = 12,
        rearm = 13,
    }
    const enum RowingState {
        inactive = 0,
        active = 1,
    }
    const enum StrokeState {
        waitingForWheelToReachMinSpeedState = 0,
        waitingForWheelToAccelerateState = 1,
        drivingState = 2,
        dwellingAfterDriveState = 3,
        recoveryState = 4,
    }
    const enum WorkoutDurationType {
        timeDuration = 0,
        caloriesDuration = 64,
        distanceDuration = 128,
        wattsDuration = 192,
    }
    const enum SampleRate {
        rate1sec = 0,
        rate500ms = 1,
        rate250ms = 2,
        rate100ms = 3,
    }
    interface RowingGeneralStatus {
        elapsedTime: number;
        distance: number;
        workoutType: WorkoutType;
        intervalType: IntervalType;
        workoutState: WorkoutState;
        rowingState: RowingState;
        strokeState: StrokeState;
        totalWorkDistance: number;
        workoutDuration: number;
        workoutDurationType: WorkoutDurationType;
        dragFactor: number;
    }
    interface RowingAdditionalStatus1 {
        elapsedTime: number;
        speed: number;
        strokeRate: number;
        heartRate: number;
        currentPace: number;
        averagePace: number;
        restDistance: number;
        restTime: number;
        averagePower: number;
    }
    interface RowingAdditionalStatus2 {
        elapsedTime: number;
        intervalCount: number;
        averagePower: number;
        totalCalories: number;
        splitAveragePace: number;
        splitAveragePower: number;
        splitAverageCalories: number;
        lastSplitTime: number;
        lastSplitDistance: number;
    }
    interface RowingStrokeData {
        elapsedTime: number;
        distance: number;
        driveLength: number;
        driveTime: number;
        strokeRecoveryTime: number;
        strokeDistance: number;
        peakDriveForce: number;
        averageDriveForce: number;
        workPerStroke: number;
        strokeCount: number;
    }
    interface RowingAdditionalStrokeData {
        elapsedTime: number;
        strokePower: number;
        strokeCalories: number;
        strokeCount: number;
        projectedWorkTime: number;
        projectedWorkDistance: number;
        workPerStroke: number;
    }
    interface RowingSplitIntervalData {
        elapsedTime: number;
        distance: number;
        intervalTime: number;
        intervalDistance: number;
        intervalRestTime: number;
        intervalRestDistance: number;
        intervalType: IntervalType;
        intervalNumber: number;
    }
    interface RowingAdditionalSplitIntervalData {
        elapsedTime: number;
        intervalAverageStrokeRate: number;
        intervalWorkHeartrate: number;
        intervalRestHeartrate: number;
        intervalAveragePace: number;
        intervalTotalCalories: number;
        intervalAverageCalories: number;
        intervalSpeed: number;
        intervalPower: number;
        splitAverageDragFactor: number;
        intervalNumber: number;
    }
    interface WorkoutSummaryData {
        logEntryDate: number;
        logEntryTime: number;
        elapsedTime: number;
        distance: number;
        averageStrokeRate: number;
        endingHeartrate: number;
        averageHeartrate: number;
        minHeartrate: number;
        maxHeartrate: number;
        dragFactorAverage: number;
        recoveryHeartRate: number;
        workoutType: WorkoutType;
        averagePace: number;
    }
    interface AdditionalWorkoutSummaryData {
        logEntryDate: number;
        logEntryTime: number;
        intervalType: IntervalType;
        intervalSize: number;
        intervalCount: number;
        totalCalories: number;
        watts: number;
        totalRestDistance: number;
        intervalRestTime: number;
        averageCalories: number;
    }
    interface AdditionalWorkoutSummaryData2 {
        logEntryDate: number;
        logEntryTime: number;
        averagePace: number;
        gameIdentifier: number;
        gameScore: number;
        ergMachineType: ErgmachineType;
    }
    interface HeartRateBeltInformation {
        manufacturerId: number;
        deviceType: number;
        beltId: number;
    }
}
/**
 * Concept 2 ergometer Performance Monitor api for Cordova
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
declare module ergometer {
    interface RowingGeneralStatusEvent extends pubSub.ISubscription {
        (data: RowingGeneralStatus): void;
    }
    interface RowingAdditionalStatus1Event extends pubSub.ISubscription {
        (data: RowingAdditionalStatus1): void;
    }
    interface RowingAdditionalStatus2Event extends pubSub.ISubscription {
        (data: RowingAdditionalStatus2): void;
    }
    interface RowingStrokeDataEvent extends pubSub.ISubscription {
        (data: RowingStrokeData): void;
    }
    interface RowingAdditionalStrokeDataEvent extends pubSub.ISubscription {
        (data: RowingAdditionalStrokeData): void;
    }
    interface RowingSplitIntervalDataEvent extends pubSub.ISubscription {
        (data: RowingSplitIntervalData): void;
    }
    interface RowingAdditionalSplitIntervalDataEvent extends pubSub.ISubscription {
        (data: RowingAdditionalSplitIntervalData): void;
    }
    interface WorkoutSummaryDataEvent extends pubSub.ISubscription {
        (data: WorkoutSummaryData): void;
    }
    interface AdditionalWorkoutSummaryDataEvent extends pubSub.ISubscription {
        (data: AdditionalWorkoutSummaryData): void;
    }
    interface AdditionalWorkoutSummaryData2Event extends pubSub.ISubscription {
        (data: AdditionalWorkoutSummaryData2): void;
    }
    interface HeartRateBeltInformationEvent extends pubSub.ISubscription {
        (data: HeartRateBeltInformation): void;
    }
    enum MonitorConnectionState {
        inactive = 0,
        deviceReady = 1,
        scanning = 2,
        connecting = 3,
        connected = 4,
        servicesFound = 5,
    }
    enum LogLevel {
        error = 0,
        info = 1,
        debug = 2,
        trace = 3,
    }
    interface LogEvent extends pubSub.ISubscription {
        (text: string, logLevel: LogLevel): void;
    }
    interface ConnectionStateChangedEvent extends pubSub.ISubscription {
        (oldState: MonitorConnectionState, newState: MonitorConnectionState): void;
    }
    interface DeviceInfo {
        connected: boolean;
        name: string;
        address: string;
        quality: number;
        serial?: string;
        hardwareRevision?: string;
        firmwareRevision?: string;
        manufacturer?: string;
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
    class PerformanceMonitor {
        private _device;
        private _connectionState;
        private _logEvent;
        private _connectionStateChangedEvent;
        private _rowingGeneralStatusEvent;
        private _rowingAdditionalStatus1Event;
        private _rowingAdditionalStatus2Event;
        private _rowingStrokeDataEvent;
        private _rowingAdditionalStrokeDataEvent;
        private _rowingSplitIntervalDataEvent;
        private _rowingAdditionalSplitIntervalDataEvent;
        private _workoutSummaryDataEvent;
        private _additionalWorkoutSummaryDataEvent;
        private _additionalWorkoutSummaryData2Event;
        private _heartRateBeltInformationEvent;
        private _deviceInfo;
        private _rowingGeneralStatus;
        private _rowingAdditionalStatus1;
        private _rowingAdditionalStatus2;
        private _rowingStrokeData;
        private _rowingAdditionalStrokeData;
        private _rowingSplitIntervalData;
        private _rowingAdditionalSplitIntervalData;
        private _workoutSummaryData;
        private _additionalWorkoutSummaryData;
        private _additionalWorkoutSummaryData2;
        private _heartRateBeltInformation;
        private _devices;
        private _multiplex;
        private _multiplexSubscribeCount;
        private _sampleRate;
        private _autoReConnect;
        private _logLevel;
        /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @returns {LogLevel}
         */
        /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @param value
         */
        logLevel: LogLevel;
        /**
         * when the connection is lost re-connect
         * @returns {boolean}
         */
        /**
         *
         * when the connection is lost re-connect
         * @param value
         */
        autoReConnect: boolean;
        /**
         * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
         * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
         * the documentation in the properties You must set the multi plex property before connecting
         *
         * @returns {boolean}
         */
        /**
         * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
         * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
         * the documentation in the properties You must set the multi plex property before connecting
         * @param value
         */
        multiplex: boolean;
        /**
         * an array of of performance monitor devices which where found during the scan.
         * the array is sorted by connection quality (best on top)
         *
         * @returns {DeviceInfo[]}
         */
        devices: ergometer.DeviceInfo[];
        /**
         * The values of the last rowingGeneralStatus event
         *
         * @returns {RowingGeneralStatus}
         */
        rowingGeneralStatus: RowingGeneralStatus;
        /**
         * The values of the last rowingAdditionalStatus1 event
         * @returns {RowingAdditionalStatus1}
         */
        rowingAdditionalStatus1: RowingAdditionalStatus1;
        /**
         * The values of the last RowingAdditionalStatus2 event
         * @returns {RowingAdditionalStatus2}
         */
        rowingAdditionalStatus2: RowingAdditionalStatus2;
        /**
         *  The values of the last rowingStrokeData event
         * @returns {RowingStrokeData}
         */
        rowingStrokeData: RowingStrokeData;
        /**
         * The values of the last rowingAdditionalStrokeData event
         * @returns {RowingAdditionalStrokeData}
         */
        rowingAdditionalStrokeData: RowingAdditionalStrokeData;
        /**
         * The values of the last rowingSplitIntervalData event
         * @returns {RowingSplitIntervalData}
         */
        rowingSplitIntervalData: RowingSplitIntervalData;
        /**
         * The values of the last rowingAdditionalSplitIntervalData event
         * @returns {RowingAdditionalSplitIntervalData}
         */
        rowingAdditionalSplitIntervalData: RowingAdditionalSplitIntervalData;
        /**
         * The values of the last workoutSummaryData event
         * @returns {WorkoutSummaryData}
         */
        workoutSummaryData: WorkoutSummaryData;
        /**
         * The values of the last additionalWorkoutSummaryData event
         * @returns {AdditionalWorkoutSummaryData}
         */
        additionalWorkoutSummaryData: AdditionalWorkoutSummaryData;
        /**
         * The values of the last AdditionalWorkoutSummaryData2 event
         * @returns {AdditionalWorkoutSummaryData2}
         */
        additionalWorkoutSummaryData2: AdditionalWorkoutSummaryData2;
        /**
         * The values of the last heartRateBeltInformation event
         * @returns {HeartRateBeltInformation}
         */
        heartRateBeltInformation: HeartRateBeltInformation;
        /**
         * read rowingGeneralStatus data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingGeneralStatusEvent>}
         */
        rowingGeneralStatusEvent: pubSub.Event<RowingGeneralStatusEvent>;
        /**
         * read rowingGeneralStatus1 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus1Event>}
         */
        rowingAdditionalStatus1Event: pubSub.Event<RowingAdditionalStatus1Event>;
        /**
         * read rowingAdditionalStatus2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus2Event>}
         */
        rowingAdditionalStatus2Event: pubSub.Event<RowingAdditionalStatus2Event>;
        /**
         * read rowingStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingStrokeDataEvent>}
         */
        rowingStrokeDataEvent: pubSub.Event<RowingStrokeDataEvent>;
        /**
         * read rowingAdditionalStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStrokeDataEvent>}
         */
        rowingAdditionalStrokeDataEvent: pubSub.Event<RowingAdditionalStrokeDataEvent>;
        /**
         * read rowingSplitIntervalDat data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingSplitIntervalDataEvent>}
         */
        rowingSplitIntervalDataEvent: pubSub.Event<RowingSplitIntervalDataEvent>;
        /**
         * read rowingAdditionalSplitIntervalData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalSplitIntervalDataEvent>}
         */
        rowingAdditionalSplitIntervalDataEvent: pubSub.Event<RowingAdditionalSplitIntervalDataEvent>;
        /**
         * read workoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<WorkoutSummaryDataEvent>}
         */
        workoutSummaryDataEvent: pubSub.Event<WorkoutSummaryDataEvent>;
        /**
         * read additionalWorkoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryDataEvent>}
         */
        additionalWorkoutSummaryDataEvent: pubSub.Event<AdditionalWorkoutSummaryDataEvent>;
        /**
         * read additionalWorkoutSummaryData2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryData2Event>}
         */
        additionalWorkoutSummaryData2Event: pubSub.Event<AdditionalWorkoutSummaryData2Event>;
        /**
         * read heartRateBeltInformation data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<HeartRateBeltInformationEvent>}
         */
        heartRateBeltInformationEvent: pubSub.Event<HeartRateBeltInformationEvent>;
        /**
         * event which is called when the connection state is changed. For example this way you
         * can check if the device is disconnected.
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<ConnectionStateChangedEvent>}
         */
        connectionStateChangedEvent: pubSub.Event<ConnectionStateChangedEvent>;
        /**
         * returns error and other log information. Some errors can only be received using the logEvent
         * @returns {pubSub.Event<LogEvent>}
         */
        logEvent: pubSub.Event<LogEvent>;
        /**
         * Get device information of the connected device.
         * @returns {DeviceInfo}
         */
        deviceInfo: ergometer.DeviceInfo;
        /**
         * read the performance montitor sample rate. By default this is 500 ms
         * @returns {number}
         */
        /**
         * Change the performance monitor sample rate.
         * @param value
         */
        sampleRate: SampleRate;
        /**
         * disconnect the current connected device
         */
        protected disconnect(): void;
        /**
         * read the current connection state
         * @returns {MonitorConnectionState}
         */
        connectionState: MonitorConnectionState;
        /**
         *
         * @param value
         */
        protected changeConnectionState(value: MonitorConnectionState): void;
        /**
         * To work with this class you will need to create it.
         */
        constructor();
        /**
         *
         */
        protected enableMultiplexNotification(): void;
        /**
         *
         */
        protected disableMultiPlexNotification(): void;
        /**
         *
         */
        protected enableDisableNotification(): void;
        /**
         *
         */
        protected initialize(): void;
        /**
         * When low level initialization complete, this function is called.
         */
        /**
         * Print debug info to console and application UI.
         * @param info
         */
        protected traceInfo(info: string): void;
        /**
         *
         * @param info
         */
        protected debugInfo(info: string): void;
        /**
         *
         * @param info
         */
        protected showInfo(info: string): void;
        /**
         *
         * @param error
         */
        protected handleError(error: string): void;
        /**
         *
         * @param device
         */
        protected removeDevice(device: DeviceInfo): void;
        /**
         *
         * @param device
         */
        protected addDevice(device: DeviceInfo): void;
        /**
         *
         * @param name
         * @returns {DeviceInfo}
         */
        protected findDevice(name: string): DeviceInfo;
        /**
         *
         */
        protected stopScan(): void;
        /**
         * Scan for device use the deviceFound to connect .
         * @param deviceFound
         */
        startScan(deviceFound: (device: DeviceInfo) => boolean): void;
        /**
         * connect to a specific device. This should be a PM5 device which is found by the startScan. You can
         * only call this function after startScan is called. Connection to a device will stop the scan.
         * @param deviceName
         */
        connectToDevice(deviceName: string): void;
        /**
         *  Dump all information on named device to the debug info
         *  this is called when the log level is set to trace
         * @param device
         */
        protected readServices(device: any): void;
        /**
         *
         * @param UUID
         * @param readValue
         */
        protected readStringCharacteristic(UUID: string, readValue: (value: string) => void): void;
        /**
         *
         * @param done
         */
        protected readSampleRate(done: () => void): void;
        /**
         *
         * @param done
         */
        protected readPheripheralInfo(done: () => void): void;
        /**
         *   Debug logging of found services, characteristics and descriptors.
         * @param device
         */
        protected logAllServices(device: any): void;
        /**
         *
         * @param data
         */
        protected handleRowingGeneralStatus(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingAdditionalStatus1(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingAdditionalStatus2(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingStrokeData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingAdditionalStrokeData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingSplitIntervalData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingAdditionalSplitIntervalData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleWorkoutSummaryData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleAdditionalWorkoutSummaryData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleAdditionalWorkoutSummaryData2(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleHeartRateBeltInformation(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleDataCallbackMulti(data: ArrayBuffer): void;
        /**
         *
         * @param data
         * @param func
         */
        protected handleDataCallback(data: ArrayBuffer, func: (data: DataView) => void): void;
    }
}
