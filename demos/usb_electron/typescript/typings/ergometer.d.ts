/**
 * Created by tijmen on 04/07/2017.
 *
 * queue function calls which returns a promise, converted to typescript
 * needed as work around for web blue tooth, this ensures that only one call is processed at at time
 *
 *
 */
declare namespace ergometer.utils {
    /**
     * @return {Object}
     */
    /**
     * It limits concurrently executed promises
     *
     * @param {Number} [maxPendingPromises=Infinity] max number of concurrently executed promises
     * @param {Number} [maxQueuedPromises=Infinity]  max number of queued promises
     * @constructor
     *
     * @example
     *
     * var queue = new Queue(1);
     *
     * queue.add(function () {
       *     // resolve of this promise will resume next request
       *     return downloadTarballFromGithub(url, file);
       * })
     * .then(function (file) {
       *     doStuffWith(file);
       * });
     *
     * queue.add(function () {
       *     return downloadTarballFromGithub(url, file);
       * })
     * // This request will be paused
     * .then(function (file) {
       *     doStuffWith(file);
       * });
     */
    interface IPromiseFunction {
        (...args: any[]): Promise<any | void>;
    }
    class FunctionQueue {
        /**
         * @param {*} value
         * @returns {LocalPromise}
         */
        private resolveWith(value);
        private maxPendingPromises;
        private maxQueuedPromises;
        private pendingPromises;
        private queue;
        constructor(maxPendingPromises?: number, maxQueuedPromises?: number);
        /**
         * @param {promiseGenerator}  a function which returns a promise
         * @param {context} the object which is the context where the function is called in
         * @param  {params} array of parameters for the function
         * @return {Promise} promise which is resolved when the function is acually called
         */
        add(promiseGenerator: IPromiseFunction, context: any, ...params: any[]): Promise<any | void>;
        /**
         * Number of simultaneously running promises (which are resolving)
         *
         * @return {number}
         */
        getPendingLength(): number;
        /**
         * Number of queued promises (which are waiting)
         *
         * @return {number}
         */
        getQueueLength(): number;
        /**
         * @returns {boolean} true if first item removed from queue
         * @private
         */
        private _dequeue();
    }
}
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
declare namespace ergometer.pubSub {
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
        readonly pub: T;
        readonly pubAsync: T;
        readonly count: number;
        registerChangedEvent(func: ISubscriptionChanged): void;
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
declare namespace ergometer {
    interface ErrorHandler {
        (e: any): void;
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
    enum MonitorConnectionState {
        inactive = 0,
        deviceReady = 1,
        scanning = 2,
        connecting = 3,
        connected = 4,
        servicesFound = 5,
        readyForCommunication = 6,
    }
    interface ConnectionStateChangedEvent extends pubSub.ISubscription {
        (oldState: MonitorConnectionState, newState: MonitorConnectionState): void;
    }
    class MonitorBase {
        private _logEvent;
        private _logLevel;
        private _connectionStateChangedEvent;
        protected _connectionState: MonitorConnectionState;
        /**
        * By default it the logEvent will return errors if you want more debug change the log level
        * @returns {LogLevel}
        */
        readonly logEvent: pubSub.Event<LogEvent>;
        constructor();
        protected initialize(): void;
        /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @param value
         */
        logLevel: LogLevel;
        disconnect(): void;
        /**
         * read the current connection state
         * @returns {MonitorConnectionState}
         */
        readonly connectionState: MonitorConnectionState;
        protected connected(): void;
        /**
         * event which is called when the connection state is changed. For example this way you
         * can check if the device is disconnected.
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<ConnectionStateChangedEvent>}
         */
        readonly connectionStateChangedEvent: pubSub.Event<ConnectionStateChangedEvent>;
        debugInfo(info: string): void;
        /**
         *
         * @param info
         */
        showInfo(info: string): void;
        /**
         * Print debug info to console and application UI.
         * @param info
         */
        traceInfo(info: string): void;
        /**
         * call the global error hander and call the optional error handler if given
         * @param error
         */
        handleError(error: string, errorFn?: ErrorHandler): void;
        /**
         * Get an error function which adds the errorDescription to the error ,cals the global and an optional local funcion
         * @param errorDescription
         * @param errorFn
         */
        getErrorHandlerFunc(errorDescription: string, errorFn?: ErrorHandler): ErrorHandler;
        protected beforeConnected(): void;
        /**
         *
         * @param value
         */
        protected changeConnectionState(value: MonitorConnectionState): void;
    }
}
/**
 * Created by tijmen on 01-02-16.
 */
declare namespace ergometer.ble {
    interface IDevice {
        address: string;
        name: string;
        rssi: number;
        _internalDevice: any;
    }
    interface IFoundFunc {
        (device: IDevice): void;
    }
    interface IDriver {
        startScan(foundFn?: IFoundFunc): Promise<void>;
        stopScan(): void;
        connect(device: IDevice, disconnectFn: () => void): Promise<void>;
        disconnect(): void;
        writeCharacteristic(serviceUIID: string, characteristicUUID: string, data: ArrayBufferView): Promise<void>;
        readCharacteristic(serviceUIID: string, characteristicUUID: string): Promise<ArrayBuffer>;
        enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<void>;
        disableNotification(serviceUIID: string, characteristicUUID: string): Promise<void>;
    }
}
/**
 * Created by tijmen on 01-02-16.
 */
declare namespace ergometer.ble {
    class DriverBleat implements IDriver {
        private _device;
        private getCharacteristic(serviceUid, characteristicUid);
        connect(device: IDevice, disconnectFn: () => void): Promise<void>;
        disconnect(): void;
        startScan(foundFn?: IFoundFunc): Promise<void>;
        stopScan(): Promise<void>;
        writeCharacteristic(serviceUIID: string, characteristicUUID: string, data: ArrayBufferView): Promise<void>;
        readCharacteristic(serviceUIID: string, characteristicUUID: string): Promise<ArrayBuffer>;
        enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<void>;
        disableNotification(serviceUIID: string, characteristicUUID: string): Promise<void>;
    }
}
/**
 * Created by tijmen on 03/04/2017.
 */
/**
 * Created by tijmen on 01-02-16.
 *
 * see simpleBLE.d.ts for the definitions of the simpleBLE
 * It assumes that there simple ble is already imported as a var named simpleBLE
 *
 */
declare namespace ergometer.ble {
    class DriverSimpleBLE implements IDriver {
        connect(device: IDevice, disconnectFn: () => void): Promise<void>;
        disconnect(): void;
        startScan(foundFn?: IFoundFunc): Promise<void>;
        stopScan(): Promise<void>;
        writeCharacteristic(serviceUIID: string, characteristicUUID: string, data: ArrayBufferView): Promise<void>;
        readCharacteristic(serviceUIID: string, characteristicUUID: string): Promise<ArrayBuffer>;
        enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<void>;
        disableNotification(serviceUIID: string, characteristicUUID: string): Promise<void>;
    }
}
declare namespace bleCentral {
    function available(): boolean;
    class DriverBleCentral implements ergometer.ble.IDriver {
        private _scanServices;
        private _device;
        connect(device: ergometer.ble.IDevice, disconnectFn: () => void): Promise<void>;
        constructor(_scanServices: string[]);
        disconnect(): void;
        startScan(foundFn?: ergometer.ble.IFoundFunc): Promise<void>;
        stopScan(): Promise<void>;
        writeCharacteristic(serviceUIID: string, characteristicUUID: string, data: ArrayBufferView): Promise<void>;
        readCharacteristic(serviceUIID: string, characteristicUUID: string): Promise<ArrayBuffer>;
        enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<void>;
        disableNotification(serviceUIID: string, characteristicUUID: string): Promise<void>;
    }
}
/**
 * Created by tijmen on 17-07-16.
 */
/**
 * Created by tijmen on 01-02-16.
 */
declare namespace ergometer.ble {
    function hasWebBlueTooth(): boolean;
    class DriverWebBlueTooth implements IDriver {
        private _performanceMonitor;
        private _scanServices;
        private _scanOptionalServices;
        private _device;
        private _server;
        private _disconnectFn;
        private _listenerMap;
        private _listerCharacteristicMap;
        constructor(_performanceMonitor: MonitorBase, _scanServices: string[], _scanOptionalServices: string[]);
        private getCharacteristic(serviceUid, characteristicUid);
        private onDisconnected(event);
        private clearConnectionVars();
        connect(device: IDevice, disconnectFn: () => void): Promise<void>;
        disconnect(): void;
        startScan(foundFn?: IFoundFunc): Promise<void>;
        stopScan(): Promise<void>;
        writeCharacteristic(serviceUIID: string, characteristicUUID: string, data: ArrayBufferView): Promise<void>;
        readCharacteristic(serviceUIID: string, characteristicUUID: string): Promise<ArrayBuffer>;
        private onCharacteristicValueChanged(event);
        enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<void>;
        disableNotification(serviceUIID: string, characteristicUUID: string): Promise<void>;
    }
}
/**
 * Created by tijmen on 16-02-16.
 */
declare namespace ergometer.ble {
    interface IRecordDevice {
        address: string;
        name: string;
        rssi: number;
    }
    interface IRecordCharacteristic {
        serviceUIID: string;
        characteristicUUID: string;
        data?: string;
    }
    enum RecordingEventType {
        startScan = 0,
        scanFoundFn = 1,
        stopScan = 2,
        connect = 3,
        disconnectFn = 4,
        disconnect = 5,
        writeCharacteristic = 6,
        readCharacteristic = 7,
        enableNotification = 8,
        notificationReceived = 9,
        disableNotification = 10,
    }
    interface IRecordingItem {
        timeStamp: number;
        eventType: string;
        timeStampReturn?: number;
        data?: IRecordCharacteristic | IRecordDevice;
        error?: any;
    }
    class RecordingDriver implements IDriver {
        private _realDriver;
        private _startTime;
        private _events;
        _performanceMonitor: MonitorBase;
        constructor(performanceMonitor: MonitorBase, realDriver: IDriver);
        protected getRelativeTime(): number;
        addRecording(eventType: RecordingEventType, data?: IRecordCharacteristic | IRecordDevice): IRecordingItem;
        events: ergometer.ble.IRecordingItem[];
        clear(): void;
        startRecording(): void;
        protected recordResolveFunc(resolve: () => void, rec: IRecordingItem): () => void;
        protected recordResolveBufferFunc(resolve: (data: ArrayBuffer) => void, rec: IRecordingItem): (data: ArrayBuffer) => void;
        protected recordErrorFunc(reject: (e) => void, rec: IRecordingItem): (e) => void;
        startScan(foundFn?: IFoundFunc): Promise<void>;
        stopScan(): void;
        connect(device: IDevice, disconnectFn: () => void): Promise<void>;
        disconnect(): void;
        writeCharacteristic(serviceUIID: string, characteristicUUID: string, data: ArrayBufferView): Promise<void>;
        readCharacteristic(serviceUIID: string, characteristicUUID: string): Promise<ArrayBuffer>;
        enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<void>;
        disableNotification(serviceUIID: string, characteristicUUID: string): Promise<void>;
    }
}
/**
 * Created by tijmen on 18-02-16.
 */
declare namespace ergometer.ble {
    interface CallBackEvent extends IRecordingItem {
        resolve?: (e?: any) => void;
        reject?: (e: any) => void;
    }
    class ReplayDriver implements IDriver {
        private _realDriver;
        private _events;
        private _eventCallBackMethods;
        private _eventCallbacks;
        private _playing;
        private _eventIndex;
        private _startTime;
        private _checkQueueTimerId;
        private _performanceMonitor;
        protected getRelativeTime(): number;
        constructor(performanceMonitor: MonitorBase, realDriver: IDriver);
        readonly events: ergometer.ble.IRecordingItem[];
        protected isCallBack(eventType: RecordingEventType): boolean;
        protected isSameEvent(event1: IRecordingItem, event2: IRecordingItem): boolean;
        protected runEvent(event: IRecordingItem, queuedEvent: CallBackEvent): void;
        protected runTimedEvent(event: IRecordingItem, queuedEvent: CallBackEvent): void;
        protected removeEvent(i: number): void;
        protected checkQueue(): void;
        protected checkAllEventsProcessd(): boolean;
        protected timeNextCheck(timeStamp?: number): void;
        protected addEvent(eventType: RecordingEventType, isMethod: boolean, resolve?: (e?: any) => void, reject?: (e: any) => void, serviceUIID?: string, characteristicUUID?: string): void;
        replay(events: IRecordingItem[]): void;
        playing: boolean;
        startScan(foundFn?: IFoundFunc): Promise<void>;
        stopScan(): void;
        connect(device: IDevice, disconnectFn: () => void): Promise<void>;
        disconnect(): void;
        writeCharacteristic(serviceUIID: string, characteristicUUID: string, data: ArrayBufferView): Promise<void>;
        readCharacteristic(serviceUIID: string, characteristicUUID: string): Promise<ArrayBuffer>;
        enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<void>;
        disableNotification(serviceUIID: string, characteristicUUID: string): Promise<void>;
    }
}
declare namespace ergometer.usb {
    const USB_CSAVE_SIZE = 120;
    const WRITE_BUF_SIZE = 121;
    const REPORT_TYPE = 2;
    const CONCEPT2_VENDOR_ID = 6052;
}
declare namespace ergometer.usb {
    type DisconnectFunc = () => void;
    type Devices = IDevice[];
    interface IDevice {
        readonly vendorId: number;
        readonly productId: number;
        readonly productName: string;
        readonly serialNumber: string;
        open(disconnect: () => void, error: (err: any) => void, receiveData: (data: DataView) => void): Promise<void>;
        close(): Promise<void>;
        sendData(data: ArrayBuffer): Promise<void>;
    }
    interface IDriver {
        requestDevics(): Promise<Devices>;
    }
}
declare namespace ergometer.usb {
    class DeviceNodeHid implements IDevice {
        private _disconnect;
        private _onError;
        private _deviceInfo;
        private _hid;
        vendorId: number;
        productId: number;
        productName: string;
        serialNumber: string;
        constructor(deviceInfo: any);
        callError(err: any): void;
        private _receiveData;
        open(disconnect: DisconnectFunc, error: (err: any) => void, receiveData: (data: DataView) => void): Promise<void>;
        close(): Promise<void>;
        sendData(data: ArrayBuffer): Promise<void>;
        readData(): void;
    }
    class DriverNodeHid implements IDriver {
        requestDevics(): Promise<Devices>;
    }
}
declare namespace ergometer.usb {
    class DeviceWebHid implements IDevice {
        private _disconnect;
        private _onError;
        private _deviceInfo;
        vendorId: number;
        productId: number;
        productName: string;
        serialNumber: string;
        constructor(deviceInfo: any);
        callError(err: any): void;
        private disconnected(device);
        private received;
        private _receiveData;
        open(disconnect: DisconnectFunc, error: (err: any) => void, receiveData: (data: DataView) => void): Promise<void>;
        private detachDisconnect();
        close(): Promise<void>;
        sendData(data: ArrayBuffer): Promise<void>;
        private receivedReport(ev);
    }
    class DriverWebHid implements IDriver {
        requestDevics(): Promise<Devices>;
    }
}
declare namespace ergometer.usb {
    class DeviceCordovaHid implements IDevice {
        private _device;
        private _disconnect;
        private _onError;
        vendorId: number;
        productId: number;
        productName: string;
        serialNumber: string;
        constructor(device: any);
        callError(err: any): void;
        private disconnected(device);
        private _receiveData;
        open(disconnect: DisconnectFunc, error: (err: any) => void, receiveData: (data: DataView) => void): Promise<void>;
        close(): Promise<void>;
        sendData(data: ArrayBuffer): Promise<void>;
    }
    class DriverCordovaHid implements IDriver {
        requestDevics(): Promise<Devices>;
    }
}
/**
 * Created by tijmen on 16-01-16.
 *
 * translation of concept 2 csafe.h to typescript version  9/16/08 10:51a
 */
declare namespace ergometer.csafe.defs {
    const EXT_FRAME_START_BYTE = 240;
    const FRAME_START_BYTE = 241;
    const FRAME_END_BYTE = 242;
    const FRAME_STUFF_BYTE = 243;
    const FRAME_MAX_STUFF_OFFSET_BYTE = 3;
    const FRAME_FLG_LEN = 2;
    const EXT_FRAME_ADDR_LEN = 2;
    const FRAME_CHKSUM_LEN = 1;
    const SHORT_CMD_TYPE_MSK = 128;
    const LONG_CMD_HDR_LENGTH = 2;
    const LONG_CMD_BYTE_CNT_OFFSET = 1;
    const RSP_HDR_LENGTH = 2;
    const FRAME_STD_TYPE = 0;
    const FRAME_EXT_TYPE = 1;
    const DESTINATION_ADDR_HOST = 0;
    const DESTINATION_ADDR_ERG_MASTER = 1;
    const DESTINATION_ADDR_BROADCAST = 255;
    const DESTINATION_ADDR_ERG_DEFAULT = 253;
    const FRAME_MAXSIZE = 96;
    const INTERFRAMEGAP_MIN = 50;
    const CMDUPLIST_MAXSIZE = 10;
    const MEMORY_BLOCKSIZE = 64;
    const FORCEPLOT_BLOCKSIZE = 32;
    const HEARTBEAT_BLOCKSIZE = 32;
    const MANUFACTURE_ID = 22;
    const CLASS_ID = 2;
    const MODEL_NUM = 5;
    const UNITS_TYPE = 0;
    const SERIALNUM_DIGITS = 9;
    const HMS_FORMAT_CNT = 3;
    const YMD_FORMAT_CNT = 3;
    const ERRORCODE_FORMAT_CNT = 3;
    const CTRL_CMD_LONG_MIN = 1;
    const CFG_CMD_LONG_MIN = 16;
    const DATA_CMD_LONG_MIN = 32;
    const AUDIO_CMD_LONG_MIN = 64;
    const TEXTCFG_CMD_LONG_MIN = 96;
    const TEXTSTATUS_CMD_LONG_MIN = 101;
    const CAP_CMD_LONG_MIN = 112;
    const PMPROPRIETARY_CMD_LONG_MIN = 118;
    const CTRL_CMD_SHORT_MIN = 128;
    const STATUS_CMD_SHORT_MIN = 145;
    const DATA_CMD_SHORT_MIN = 160;
    const AUDIO_CMD_SHORT_MIN = 192;
    const TEXTCFG_CMD_SHORT_MIN = 224;
    const TEXTSTATUS_CMD_SHORT_MIN = 229;
    const enum SHORT_CTRL_CMDS {
        GETSTATUS_CMD = 128,
        RESET_CMD = 129,
        GOIDLE_CMD = 130,
        GOHAVEID_CMD = 131,
        GOINUSE_CMD = 133,
        GOFINISHED_CMD = 134,
        GOREADY_CMD = 135,
        BADID_CMD = 136,
        CTRL_CMD_SHORT_MAX = 137,
    }
    const enum SHORT_STATUS_CMDS {
        GETVERSION_CMD = 145,
        GETID_CMD = 146,
        GETUNITS_CMD = 147,
        GETSERIAL_CMD = 148,
        GETLIST_CMD = 152,
        GETUTILIZATION_CMD = 153,
        GETMOTORCURRENT_CMD = 154,
        GETODOMETER_CMD = 155,
        GETERRORCODE_CMD = 156,
        GETSERVICECODE_CMD = 157,
        GETUSERCFG1_CMD = 158,
        GETUSERCFG2_CMD = 159,
        STATUS_CMD_SHORT_MAX = 160,
    }
    const enum SHORT_DATA_CMDS {
        GETTWORK_CMD = 160,
        GETHORIZONTAL_CMD = 161,
        GETVERTICAL_CMD = 162,
        GETCALORIES_CMD = 163,
        GETPROGRAM_CMD = 164,
        GETSPEED_CMD = 165,
        GETPACE_CMD = 166,
        GETCADENCE_CMD = 167,
        GETGRADE_CMD = 168,
        GETGEAR_CMD = 169,
        GETUPLIST_CMD = 170,
        GETUSERINFO_CMD = 171,
        GETTORQUE_CMD = 172,
        GETHRCUR_CMD = 176,
        GETHRTZONE_CMD = 178,
        GETMETS_CMD = 179,
        GETPOWER_CMD = 180,
        GETHRAVG_CMD = 181,
        GETHRMAX_CMD = 182,
        GETUSERDATA1_CMD = 190,
        GETUSERDATA2_CMD = 191,
        DATA_CMD_SHORT_MAX = 192,
    }
    const enum SHORT_AUDIO_CMDS {
        GETAUDIOCHANNEL_CMD = 192,
        GETAUDIOVOLUME_CMD = 193,
        GETAUDIOMUTE_CMD = 194,
        AUDIO_CMD_SHORT_MAX = 195,
    }
    const enum SHORT_TEXTCFG_CMDS {
        ENDTEXT_CMD = 224,
        DISPLAYPOPUP_CMD = 225,
        TEXTCFG_CMD_SHORT_MAX = 226,
    }
    const enum SHORT_TEXTSTATUS_CMDS {
        GETPOPUPSTATUS_CMD = 229,
        TEXTSTATUS_CMD_SHORT_MAX = 230,
    }
    const enum LONG_CTRL_CMDS {
        AUTOUPLOAD_CMD = 1,
        UPLIST_CMD = 2,
        UPSTATUSSEC_CMD = 4,
        UPLISTSEC_CMD = 5,
        CTRL_CMD_LONG_MAX = 6,
    }
    const enum LONG_CFG_CMDS {
        IDDIGITS_CMD = 16,
        SETTIME_CMD = 17,
        SETDATE_CMD = 18,
        SETTIMEOUT_CMD = 19,
        SETUSERCFG1_CMD = 26,
        SETUSERCFG2_CMD = 27,
        CFG_CMD_LONG_MAX = 28,
    }
    const enum LONG_DATA_CMDS {
        SETTWORK_CMD = 32,
        SETHORIZONTAL_CMD = 33,
        SETVERTICAL_CMD = 34,
        SETCALORIES_CMD = 35,
        SETPROGRAM_CMD = 36,
        SETSPEED_CMD = 37,
        SETGRADE_CMD = 40,
        SETGEAR_CMD = 41,
        SETUSERINFO_CMD = 43,
        SETTORQUE_CMD = 44,
        SETLEVEL_CMD = 45,
        SETTARGETHR_CMD = 48,
        SETGOAL_CMD = 50,
        SETMETS_CMD = 51,
        SETPOWER_CMD = 52,
        SETHRZONE_CMD = 53,
        SETHRMAX_CMD = 54,
        DATA_CMD_LONG_MAX = 55,
    }
    const enum LONG_AUDIO_CMDS {
        SETCHANNELRANGE_CMD = 64,
        SETVOLUMERANGE_CMD = 65,
        SETAUDIOMUTE_CMD = 66,
        SETAUDIOCHANNEL_CMD = 67,
        SETAUDIOVOLUME_CMD = 68,
        AUDIO_CMD_LONG_MAX = 69,
    }
    const enum LONG_TEXTCFG_CMDS {
        STARTTEXT_CMD = 96,
        APPENDTEXT_CMD = 97,
        TEXTCFG_CMD_LONG_MAX = 98,
    }
    const enum LONG_TEXTSTATUS_CMDS {
        GETTEXTSTATUS_CMD = 101,
        TEXTSTATUS_CMD_LONG_MAX = 102,
    }
    const enum LONG_CAP_CMDS {
        GETCAPS_CMD = 112,
        GETUSERCAPS1_CMD = 126,
        GETUSERCAPS2_CMD = 127,
        CAP_CMD_LONG_MAX = 128,
    }
    const enum LONG_PMPROPRIETARY_CMDS {
        SETPMCFG_CMD = 118,
        SETPMDATA_CMD = 119,
        GETPMCFG_CMD = 126,
        GETPMDATA_CMD = 127,
        PMPROPRIETARY_CMD_LONG_MAX = 128,
    }
    const GETPMCFG_CMD_SHORT_MIN = 128;
    const GETPMCFG_CMD_LONG_MIN = 80;
    const SETPMCFG_CMD_SHORT_MIN = 224;
    const SETPMCFG_CMD_LONG_MIN = 0;
    const GETPMDATA_CMD_SHORT_MIN = 160;
    const GETPMDATA_CMD_LONG_MIN = 104;
    const SETPMDATA_CMD_SHORT_MIN = 208;
    const SETPMDATA_CMD_LONG_MIN = 48;
    const enum PM_SHORT_PULL_CFG_CMDS {
        PM_GET_FW_VERSION = 128,
        PM_GET_HW_VERSION = 129,
        PM_GET_HW_ADDRESS = 130,
        PM_GET_TICK_TIMEBASE = 131,
        PM_GET_HRM = 132,
        PM_GET_SCREENSTATESTATUS = 134,
        PM_GET_RACE_LANE_REQUEST = 135,
        PM_GET_ERG_LOGICALADDR_REQUEST = 136,
        PM_GET_WORKOUTTYPE = 137,
        PM_GET_DISPLAYTYPE = 138,
        PM_GET_DISPLAYUNITS = 139,
        PM_GET_LANGUAGETYPE = 140,
        PM_GET_WORKOUTSTATE = 141,
        PM_GET_INTERVALTYPE = 142,
        PM_GET_OPERATIONALSTATE = 143,
        PM_GET_LOGCARDSTATE = 144,
        PM_GET_LOGCARDSTATUS = 145,
        PM_GET_POWERUPSTATE = 146,
        PM_GET_ROWINGSTATE = 147,
        PM_GET_SCREENCONTENT_VERSION = 148,
        PM_GET_COMMUNICATIONSTATE = 149,
        PM_GET_RACEPARTICIPANTCOUNT = 150,
        PM_GET_BATTERYLEVELPERCENT = 151,
        PM_GET_RACEMODESTATUS = 152,
        PM_GET_INTERNALLOGPARAMS = 153,
        PM_GET_PRODUCTCONFIGURATION = 154,
        PM_GET_ERGSLAVEDISCOVERREQUESTSTATUS = 155,
        PM_GET_WIFICONFIG = 156,
        PM_GET_CPUTICKRATE = 157,
        PM_GET_LOGCARDCENSUS = 158,
        PM_GET_WORKOUTINTERVALCOUNT = 159,
        GETPMCFG_CMD_SHORT_MAX = 160,
    }
    const enum PM_SHORT_PULL_DATA_CMDS {
        PM_GET_WORKTIME = 160,
        PM_GET_PROJECTED_WORKTIME = 161,
        PM_GET_TOTAL_RESTTIME = 162,
        PM_GET_WORKDISTANCE = 163,
        PM_GET_TOTAL_WORKDISTANCE = 164,
        PM_GET_PROJECTED_WORKDISTANCE = 165,
        PM_GET_RESTDISTANCE = 166,
        PM_GET_TOTAL_RESTDISTANCE = 167,
        PM_GET_STROKE_500MPACE = 168,
        PM_GET_STROKE_POWER = 169,
        PM_GET_STROKE_CALORICBURNRATE = 170,
        PM_GET_SPLIT_AVG_500MPACE = 171,
        PM_GET_SPLIT_AVG_POWER = 172,
        PM_GET_SPLIT_AVG_CALORICBURNRATE = 173,
        PM_GET_SPLIT_AVG_CALORIES = 174,
        PM_GET_TOTAL_AVG_500MPACE = 175,
        PM_GET_TOTAL_AVG_POWER = 176,
        PM_GET_TOTAL_AVG_CALORICBURNRATE = 177,
        PM_GET_TOTAL_AVG_CALORIES = 178,
        PM_GET_STROKERATE = 179,
        PM_GET_SPLIT_AVG_STROKERATE = 180,
        PM_GET_TOTAL_AVG_STROKERATE = 181,
        PM_GET_AVG_HEARTRATE = 182,
        PM_GET_ENDING_AVG_HEARTRATE = 183,
        PM_GET_REST_AVG_HEARTRATE = 184,
        PM_GET_SPLITTIME = 185,
        PM_GET_LASTSPLITTIME = 186,
        PM_GET_SPLITDISTANCE = 187,
        PM_GET_LASTSPLITDISTANCE = 188,
        PM_GET_LASTRESTDISTANCE = 189,
        PM_GET_TARGETPACETIME = 190,
        PM_GET_STROKESTATE = 191,
        PM_GET_STROKERATESTATE = 192,
        PM_GET_DRAGFACTOR = 193,
        PM_GET_ENCODERPERIOD = 194,
        PM_GET_HEARTRATESTATE = 195,
        PM_GET_SYNCDATA = 196,
        PM_GET_SYNCDATAALL = 197,
        PM_GET_RACEDATA = 198,
        PM_GET_TICKTIME = 199,
        PM_GET_ERRORTYPE = 200,
        PM_GET_ERRORVALUE = 201,
        PM_GET_STATUSTYPE = 202,
        PM_GET_STATUSVALUE = 203,
        PM_GET_EPMSTATUS = 204,
        PM_GET_DISPLAYUPDATETIME = 205,
        PM_GET_SYNCFRACTIONALTIME = 206,
        PM_GET_RESTTIME = 207,
        GETPMDATA_CMD_SHORT_MAX = 208,
    }
    const enum PM_SHORT_PUSH_DATA_CMDS {
        PM_SET_SYNC_DISTANCE = 208,
        PM_SET_SYNC_STROKEPACE = 209,
        PM_SET_SYNC_AVG_HEARTRATE = 210,
        PM_SET_SYNC_TIME = 211,
        PM_SET_SYNC_SPLIT_DATA = 212,
        PM_SET_SYNC_ENCODER_PERIOD = 213,
        PM_SET_SYNC_VERSION_INFO = 214,
        PM_SET_SYNC_RACETICKTIME = 215,
        PM_SET_SYNC_DATAALL = 216,
        SETPMDATA_CMD_SHORT_MAX = 217,
    }
    const enum PM_SHORT_PUSH_CFG_CMDS {
        PM_SET_RESET_ALL = 224,
        PM_SET_RESET_ERGNUMBER = 225,
        SETPMCFG_CMD_SHORT_MAX = 226,
    }
    const enum PM_LONG_PUSH_CFG_CMDS {
        PM_SET_BAUDRATE = 0,
        PM_SET_WORKOUTTYPE = 1,
        PM_SET_STARTTYPE = 2,
        PM_SET_WORKOUTDURATION = 3,
        PM_SET_RESTDURATION = 4,
        PM_SET_SPLITDURATION = 5,
        PM_SET_TARGETPACETIME = 6,
        PM_SET_INTERVALIDENTIFIER = 7,
        PM_SET_OPERATIONALSTATE = 8,
        PM_SET_RACETYPE = 9,
        PM_SET_WARMUPDURATION = 10,
        PM_SET_RACELANESETUP = 11,
        PM_SET_RACELANEVERIFY = 12,
        PM_SET_RACESTARTPARAMS = 13,
        PM_SET_ERGSLAVEDISCOVERYREQUEST = 14,
        PM_SET_BOATNUMBER = 15,
        PM_SET_ERGNUMBER = 16,
        PM_SET_COMMUNICATIONSTATE = 17,
        PM_SET_CMDUPLIST = 18,
        PM_SET_SCREENSTATE = 19,
        PM_CONFIGURE_WORKOUT = 20,
        PM_SET_TARGETAVGWATTS = 21,
        PM_SET_TARGETCALSPERHR = 22,
        PM_SET_INTERVALTYPE = 23,
        PM_SET_WORKOUTINTERVALCOUNT = 24,
        PM_SET_DISPLAYUPDATERATE = 25,
        PM_SET_AUTHENPASSWORD = 26,
        PM_SET_TICKTIME = 27,
        PM_SET_TICKTIMEOFFSET = 28,
        PM_SET_RACEDATASAMPLETICKS = 29,
        PM_SET_RACEOPERATIONTYPE = 30,
        PM_SET_RACESTATUSDISPLAYTICKS = 31,
        PM_SET_RACESTATUSWARNINGTICKS = 32,
        PM_SET_RACEIDLEMODEPARAMS = 33,
        PM_SET_DATETIME = 34,
        PM_SET_LANGUAGETYPE = 35,
        PM_SET_WIFICONFIG = 36,
        PM_SET_CPUTICKRATE = 37,
        PM_SET_LOGCARDUSER = 38,
        PM_SET_SCREENERRORMODE = 39,
        PM_SET_CABLETEST = 40,
        PM_SET_USER_ID = 41,
        PM_SET_USER_PROFILE = 42,
        PM_SET_HRM = 43,
        PM_SET_SENSOR_CHANNEL = 47,
        SETPMCFG_CMD_LONG_MAX = 48,
    }
    const enum PM_LONG_PUSH_DATA_CMDS {
        PM_SET_TEAM_DISTANCE = 48,
        PM_SET_TEAM_FINISH_TIME = 49,
        PM_SET_RACEPARTICIPANT = 50,
        PM_SET_RACESTATUS = 51,
        PM_SET_LOGCARDMEMORY = 52,
        PM_SET_DISPLAYSTRING = 53,
        PM_SET_DISPLAYBITMAP = 54,
        PM_SET_LOCALRACEPARTICIPANT = 55,
        PM_SET_ANTRFMODE = 78,
        PM_SET_MEMORY = 79,
        SETPMDATA_CMD_LONG_MAX = 80,
    }
    const enum PM_LONG_PULL_CFG_CMDS {
        PM_GET_ERGNUMBER = 80,
        PM_GET_ERGNUMBERREQUEST = 81,
        PM_GET_USERIDSTRING = 82,
        PM_GET_LOCALRACEPARTICIPANT = 83,
        PM_GET_USER_ID = 84,
        PM_GET_USER_PROFILE = 85,
        GETPMCFG_CMD_LONG_MAX = 86,
    }
    const enum PM_LONG_PULL_DATA_CMDS {
        PM_GET_MEMORY = 104,
        PM_GET_LOGCARDMEMORY = 105,
        PM_GET_INTERNALLOGMEMORY = 106,
        PM_GET_FORCEPLOTDATA = 107,
        PM_GET_HEARTBEATDATA = 108,
        PM_GET_UI_EVENTS = 109,
        CSAFE_PM_GET_STROKESTATS = 110,
        CSAFE_PM_GET_DIAGLOG_RECORD_NUM = 112,
        CSAFE_PM_GET_DIAGLOG_RECORD = 113,
        GETPMDATA_CMD_LONG_MAX = 114,
    }
    const PREVOK_FLG = 0;
    const PREVREJECT_FLG = 16;
    const PREVBAD_FLG = 32;
    const PREVNOTRDY_FLG = 48;
    const PREVFRAMESTATUS_MSK = 48;
    const SLAVESTATE_ERR_FLG = 0;
    const SLAVESTATE_RDY_FLG = 1;
    const SLAVESTATE_IDLE_FLG = 2;
    const SLAVESTATE_HAVEID_FLG = 3;
    const SLAVESTATE_INUSE_FLG = 5;
    const SLAVESTATE_PAUSE_FLG = 6;
    const SLAVESTATE_FINISH_FLG = 7;
    const SLAVESTATE_MANUAL_FLG = 8;
    const SLAVESTATE_OFFLINE_FLG = 9;
    const FRAMECNT_FLG = 128;
    const SLAVESTATE_MSK = 15;
    const AUTOSTATUS_FLG = 1;
    const UPSTATUS_FLG = 2;
    const UPLIST_FLG = 4;
    const ACK_FLG = 16;
    const EXTERNCONTROL_FLG = 64;
    const CAPCODE_PROTOCOL = 0;
    const CAPCODE_POWER = 1;
    const CAPCODE_TEXT = 2;
    const DISTANCE_MILE_0_0 = 1;
    const DISTANCE_MILE_0_1 = 2;
    const DISTANCE_MILE_0_2 = 3;
    const DISTANCE_MILE_0_3 = 4;
    const DISTANCE_FEET_0_0 = 5;
    const DISTANCE_INCH_0_0 = 6;
    const WEIGHT_LBS_0_0 = 7;
    const WEIGHT_LBS_0_1 = 8;
    const DISTANCE_FEET_1_0 = 10;
    const SPEED_MILEPERHOUR_0_0 = 16;
    const SPEED_MILEPERHOUR_0_1 = 17;
    const SPEED_MILEPERHOUR_0_2 = 18;
    const SPEED_FEETPERMINUTE_0_0 = 19;
    const DISTANCE_KM_0_0 = 33;
    const DISTANCE_KM_0_1 = 34;
    const DISTANCE_KM_0_2 = 35;
    const DISTANCE_METER_0_0 = 36;
    const DISTANCE_METER_0_1 = 37;
    const DISTANCE_CM_0_0 = 38;
    const WEIGHT_KG_0_0 = 39;
    const WEIGHT_KG_0_1 = 40;
    const SPEED_KMPERHOUR_0_0 = 48;
    const SPEED_KMPERHOUR_0_1 = 49;
    const SPEED_KMPERHOUR_0_2 = 50;
    const SPEED_METERPERMINUTE_0_0 = 51;
    const PACE_MINUTEPERMILE_0_0 = 55;
    const PACE_MINUTEPERKM_0_0 = 56;
    const PACE_SECONDSPERKM_0_0 = 57;
    const PACE_SECONDSPERMILE_0_0 = 58;
    const DISTANCE_FLOORS_0_0 = 65;
    const DISTANCE_FLOORS_0_1 = 66;
    const DISTANCE_STEPS_0_0 = 67;
    const DISTANCE_REVS_0_0 = 68;
    const DISTANCE_STRIDES_0_0 = 69;
    const DISTANCE_STROKES_0_0 = 70;
    const MISC_BEATS_0_0 = 71;
    const ENERGY_CALORIES_0_0 = 72;
    const GRADE_PERCENT_0_0 = 74;
    const GRADE_PERCENT_0_2 = 75;
    const GRADE_PERCENT_0_1 = 76;
    const CADENCE_FLOORSPERMINUTE_0_1 = 79;
    const CADENCE_FLOORSPERMINUTE_0_0 = 80;
    const CADENCE_STEPSPERMINUTE_0_0 = 81;
    const CADENCE_REVSPERMINUTE_0_0 = 82;
    const CADENCE_STRIDESPERMINUTE_0_0 = 83;
    const CADENCE_STROKESPERMINUTE_0_0 = 84;
    const MISC_BEATSPERMINUTE_0_0 = 85;
    const BURN_CALORIESPERMINUTE_0_0 = 86;
    const BURN_CALORIESPERHOUR_0_0 = 87;
    const POWER_WATTS_0_0 = 88;
    const ENERGY_INCHLB_0_0 = 90;
    const ENERGY_FOOTLB_0_0 = 91;
    const ENERGY_NM_0_0 = 92;
    const KG_TO_LBS = 2.2046;
    const LBS_TO_KG: number;
    const IDDIGITS_MIN = 2;
    const IDDIGITS_MAX = 5;
    const DEFAULT_IDDIGITS = 5;
    const DEFAULT_ID = 0;
    const MANUAL_ID = 999999999;
    const DEFAULT_SLAVESTATE_TIMEOUT = 20;
    const PAUSED_SLAVESTATE_TIMEOUT = 220;
    const INUSE_SLAVESTATE_TIMEOUT = 6;
    const IDLE_SLAVESTATE_TIMEOUT = 30;
    const BASE_YEAR = 1900;
    const DEFAULT_STATUSUPDATE_INTERVAL = 256;
    const DEFAULT_CMDUPLIST_INTERVAL = 256;
}
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 * this is the core, you do not have to change this code.
 *
 */
declare namespace ergometer.csafe {
    const enum SlaveState {
        ERROR = 0,
        READY = 1,
        IDLE = 2,
        HAVEID = 3,
        INUSE = 5,
        PAUZED = 6,
        FINISHED = 7,
        MANUAL = 8,
        OFFLINE = 9,
    }
    const enum PrevFrameState {
        OK = 0,
        REJECT = 1,
        BAD = 2,
        NOT_READY = 3,
    }
    interface ICommandParamsBase {
        onError?: ErrorHandler;
        onDataReceived?: (data: any) => void;
    }
    interface IRawCommand {
        waitForResponse: boolean;
        command: number;
        detailCommand?: number;
        data?: number[];
        onDataReceived?: (data: DataView) => void;
        onError?: ErrorHandler;
        responseBuffer?: IResponseBuffer;
    }
    interface IBuffer {
        rawCommands: IRawCommand[];
        addRawCommand(info: IRawCommand): any;
        send(success?: () => void, error?: ErrorHandler): Promise<void>;
    }
    interface IResponseBuffer {
        monitorStatus: ergometer.csafe.SlaveState;
        prevFrameState: ergometer.csafe.PrevFrameState;
        commands: csafe.IRawCommand[];
    }
    interface ICommand {
        (buffer: IBuffer, monitor: PerformanceMonitorBase): void;
    }
    class CommandManagager {
        private _commands;
        register(createCommand: ICommand): void;
        apply(buffer: IBuffer, monitor: PerformanceMonitorBase): void;
    }
    var commandManager: CommandManagager;
    interface ICommandSetStandardValue extends ICommandParamsBase {
        value: number;
    }
    function registerStandardSet<T extends ICommandParamsBase>(functionName: string, command: number, setParams: (params: T) => number[]): void;
    function registerStandardSetConfig<T extends ICommandParamsBase>(functionName: string, command: number, setParams: (params: T) => number[]): void;
    function registerStandardShortGet<T extends ICommandParamsBase, U>(functionName: string, command: number, converter: (data: DataView) => U): void;
    function registerStandardLongGet<T extends ICommandParamsBase, U>(functionName: string, detailCommand: number, converter: (data: DataView) => U): void;
}
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
declare namespace ergometer.csafe {
    interface ICommandStrokeState extends ICommandParamsBase {
        onDataReceived: (state: StrokeState) => void;
    }
    interface IBuffer {
        getStrokeState(params: ICommandStrokeState): IBuffer;
    }
    interface ICommandDragFactor extends ICommandParamsBase {
        onDataReceived: (state: number) => void;
    }
    interface IBuffer {
        getDragFactor(params: ICommandDragFactor): IBuffer;
    }
    interface ICommandWorkDistance extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getWorkDistance(params: ICommandWorkDistance): IBuffer;
    }
    interface ICommandWorkTime extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getWorkTime(params: ICommandWorkTime): IBuffer;
    }
    interface ICommandPowerCurve {
        onDataReceived: (curve: number[]) => void;
        onError?: ErrorHandler;
    }
    interface IBuffer {
        getPowerCurve(params: ICommandPowerCurve): IBuffer;
    }
    interface ICommandStrokeStats {
        onDataReceived: (driveTime: number, strokeRecoveryTime: number) => void;
        onError?: ErrorHandler;
    }
    interface IBuffer {
        getStrokeStats(params: ICommandStrokeStats): IBuffer;
    }
    interface ICommandGetWorkoutType extends ICommandParamsBase {
        onDataReceived: (value: WorkoutType) => void;
    }
    interface IBuffer {
        getWorkoutType(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetWorkoutState extends ICommandParamsBase {
        onDataReceived: (value: WorkoutState) => void;
    }
    interface IBuffer {
        getWorkoutState(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetWorkoutIntervalCount extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getWorkoutIntervalCount(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetWorkoutIntervalType extends ICommandParamsBase {
        onDataReceived: (value: IntervalType) => void;
    }
    interface IBuffer {
        getWorkoutIntervalType(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetWorkoutIntervalRestTime extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getWorkoutIntervalRestTime(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetWork extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getWork(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandProgramParams extends ICommandParamsBase {
        value: Program;
    }
    interface IBuffer {
        setProgram(params: ICommandProgramParams): IBuffer;
    }
    interface ICommandTimeParams extends ICommandParamsBase {
        hour: number;
        minute: number;
        second: number;
    }
    interface IBuffer {
        setTime(params: ICommandTimeParams): IBuffer;
    }
    interface ICommandDateParams extends ICommandParamsBase {
        year: number;
        month: number;
        day: number;
    }
    interface IBuffer {
        setDate(params: ICommandDateParams): IBuffer;
    }
    interface IBuffer {
        setTimeout(params: ICommandSetStandardValue): IBuffer;
    }
    interface IBuffer {
        setWork(params: ICommandTimeParams): IBuffer;
    }
    interface ICommandDistanceParams extends ICommandSetStandardValue {
        unit: Unit;
    }
    interface IBuffer {
        setDistance(params: ICommandDistanceParams): IBuffer;
    }
    interface IBuffer {
        setTotalCalories(params: ICommandSetStandardValue): IBuffer;
    }
    interface ICommandPowerParams extends ICommandSetStandardValue {
        unit: Unit;
    }
    interface IBuffer {
        setPower(params: ICommandPowerParams): IBuffer;
    }
}
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
declare namespace ergometer.csafe {
    interface IVersion {
        ManufacturerId: number;
        CID: number;
        Model: number;
        HardwareVersion: number;
        FirmwareVersion: number;
    }
    interface ICommandGetVersion extends ICommandParamsBase {
        onDataReceived: (version: IVersion) => void;
    }
    interface IBuffer {
        getVersion(params: ICommandGetVersion): IBuffer;
    }
    interface IDistance {
        value: number;
        unit: Unit;
    }
    interface ICommandGetDistance extends ICommandParamsBase {
        onDataReceived: (version: IDistance) => void;
    }
    interface IBuffer {
        getDistance(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetPace extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getPace(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetPower extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getPower(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetCadence extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getCadence(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetHorizontal extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getHorizontal(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandGetCalories extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getCalories(params: ICommandParamsBase): IBuffer;
    }
    interface ICommandHeartRate extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    interface IBuffer {
        getHeartRate(params: ICommandParamsBase): IBuffer;
    }
}
/**
 * Created by tijmen on 06-02-16.
 */
declare namespace ergometer.csafe {
    interface ICommandSetWorkOutType extends ICommandParamsBase {
        value: WorkoutType;
    }
    interface IBuffer {
        setWorkoutType(params: ICommandSetWorkOutType): IBuffer;
    }
}
/**
 * Created by tijmen on 28-12-15.
 */
declare namespace ergometer {
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
        justRowNoSplits = 0,
        justRowSplits = 1,
        fixedDistanceNoAplits = 2,
        fixedDistanceSplits = 3,
        fixedTimeNoAplits = 4,
        fixedTimeAplits = 5,
        fixedTimeInterval = 6,
        fixedDistanceInterval = 7,
        variableInterval = 8,
        variableUndefinedRestInterval = 9,
        fixedCalorie = 10,
        fixedWattMinutes = 11,
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
    const enum Program {
        Programmed = 0,
        StandardList1 = 1,
        StandardList2 = 2,
        StandardList3 = 3,
        StandardList4 = 4,
        StandardList5 = 5,
        CustomList1 = 6,
        CustomList2 = 7,
        CustomList3 = 8,
        CustomList4 = 9,
        CustomList5 = 10,
        FavoritesList1 = 11,
        FavoritesList2 = 12,
        FavoritesList3 = 13,
        FavoritesList4 = 14,
        FavoritesList5 = 15,
    }
    const enum Unit {
        distanceMile = 1,
        distanceMile1 = 2,
        distanceMile2 = 3,
        distanceMile3 = 4,
        distanceFeet = 5,
        distanceInch = 6,
        weightLbs = 7,
        weightLbs1 = 8,
        distanceFeet10 = 10,
        speedMilePerHour = 16,
        speedMilePerHour1 = 17,
        speedMilePerHour2 = 18,
        speedFeetPerMinute = 19,
        distanceKm = 33,
        distanceKm1 = 34,
        distanceKm2 = 35,
        distanceMeter = 36,
        distanceMeter1 = 37,
        distance_cm = 38,
        weightKg = 39,
        weightKg1 = 40,
        speedKmPerHour = 48,
        speedKmPerHour1 = 49,
        speedKmPerHour2 = 50,
        speedMeterPerMinute = 51,
        paceMinutePermile = 55,
        paceMinutePerkm = 56,
        paceSecondsPerkm = 57,
        paceSecondsPermile = 58,
        distanceFloors = 65,
        distanceFloors1 = 66,
        distanceSteps = 67,
        distanceRevs = 68,
        distanceStrides = 69,
        distanceStrokes = 70,
        miscBeats = 71,
        energyCalories = 72,
        gradePercent = 74,
        gradePercent2 = 75,
        gradePercent1 = 76,
        cadenceFloorsPerMinute1 = 79,
        cadenceFloorsPerMinute = 80,
        cadenceStepsPerMinute = 81,
        cadenceRevsPerMinute = 82,
        cadenceStridesPerMinute = 83,
        cadenceStrokesPerMinute = 84,
        miscBeatsPerMinute = 85,
        burnCaloriesPerMinute = 86,
        burnCaloriesPerHour = 87,
        powerWatts = 88,
        energyInchlb = 90,
        energyFootlb = 91,
        energyNm = 92,
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
declare namespace ergometer {
    import IRawCommand = ergometer.csafe.IRawCommand;
    interface SendBufferQueued {
        commandArray: number[];
        resolve: () => void;
        reject: (e) => void;
        rawCommandBuffer: IRawCommand[];
    }
    interface ParsedCSafeCommand {
        command: number;
        detailCommand: number;
        data: Uint8Array;
    }
    const enum FrameState {
        initial = 0,
        statusByte = 1,
        parseCommand = 2,
        parseCommandLength = 3,
        parseDetailCommand = 4,
        parseDetailCommandLength = 5,
        parseCommandData = 6,
    }
    interface PowerCurveEvent extends pubSub.ISubscription {
        (data: number[]): void;
    }
    class WaitResponseBuffer implements ergometer.csafe.IResponseBuffer {
        command: number;
        commandDataIndex: number;
        commandData: Uint8Array;
        frameState: FrameState;
        nextDataLength: number;
        detailCommand: number;
        statusByte: number;
        monitorStatus: ergometer.csafe.SlaveState;
        prevFrameState: ergometer.csafe.PrevFrameState;
        calcCheck: number;
        private _monitor;
        private _commands;
        _resolve: () => void;
        _responseState: number;
        private _timeOutHandle;
        stuffByteActive: boolean;
        endCommand: number;
        readonly commands: csafe.IRawCommand[];
        removeRemainingCommands(): void;
        private timeOut();
        constructor(monitor: PerformanceMonitorBase, resolve: () => void, reject: (e) => void, commands: csafe.IRawCommand[], timeOut: number);
        remove(): void;
        processedBuffer(): void;
        removedWithError(e: any): void;
        receivedCSaveCommand(parsed: ParsedCSafeCommand): void;
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
    class PerformanceMonitorBase extends MonitorBase {
        private _waitResonseBuffers;
        protected _powerCurve: number[];
        protected _splitCommandsWhenToBig: boolean;
        protected _receivePartialBuffers: boolean;
        private _powerCurveEvent;
        private _checksumCheckEnabled;
        protected _commandTimeout: number;
        sortCommands: boolean;
        private _sendBufferQueue;
        protected initialize(): void;
        removeResponseBuffer(buffer: WaitResponseBuffer): void;
        protected enableDisableNotification(): Promise<void>;
        /**
         * returns error and other log information. Some errors can only be received using the logEvent
         * @returns {pubSub.Event<LogEvent>}
         */
        readonly powerCurveEvent: pubSub.Event<ergometer.PowerCurveEvent>;
        readonly powerCurve: number[];
        protected clearAllBuffers(): void;
        protected beforeConnected(): void;
        protected clearWaitResponseBuffers(): void;
        protected driver_write(data: ArrayBufferView): Promise<void>;
        /**
         *  send everyt thing which is put into the csave buffer
         *
         * @param success
         * @param error
         * @returns {Promise<void>|Promise} use promis instead of success and error function
         */
        sendCSafeBuffer(csafeBuffer: ergometer.csafe.IBuffer): Promise<void>;
        protected checkSendBufferAtEnd(): void;
        protected checkSendBuffer(): void;
        protected sendBufferFromQueue(sendData: SendBufferQueued): void;
        protected sendCsafeCommands(byteArray: number[]): Promise<void>;
        protected moveToNextBuffer(): WaitResponseBuffer;
        handeReceivedDriverData(dataView: DataView): void;
        protected getPacketSize(): number;
        newCsafeBuffer(): ergometer.csafe.IBuffer;
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
declare namespace ergometer {
    class UsbDevice {
        vendorId: number;
        productId: number;
        productName: string;
        serialNumber: string;
    }
    type UsbDevices = UsbDevice[];
    interface StrokeStateChangedEvent extends pubSub.ISubscription {
        (oldState: StrokeState, newState: StrokeState, duration: number): void;
    }
    interface TrainingDataEvent extends pubSub.ISubscription {
        (data: TrainingData): void;
    }
    interface StrokeDataEvent extends pubSub.ISubscription {
        (data: StrokeData): void;
    }
    class StrokeData {
        dragFactor: number;
        workDistance: number;
        workTime: number;
        splitTime: number;
        power: number;
        strokesPerMinuteAverage: number;
        strokesPerMinute: number;
        distance: number;
        totCalories: number;
        caloriesPerHour: number;
        heartRate: number;
    }
    class TrainingData {
        workoutType: WorkoutType;
        duration: number;
        distance: number;
        workoutState: WorkoutState;
        workoutIntervalCount: number;
        intervalType: IntervalType;
        restTime: number;
        endDistance: number;
        endDuration: number;
    }
    class PerformanceMonitorUsb extends PerformanceMonitorBase {
        private _driver;
        private _device;
        private _nSPMReads;
        private _nSPM;
        private _strokeStateEvent;
        private _trainingDataEvent;
        private _strokeDataEvent;
        private _strokeData;
        private _trainingData;
        private _strokeState;
        private _lastTrainingTime;
        private _lastLowResUpdate;
        readonly strokeData: StrokeData;
        readonly trainingData: TrainingData;
        readonly strokeState: StrokeState;
        readonly device: ergometer.usb.IDevice;
        readonly strokeStateEvent: pubSub.Event<StrokeStateChangedEvent>;
        readonly trainingDataEvent: pubSub.Event<TrainingDataEvent>;
        readonly strokeDataEvent: pubSub.Event<StrokeDataEvent>;
        static canUseNodeHid(): boolean;
        static canUseWebHid(): boolean;
        static canUseCordovaHid(): boolean;
        static canUseUsb(): boolean;
        protected initialize(): void;
        driver: ergometer.usb.IDriver;
        protected driver_write(data: ArrayBufferView): Promise<void>;
        private receiveData(data);
        sendCSafeBuffer(csafeBuffer: ergometer.csafe.IBuffer): Promise<void>;
        requestDevics(): Promise<UsbDevices>;
        disconnect(): void;
        private disconnected();
        connectToDevice(device: UsbDevice): Promise<void>;
        protected getPacketSize(): number;
        protected highResolutionUpdate(): Promise<void>;
        private handlePowerCurve();
        protected connected(): void;
        private _autoUpdating;
        private listeningToEvents();
        protected autoUpdate(first?: boolean): void;
        protected isWaiting(): boolean;
        protected nextAutoUpdate(): void;
        protected update(): Promise<void>;
        private _startPhaseTime;
        protected calcStrokeStateDuration(): number;
        protected lowResolutionUpdate(): Promise<void>;
        protected newStrokeState(state: StrokeState): void;
        protected trainingDataUpdate(): Promise<void>;
        private resetStartRowing();
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
declare namespace ergometer {
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
    class PerformanceMonitorBle extends PerformanceMonitorBase {
        private _driver;
        private _recordingDriver;
        private _replayDriver;
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
        private _generalStatusEventAttachedByPowerCurve;
        private _recording;
        protected readonly recordingDriver: ergometer.ble.RecordingDriver;
        driver: ble.IDriver;
        recording: boolean;
        readonly replayDriver: ble.ReplayDriver;
        replaying: boolean;
        replay(events: ble.IRecordingItem[]): void;
        recordingEvents: ble.IRecordingItem[];
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
        readonly devices: ergometer.DeviceInfo[];
        /**
         * The values of the last rowingGeneralStatus event
         *
         * @returns {RowingGeneralStatus}
         */
        readonly rowingGeneralStatus: RowingGeneralStatus;
        /**
         * The values of the last rowingAdditionalStatus1 event
         * @returns {RowingAdditionalStatus1}
         */
        readonly rowingAdditionalStatus1: RowingAdditionalStatus1;
        /**
         * The values of the last RowingAdditionalStatus2 event
         * @returns {RowingAdditionalStatus2}
         */
        readonly rowingAdditionalStatus2: RowingAdditionalStatus2;
        /**
         *  The values of the last rowingStrokeData event
         * @returns {RowingStrokeData}
         */
        readonly rowingStrokeData: RowingStrokeData;
        /**
         * The values of the last rowingAdditionalStrokeData event
         * @returns {RowingAdditionalStrokeData}
         */
        readonly rowingAdditionalStrokeData: RowingAdditionalStrokeData;
        /**
         * The values of the last rowingSplitIntervalData event
         * @returns {RowingSplitIntervalData}
         */
        readonly rowingSplitIntervalData: RowingSplitIntervalData;
        /**
         * The values of the last rowingAdditionalSplitIntervalData event
         * @returns {RowingAdditionalSplitIntervalData}
         */
        readonly rowingAdditionalSplitIntervalData: RowingAdditionalSplitIntervalData;
        /**
         * The values of the last workoutSummaryData event
         * @returns {WorkoutSummaryData}
         */
        readonly workoutSummaryData: WorkoutSummaryData;
        /**
         * The values of the last additionalWorkoutSummaryData event
         * @returns {AdditionalWorkoutSummaryData}
         */
        readonly additionalWorkoutSummaryData: AdditionalWorkoutSummaryData;
        /**
         * The values of the last AdditionalWorkoutSummaryData2 event
         * @returns {AdditionalWorkoutSummaryData2}
         */
        readonly additionalWorkoutSummaryData2: AdditionalWorkoutSummaryData2;
        /**
         * The values of the last heartRateBeltInformation event
         * @returns {HeartRateBeltInformation}
         */
        readonly heartRateBeltInformation: HeartRateBeltInformation;
        /**
         * read rowingGeneralStatus data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingGeneralStatusEvent>}
         */
        readonly rowingGeneralStatusEvent: pubSub.Event<RowingGeneralStatusEvent>;
        /**
         * read rowingGeneralStatus1 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus1Event>}
         */
        readonly rowingAdditionalStatus1Event: pubSub.Event<RowingAdditionalStatus1Event>;
        /**
         * read rowingAdditionalStatus2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus2Event>}
         */
        readonly rowingAdditionalStatus2Event: pubSub.Event<RowingAdditionalStatus2Event>;
        /**
         * read rowingStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingStrokeDataEvent>}
         */
        readonly rowingStrokeDataEvent: pubSub.Event<RowingStrokeDataEvent>;
        /**
         * read rowingAdditionalStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStrokeDataEvent>}
         */
        readonly rowingAdditionalStrokeDataEvent: pubSub.Event<RowingAdditionalStrokeDataEvent>;
        /**
         * read rowingSplitIntervalDat data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingSplitIntervalDataEvent>}
         */
        readonly rowingSplitIntervalDataEvent: pubSub.Event<RowingSplitIntervalDataEvent>;
        /**
         * read rowingAdditionalSplitIntervalData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalSplitIntervalDataEvent>}
         */
        readonly rowingAdditionalSplitIntervalDataEvent: pubSub.Event<RowingAdditionalSplitIntervalDataEvent>;
        /**
         * read workoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<WorkoutSummaryDataEvent>}
         */
        readonly workoutSummaryDataEvent: pubSub.Event<WorkoutSummaryDataEvent>;
        /**
         * read additionalWorkoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryDataEvent>}
         */
        readonly additionalWorkoutSummaryDataEvent: pubSub.Event<AdditionalWorkoutSummaryDataEvent>;
        /**
         * read additionalWorkoutSummaryData2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryData2Event>}
         */
        readonly additionalWorkoutSummaryData2Event: pubSub.Event<AdditionalWorkoutSummaryData2Event>;
        /**
         * read heartRateBeltInformation data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<HeartRateBeltInformationEvent>}
         */
        readonly heartRateBeltInformationEvent: pubSub.Event<HeartRateBeltInformationEvent>;
        /**
         * Get device information of the connected device.
         * @returns {DeviceInfo}
         */
        readonly deviceInfo: ergometer.DeviceInfo;
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
        disconnect(): void;
        protected clearAllBuffers(): void;
        /**
         *
         */
        protected enableMultiplexNotification(): Promise<void>;
        /**
         *
         */
        protected disableMultiPlexNotification(): Promise<void>;
        private _registeredGuids;
        protected clearRegisterdGuids(): void;
        protected enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<void>;
        protected disableNotification(serviceUIID: string, characteristicUUID: string): Promise<void>;
        /**
         *
         */
        protected enableDisableNotification(): Promise<void>;
        protected onPowerCurveRowingGeneralStatus(data: ergometer.RowingGeneralStatus): void;
        currentDriverIsWebBlueTooth(): boolean;
        /**
         *
         */
        protected initialize(): void;
        /**
         * When low level initialization complete, this function is called.
         */
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
        stopScan(): void;
        /**
         * Scan for device use the deviceFound to connect .
         * @param deviceFound
         */
        startScan(deviceFound: (device: DeviceInfo) => boolean, errorFn?: ErrorHandler): Promise<void>;
        /**
         * connect to a specific device. This should be a PM5 device which is found by the startScan. You can
         * only call this function after startScan is called. Connection to a device will stop the scan.
         * @param deviceName
         */
        connectToDevice(deviceName: string): Promise<void>;
        /**
         * the promise is never fail
         * @param serviceUUID
         * @param UUID
         * @param readValue
         */
        protected readStringCharacteristic(serviceUUID: string, UUID: string): Promise<string>;
        /**
         * the promise will never fail
         * @param done
         */
        protected readSampleRate(): Promise<void>;
        /**
         *
         * @param done
         */
        protected readPheripheralInfo(): Promise<void>;
        /**
         *
         * @param data
         */
        protected handleRowingGeneralStatus(data: DataView): void;
        protected calcPace(lowByte: any, highByte: number): number;
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
        handleCSafeNotifications(): Promise<void>;
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
        protected driver_write(data: ArrayBufferView): Promise<void>;
        protected getPacketSize(): number;
    }
}
declare namespace ergometer {
    interface HeartRateDeviceInfo {
        connected: boolean;
        name: string;
        address: string;
        quality: number;
    }
    interface HeartRateData {
        heartRate?: number;
        rrIntervals?: number[];
        energyExpended?: number;
        contactDetected?: boolean;
    }
    interface HeartRateDataEvent extends pubSub.ISubscription {
        (data: HeartRateData): void;
    }
    class HeartRateMonitorBle extends MonitorBase {
        private _driver;
        private _deviceInfo;
        private _devices;
        private _heartRateDataEvent;
        readonly driver: ergometer.ble.IDriver;
        readonly heartRateDataEvent: pubSub.Event<HeartRateDataEvent>;
        protected initialize(): void;
        disconnect(): void;
        readonly deviceInfo: ergometer.HeartRateDeviceInfo;
        private _registeredGuids;
        currentDriverIsWebBlueTooth(): boolean;
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
        stopScan(): void;
        /**
         * Scan for device use the deviceFound to connect .
         * @param deviceFound
         */
        startScan(deviceFound: (device: HeartRateDeviceInfo) => boolean, errorFn?: ErrorHandler): Promise<void>;
        /**
         * connect to a specific device. This should be a PM5 device which is found by the startScan. You can
         * only call this function after startScan is called. Connection to a device will stop the scan.
         * @param deviceName
         */
        connectToDevice(deviceName: string): Promise<void>;
        protected deviceConnected(): void;
        protected handleDataHeartRate(data: ArrayBuffer): void;
    }
}
