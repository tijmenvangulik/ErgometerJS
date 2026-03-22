/**
 * Created by tijmen on 25-12-15.
 */
/** @internal */
var ergometer;
/**
 * Created by tijmen on 25-12-15.
 */
/** @internal */
(function (ergometer) {
    var utils;
    (function (utils) {
        function getByte(value, byteIndex) {
            return (value >> (byteIndex * 8)) & 255;
        }
        utils.getByte = getByte;
        function copyArrayBuffer(src) {
            var dst = new ArrayBuffer(src.byteLength);
            new Uint8Array(dst).set(new Uint8Array(src));
            return dst;
        }
        utils.copyArrayBuffer = copyArrayBuffer;
        /**
        * Interpret byte buffer as unsigned little endian 32 bit integer.
        * Returns converted number.
        * @param {ArrayBuffer} data - Input buffer.
        * @param {number} offset - Start of data.
        * @return Converted number.
        * @public
        */
        function getUint24(data, offset) {
            return (data.getUint8(offset + 2) << 16) +
                (data.getUint8(offset + 1) << 8) +
                (data.getUint8(offset));
        }
        utils.getUint24 = getUint24;
        function bufferToString(buf) {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }
        utils.bufferToString = bufferToString;
        function valueToNullValue(value, nullValue) {
            if (value == nullValue)
                return null;
            else
                return value;
        }
        utils.valueToNullValue = valueToNullValue;
        function isDefined(variable) {
            return typeof variable !== 'undefined';
        }
        utils.isDefined = isDefined;
        /**
         * Takes a ArrayBuffer or TypedArray and returns its hexadecimal representation.
         * No spaces or linebreaks.
         * @param data
         * @public
         */
        /**
         * Returns the integer i in hexadecimal string form,
         * with leading zeroes, such that
         * the resulting string is at least byteCount*2 characters long.
         * @param {int} i
         * @param {int} byteCount
         * @public
         */
        function toHexString(i, byteCount) {
            var string = (new Number(i)).toString(16);
            while (string.length < byteCount * 2) {
                string = '0' + string;
            }
            return string;
        }
        utils.toHexString = toHexString;
        /**
         * Takes a ArrayBuffer or TypedArray and returns its hexadecimal representation.
         * No spaces or linebreaks.
         * @param data
         * @public
         **/
        function typedArrayToHexString(data, addComma = false) {
            // view data as a Uint8Array, unless it already is one.
            if (data.buffer) {
                if (!(data instanceof Uint8Array))
                    data = new Uint8Array(data.buffer);
            }
            else if (data instanceof ArrayBuffer) {
                data = new Uint8Array(data);
            }
            else {
                throw "not an ArrayBuffer or TypedArray.";
            }
            var str = '';
            for (var i = 0; i < data.length; i++) {
                if (addComma && str)
                    str += ',';
                str += toHexString(data[i], 1);
            }
            return str;
        }
        utils.typedArrayToHexString = typedArrayToHexString;
        function hexStringToTypedArray(hexData) {
            if (hexData.length % 2 != 0)
                throw "Wrong hexData string: " + hexData;
            var length = hexData.length / 2;
            var result = new Uint8Array(length);
            for (var i = 0; i < length; i++) {
                result[i] = parseInt(hexData.substring(i * 2, i * 2 + 2), 16);
            }
            return result;
        }
        utils.hexStringToTypedArray = hexStringToTypedArray;
        function getTime() {
            return new Date().getTime();
        }
        utils.getTime = getTime;
        function promiseAllSync(promisses) {
            var first = promisses.shift();
            if (typeof first == "undefined" || !first)
                return Promise.resolve();
            return first.then(() => {
                return promiseAllSync(promisses);
            }, e => console.error(e));
        }
        utils.promiseAllSync = promiseAllSync;
    })(utils = ergometer.utils || (ergometer.utils = {}));
})(ergometer || (ergometer = {}));
/**
 * Created by tijmen on 04/07/2017.
 *
 * queue function calls which returns a promise, converted to typescript
 * needed as work around for web blue tooth, this ensures that only one call is processed at at time
 *
 *
 */
var ergometer;
/**
 * Created by tijmen on 04/07/2017.
 *
 * queue function calls which returns a promise, converted to typescript
 * needed as work around for web blue tooth, this ensures that only one call is processed at at time
 *
 *
 */
(function (ergometer) {
    var utils;
    (function (utils) {
        /**
         * @return {Object}
         */
        class FunctionQueue {
            /**
             * @param {*} value
             * @returns {LocalPromise}
             */
            resolveWith(value) {
                if (value && typeof value.then === 'function') {
                    return value;
                }
                return new Promise(function (resolve) {
                    resolve(value);
                });
            }
            ;
            constructor(maxPendingPromises, maxQueuedPromises) {
                this.maxPendingPromises = Infinity;
                this.maxQueuedPromises = Infinity;
                this.pendingPromises = 0;
                this.queue = [];
                this.maxPendingPromises = typeof maxPendingPromises !== 'undefined' ? maxPendingPromises : Infinity;
                this.maxQueuedPromises = typeof maxQueuedPromises !== 'undefined' ? maxQueuedPromises : Infinity;
            }
            /**
             * @param {promiseGenerator}  a function which returns a promise
             * @param {context} the object which is the context where the function is called in
             * @param  {params} array of parameters for the function
             * @return {Promise} promise which is resolved when the function is acually called
             */
            add(promiseGenerator, context, ...params) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    // Do not queue to much promises
                    if (self.queue.length >= self.maxQueuedPromises) {
                        reject(new Error('Queue limit reached'));
                        return;
                    }
                    // Add to queue
                    self.queue.push({
                        promiseGenerator: promiseGenerator,
                        context: context,
                        params: params,
                        resolve: resolve,
                        reject: reject
                    });
                    self._dequeue();
                });
            }
            ;
            /**
             * Number of simultaneously running promises (which are resolving)
             *
             * @return {number}
             */
            getPendingLength() {
                return this.pendingPromises;
            }
            ;
            /**
             * Number of queued promises (which are waiting)
             *
             * @return {number}
             */
            getQueueLength() {
                return this.queue.length;
            }
            ;
            /**
             * @returns {boolean} true if first item removed from queue
             * @private
             */
            _dequeue() {
                var self = this;
                if (this.pendingPromises >= this.maxPendingPromises) {
                    return false;
                }
                // Remove from queue
                var item = this.queue.shift();
                if (!item) {
                    return false;
                }
                try {
                    this.pendingPromises++;
                    self.resolveWith(item.promiseGenerator.apply(item.context, item.params))
                        // Forward all stuff
                        .then(function (value) {
                        // It is not pending now
                        self.pendingPromises--;
                        // It should pass values
                        item.resolve(value);
                        self._dequeue();
                    }, function (err) {
                        // It is not pending now
                        self.pendingPromises--;
                        // It should not mask errors
                        item.reject(err);
                        self._dequeue();
                    });
                }
                catch (err) {
                    self.pendingPromises--;
                    item.reject(err);
                    self._dequeue();
                }
                return true;
            }
        }
        utils.FunctionQueue = FunctionQueue;
    })(utils = ergometer.utils || (ergometer.utils = {}));
})(ergometer || (ergometer = {}));
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
var ergometer;
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
(function (ergometer) {
    var pubSub;
    (function (pubSub) {
        class PubSub {
            constructor() {
                this.registry = {};
            }
            pub(name, ...args) {
                if (!this.registry[name])
                    return;
                this.registry[name].forEach((x) => {
                    try {
                        x.func.apply(x.object, args);
                    }
                    catch (e) {
                        console.log(e);
                    }
                });
            }
            pubASync(name, ...args) {
                if (!this.registry[name])
                    return;
                this.registry[name].forEach((x) => {
                    setTimeout(function () { x.func.apply(x.object, args); }, 0);
                });
            }
            sub(applyObject, name, fn) {
                var evnt = this.registry[name];
                var newItem = { object: applyObject, func: fn };
                if (!evnt) {
                    this.registry[name] = [newItem];
                }
                else {
                    //never subscribe the same function twice
                    var funcExists = false;
                    evnt.forEach(function (item) { if (item.func == fn)
                        funcExists = true; });
                    if (!funcExists)
                        evnt.push(newItem);
                }
                this.pub("subscribed", name, this.subscribeCount(name));
            }
            unsub(name, fn) {
                var evnt = this.registry[name];
                if (evnt) {
                    //remove the function
                    for (var i = evnt.length - 1; i >= 0; i--) {
                        if (evnt[i].func == fn)
                            evnt.splice(i, 1);
                    }
                }
                this.pub("unsubscribed", name, this.subscribeCount(name));
            }
            subscribeCount(name) {
                var evnt = this.registry[name];
                if (evnt)
                    return evnt.length;
                else
                    return 0;
            }
        }
        pubSub.PubSub = PubSub;
        //new style event using generics
        class Event {
            constructor() {
                this._subscribed = [];
            }
            doChangedEvent() {
                if (this._subScriptionChangedEvent) {
                    this._subScriptionChangedEvent(this, this.count);
                }
            }
            findSubscription(event) {
                this._subscribed.forEach((item) => {
                    if (item.func == event)
                        return item;
                });
                return null;
            }
            sub(applyObject, event) {
                var newItem = this.findSubscription(event);
                if (!newItem) {
                    newItem = { object: applyObject, func: event };
                    this._subscribed.push(newItem);
                    this.doChangedEvent();
                }
            }
            unsub(event) {
                for (var i = this._subscribed.length - 1; i >= 0; i--) {
                    if (this._subscribed[i].func == event)
                        this._subscribed.splice(i, 1);
                }
                this.doChangedEvent();
            }
            doPub(args) {
                this._subscribed.forEach((item) => {
                    item.func.apply(item.object, args);
                });
            }
            get pub() {
                var pubsub = this;
                var func = (...args) => {
                    pubsub.doPub(args);
                };
                return func;
            }
            get pubAsync() {
                var pubsub = this;
                var func = (...args) => {
                    setTimeout(() => {
                        pubsub.doPub(args);
                    });
                };
                return func;
            }
            get count() {
                return this._subscribed.length;
            }
            registerChangedEvent(func) {
                this._subScriptionChangedEvent = func;
            }
        }
        pubSub.Event = Event;
    })(pubSub = ergometer.pubSub || (ergometer.pubSub = {}));
})(ergometer || (ergometer = {}));
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
var ergometer;
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
(function (ergometer) {
    let LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["error"] = 0] = "error";
        LogLevel[LogLevel["info"] = 1] = "info";
        LogLevel[LogLevel["debug"] = 2] = "debug";
        LogLevel[LogLevel["trace"] = 3] = "trace";
    })(LogLevel = ergometer.LogLevel || (ergometer.LogLevel = {}));
    let MonitorConnectionState;
    (function (MonitorConnectionState) {
        MonitorConnectionState[MonitorConnectionState["inactive"] = 0] = "inactive";
        MonitorConnectionState[MonitorConnectionState["deviceReady"] = 1] = "deviceReady";
        MonitorConnectionState[MonitorConnectionState["scanning"] = 2] = "scanning";
        MonitorConnectionState[MonitorConnectionState["connecting"] = 3] = "connecting";
        MonitorConnectionState[MonitorConnectionState["connected"] = 4] = "connected";
        MonitorConnectionState[MonitorConnectionState["servicesFound"] = 5] = "servicesFound";
        MonitorConnectionState[MonitorConnectionState["readyForCommunication"] = 6] = "readyForCommunication";
    })(MonitorConnectionState = ergometer.MonitorConnectionState || (ergometer.MonitorConnectionState = {}));
    class MonitorBase {
        /**
        * By default it the logEvent will return errors if you want more debug change the log level
        * @returns {LogLevel}
        */
        get logEvent() {
            return this._logEvent;
        }
        constructor() {
            this._logEvent = new ergometer.pubSub.Event();
            this._logLevel = LogLevel.error;
            this._connectionStateChangedEvent = new ergometer.pubSub.Event();
            this._connectionState = MonitorConnectionState.inactive;
            this.initialize();
        }
        initialize() {
        }
        get logLevel() {
            return this._logLevel;
        }
        /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @param value
         */
        set logLevel(value) {
            this._logLevel = value;
        }
        disconnect() {
        }
        /**
         * read the current connection state
         * @returns {MonitorConnectionState}
         */
        get connectionState() {
            return this._connectionState;
        }
        connected() {
        }
        /**
         * event which is called when the connection state is changed. For example this way you
         * can check if the device is disconnected.
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<ConnectionStateChangedEvent>}
         */
        get connectionStateChangedEvent() {
            return this._connectionStateChangedEvent;
        }
        debugInfo(info) {
            if (this.logLevel >= LogLevel.debug)
                this.logEvent.pub(info, LogLevel.debug);
        }
        /**
         *
         * @param info
         */
        showInfo(info) {
            if (this.logLevel >= LogLevel.info)
                this.logEvent.pub(info, LogLevel.info);
        }
        /**
         * Print debug info to console and application UI.
         * @param info
         */
        traceInfo(info) {
            if (this.logLevel >= LogLevel.trace)
                this.logEvent.pub(info, LogLevel.trace);
        }
        /**
         * call the global error hander and call the optional error handler if given
         * @param error
         */
        handleError(error, errorFn) {
            if (this.logLevel >= LogLevel.error)
                this.logEvent.pub(error, LogLevel.error);
            if (errorFn)
                errorFn(error);
        }
        /**
         * Get an error function which adds the errorDescription to the error ,cals the global and an optional local funcion
         * @param errorDescription
         * @param errorFn
         */
        getErrorHandlerFunc(errorDescription, errorFn) {
            return (e) => {
                this.handleError(errorDescription + ':' + e.toString(), errorFn);
            };
        }
        beforeConnected() {
        }
        /**
         *
         * @param value
         */
        changeConnectionState(value) {
            if (this._connectionState != value) {
                var oldValue = this._connectionState;
                this._connectionState = value;
                if (value == MonitorConnectionState.connected) {
                    this.beforeConnected();
                }
                this.connectionStateChangedEvent.pub(oldValue, value);
                if (value == MonitorConnectionState.connected) {
                    this.connected();
                }
            }
        }
    }
    ergometer.MonitorBase = MonitorBase;
})(ergometer || (ergometer = {}));
/**
 * Created by tijmen on 01-02-16.
 */
var ergometer;
/**
 * Created by tijmen on 01-02-16.
 */
(function (ergometer) {
    var ble;
    (function (ble) {
        class DriverBleat {
            //simple wrapper for bleat characteristic functions
            getCharacteristic(serviceUid, characteristicUid) {
                var service = this._device.services[serviceUid];
                if (service) {
                    var found = service.characteristics[characteristicUid];
                    if (found)
                        return found;
                    else
                        throw `characteristics ${characteristicUid} not found in service ${serviceUid}`;
                }
                else
                    throw `service ${serviceUid} not found`;
            }
            connect(device, disconnectFn) {
                return new Promise((resolve, reject) => {
                    try {
                        var newDevice = device._internalDevice;
                        newDevice.connect(() => {
                            this._device = newDevice;
                            resolve();
                        }, disconnectFn, false, (e) => {
                            reject(e);
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            disconnect() {
                if (this._device)
                    this._device.disconnect();
            }
            startScan(foundFn) {
                return new Promise((resolve, reject) => {
                    try {
                        bleat.startScan((device) => {
                            foundFn({
                                address: device.address,
                                name: device.name,
                                rssi: device.adData.rssi,
                                _internalDevice: device
                            });
                        }, reject);
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            stopScan() {
                return new Promise((resolve, reject) => {
                    try {
                        bleat.stopScan(reject);
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            writeCharacteristic(serviceUIID, characteristicUUID, data) {
                return new Promise((resolve, reject) => {
                    try {
                        var dataView = new DataView(data.buffer);
                        this.getCharacteristic(serviceUIID, characteristicUUID).write(dataView, resolve, reject);
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            readCharacteristic(serviceUIID, characteristicUUID) {
                return new Promise((resolve, reject) => {
                    try {
                        this.getCharacteristic(serviceUIID, characteristicUUID).read((data) => { resolve(data.buffer); }, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            enableNotification(serviceUIID, characteristicUUID, receive) {
                return new Promise((resolve, reject) => {
                    try {
                        this.getCharacteristic(serviceUIID, characteristicUUID).enableNotify((data) => { receive(data.buffer); }, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            disableNotification(serviceUIID, characteristicUUID) {
                return new Promise((resolve, reject) => {
                    try {
                        this.getCharacteristic(serviceUIID, characteristicUUID).disableNotify(resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
        }
        ble.DriverBleat = DriverBleat;
    })(ble = ergometer.ble || (ergometer.ble = {}));
})(ergometer || (ergometer = {}));
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
var ergometer;
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
(function (ergometer) {
    var ble;
    (function (ble) {
        class DriverSimpleBLE {
            connect(device, disconnectFn) {
                return new Promise((resolve, reject) => {
                    //  simpleBLE.connect("");
                });
            }
            disconnect() {
                simpleBLE.disconnect();
            }
            startScan(foundFn) {
                return new Promise((resolve, reject) => {
                    //  simpleBLE.scan();
                });
            }
            stopScan() {
                return new Promise((resolve, reject) => {
                });
            }
            writeCharacteristic(serviceUIID, characteristicUUID, data) {
                return new Promise((resolve, reject) => {
                });
            }
            readCharacteristic(serviceUIID, characteristicUUID) {
                return new Promise((resolve, reject) => {
                });
            }
            enableNotification(serviceUIID, characteristicUUID, receive) {
                return new Promise((resolve, reject) => {
                });
            }
            disableNotification(serviceUIID, characteristicUUID) {
                return new Promise((resolve, reject) => {
                });
            }
        }
        ble.DriverSimpleBLE = DriverSimpleBLE;
    })(ble = ergometer.ble || (ergometer.ble = {}));
})(ergometer || (ergometer = {}));
var bleCentral;
(function (bleCentral) {
    function available() {
        return typeof ble !== 'undefined' && typeof ble.connectedPeripheralsWithServices == "function";
    }
    bleCentral.available = available;
    class DriverBleCentral {
        connect(device, disconnectFn) {
            return new Promise((resolve, reject) => {
                ble.connect(device.address, (periferalData) => {
                    this._device = periferalData;
                    resolve();
                }, disconnectFn);
            });
        }
        constructor(_scanServices) {
            this._scanServices = _scanServices;
        }
        disconnect() {
            ble.disconnect(this._device.id);
        }
        startScan(foundFn, retry = true) {
            return new Promise((resolve, reject) => {
                //work around ios problem that ble is not yet active
                //when the start scan is called, so wait a bit when an error happens 
                //and then retry, give an error when it ble is not enabled
                ble.isEnabled(() => {
                    ble.startScan(this._scanServices, (foundData) => {
                        if (foundFn)
                            foundFn({
                                address: foundData.id,
                                name: foundData.name,
                                rssi: foundData.rssi,
                                _internalDevice: foundData
                            });
                    }, reject);
                    resolve();
                }, (err) => {
                    if (retry) {
                        setTimeout(() => {
                            this.startScan(foundFn, false).then(resolve).catch(reject);
                        }, 1000);
                    }
                    else
                        reject("Can not start scan, Bluetooth is not enabled. Please activate blue tooth.  (" + err + ")");
                });
            });
        }
        stopScan() {
            return ble.withPromises.stopScan();
        }
        writeCharacteristic(serviceUIID, characteristicUUID, data) {
            return ble.withPromises.write(this._device.id, serviceUIID, characteristicUUID, data.buffer);
        }
        readCharacteristic(serviceUIID, characteristicUUID) {
            return ble.withPromises.read(this._device.id, serviceUIID, characteristicUUID);
        }
        enableNotification(serviceUIID, characteristicUUID, receive) {
            return new Promise((resolve, reject) => {
                console.trace("enableNotification " + characteristicUUID);
                ble.startNotification(this._device.id, serviceUIID, characteristicUUID, receive, reject);
                //console.log("resolved enableNotification"+characteristicUUID);
                resolve();
            });
        }
        disableNotification(serviceUIID, characteristicUUID) {
            //console.trace("disableNotification "+characteristicUUID);
            return ble.withPromises.stopNotification(this._device.id, serviceUIID, characteristicUUID);
        }
    }
    bleCentral.DriverBleCentral = DriverBleCentral;
})(bleCentral || (bleCentral = {}));
/**
 * Created by tijmen on 17-07-16.
 */
/**
 * Created by tijmen on 01-02-16.
 */
var ergometer;
/**
 * Created by tijmen on 17-07-16.
 */
/**
 * Created by tijmen on 01-02-16.
 */
(function (ergometer) {
    var ble;
    (function (ble) {
        function hasWebBlueTooth() {
            return (navigator && typeof navigator.bluetooth !== 'undefined');
        }
        ble.hasWebBlueTooth = hasWebBlueTooth;
        class DriverWebBlueTooth {
            //should queue the read and writes, this may be the cause of the blocking issues, this is a work arround for the chrome web blue tooth problem
            //private _functionQueue : utils.FunctionQueue = new utils.FunctionQueue(1); //1 means one at a time
            constructor(_performanceMonitor, _scanServices, _scanOptionalServices) {
                this._performanceMonitor = _performanceMonitor;
                this._scanServices = _scanServices;
                this._scanOptionalServices = _scanOptionalServices;
                this._listenerMap = {};
                //needed to prevent early free of the characteristic
                this._listerCharacteristicMap = {};
            }
            //simple wrapper for bleat characteristic functions
            getCharacteristic(serviceUid, characteristicUid) {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`getCharacteristic ${characteristicUid} `);
                return new Promise((resolve, reject) => {
                    if (!this._server || !this._server.connected)
                        reject("server not connected");
                    else
                        this._server.getPrimaryService(serviceUid)
                            .then((service) => {
                            return service.getCharacteristic(characteristicUid);
                        })
                            .then(resolve, reject);
                });
            }
            onDisconnected(event) {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`onDisconnected `);
                if (this._disconnectFn)
                    this._disconnectFn();
                this.clearConnectionVars();
            }
            clearConnectionVars() {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`clearConnectionVars `);
                if (this._device)
                    this._device.removeEventListener('ongattserverdisconnected', this.onDisconnected);
                this._device = null;
                this._server = null;
                this._disconnectFn = null;
                this._listenerMap = {};
                this._listerCharacteristicMap = {};
            }
            connect(device, disconnectFn) {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`connect `);
                return new Promise((resolve, reject) => {
                    try {
                        var newDevice = device._internalDevice;
                        newDevice.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
                        newDevice.ongattserverdisconnected = this.onDisconnected.bind(this);
                        newDevice.gatt.connect().then((server) => {
                            this._device = newDevice;
                            this._server = server;
                            this._disconnectFn = disconnectFn;
                            resolve();
                        }, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            disconnect() {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`disconnect `);
                if (this._server && this._server.connected)
                    this._server.disconnect();
                else
                    this.clearConnectionVars();
            }
            startScan(foundFn) {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`startScan `);
                return new Promise((resolve, reject) => {
                    try {
                        navigator.bluetooth.requestDevice({
                            filters: [
                                { services: this._scanServices
                                }
                            ],
                            optionalServices: this._scanOptionalServices
                        }).then(device => {
                            foundFn({
                                address: device.id,
                                name: device.name,
                                rssi: ((typeof device.adData !== 'undefined') && device.adData.rssi) ? device.adData.rssi : 0,
                                _internalDevice: device
                            });
                        }).then(resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            stopScan() {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`stopScan `);
                if (typeof navigator.bluetooth.cancelRequest !== 'undefined')
                    return navigator.bluetooth.cancelRequest();
                else
                    return new Promise((resolve, reject) => {
                        resolve();
                    });
            }
            /*
            public writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void> {
              if (this._performanceMonitor.logLevel==LogLevel.trace)
                this._performanceMonitor.traceInfo(`writeCharacteristic ${characteristicUUID} : ${data} `);
        
              //run read and write one at a time , wait for the result and then call the next
              //this is a workaround for a problem of web blue tooth
              //not yet tested!
              return this._functionQueue.add(
                  this.doWriteCharacteristic,
                  this,serviceUIID,characteristicUUID,data);
            }
            */
            writeCharacteristic(serviceUIID, characteristicUUID, data) {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`writeCharacteristic ${characteristicUUID} : ${data} `);
                if (!this._device || !this._device.gatt || !this._device.gatt.connected) {
                    this.onDisconnected(null);
                    return Promise.reject("Not connected");
                }
                return new Promise((resolve, reject) => {
                    try {
                        this.getCharacteristic(serviceUIID, characteristicUUID)
                            .then((characteristic) => {
                            return characteristic.writeValue(data.buffer);
                        })
                            .then(resolve)
                            .catch(e => {
                            reject(e);
                            //when an write gives an error asume that we are disconnected
                            if (!this._device.gatt.connected)
                                this.onDisconnected(null);
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            /*
            public readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer> {
              if (this._performanceMonitor.logLevel==LogLevel.trace)
                this._performanceMonitor.traceInfo(`readCharacteristic ${characteristicUUID}  `);
        
              //run read and write one at a time , wait for the result and then call the next
              //this is a workaround for a problem of web blue tooth
              //not yet tested!
              return this._functionQueue.add(
                  this.doReadCharacteristic,
                  this,serviceUIID,characteristicUUID);
            }
            */
            readCharacteristic(serviceUIID, characteristicUUID) {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`readCharacteristic ${characteristicUUID}  `);
                if (!this._device || !this._device.gatt || !this._device.gatt.connected) {
                    this.onDisconnected(null);
                    return Promise.reject("Not connected");
                }
                return new Promise((resolve, reject) => {
                    try {
                        this.getCharacteristic(serviceUIID, characteristicUUID)
                            .then((characteristic) => {
                            return characteristic.readValue();
                        })
                            .then((data) => {
                            if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                                this._performanceMonitor.traceInfo(`doReadCharacteristic ${characteristicUUID} : ${ergometer.utils.typedArrayToHexString(data.buffer, true)} `);
                            resolve(data.buffer);
                        })
                            .catch(e => {
                            reject(e);
                            //when an write gives an error asume that we are disconnected
                            if (!this._device.gatt.connected)
                                this.onDisconnected(null);
                        });
                        ;
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            onCharacteristicValueChanged(event) {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`onCharacteristicValueChanged ${event.target.uuid} : ${ergometer.utils.typedArrayToHexString(event.target.value.buffer, true)} `);
                try {
                    if (!this._device.gatt.connected) {
                        this.onDisconnected(null);
                        throw "Not connected";
                    }
                    let func = this._listenerMap[event.target.uuid];
                    if (func)
                        func(event.target.value.buffer);
                }
                catch (e) {
                    if (this._performanceMonitor)
                        this._performanceMonitor.handleError(e.toString());
                    else
                        throw e;
                }
            }
            /*private onCharacteristicValueChanged(uuid,buffer) : Promise<void> {
              return new Promise<void>((resolve, reject) => {
                try {
                  let func=this._listerMap[uuid];
                  if (func) {
                      func(buffer);
                      resolve();
                  }
                  else throw "characteristics uuid "+uuid.toString()+" not found in map";
                }
                catch(e) {
                  if (this._performanceMonitor)
                    this._performanceMonitor.handleError(e.toString());
                  reject(e);
                }
        
              });
            }
            
            private onCharacteristicValueChanged(event:webbluetooth.CharacteristicsValueChangedEvent) {
              if (this._performanceMonitor.logLevel==LogLevel.trace)
                this._performanceMonitor.traceInfo(`onCharacteristicValueChanged ${event.target.uuid} : ${utils.typedArrayToHexString(event.target.value.buffer)} `);
              //this may prevent hanging, just a test
                //process one at a time to prevent dead locks
              this._functionQueue.add(
                    this.doOnCharacteristicValueChanged,this,event.target.uuid,event.target.value.buffer);
        
              return true;
            }
            */
            enableNotification(serviceUIID, characteristicUUID, receive) {
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`enableNotification ${characteristicUUID}  `);
                if (!this._device.gatt.connected) {
                    this.onDisconnected(null);
                    return Promise.reject("Not connected");
                }
                return new Promise((resolve, reject) => {
                    try {
                        this.getCharacteristic(serviceUIID, characteristicUUID)
                            .then((characteristic) => {
                            return characteristic.startNotifications().then(_ => {
                                this._listenerMap[characteristicUUID] = receive;
                                //bug fix: this prevents the chracteristic from being free-ed
                                this._listerCharacteristicMap[characteristicUUID] = characteristic;
                                characteristic.addEventListener('characteristicvaluechanged', this.onCharacteristicValueChanged.bind(this));
                                resolve();
                            }, reject);
                        }).then(resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            disableNotification(serviceUIID, characteristicUUID) {
                //only disable when receive is
                if (this._performanceMonitor.logLevel == ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo(`disableNotification ${characteristicUUID}  `);
                return new Promise((resolve, reject) => {
                    try {
                        if (typeof this._listenerMap[characteristicUUID] !== 'undefined' && this._listenerMap[characteristicUUID]) {
                            this.getCharacteristic(serviceUIID, characteristicUUID)
                                .then((characteristic) => {
                                characteristic.stopNotifications().then(() => {
                                    this._listenerMap[characteristic.uuid] = null;
                                    this._listerCharacteristicMap[characteristic.uuid] = null;
                                    characteristic.removeEventListener('characteristicvaluechanged', this.onCharacteristicValueChanged);
                                    resolve();
                                }, reject);
                            });
                        }
                        else
                            resolve(); //just resolve nothing to do
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
        }
        ble.DriverWebBlueTooth = DriverWebBlueTooth;
    })(ble = ergometer.ble || (ergometer.ble = {}));
})(ergometer || (ergometer = {}));
/**
 * Created by tijmen on 16-02-16.
 */
var ergometer;
/**
 * Created by tijmen on 16-02-16.
 */
(function (ergometer) {
    var ble;
    (function (ble) {
        let RecordingEventType;
        (function (RecordingEventType) {
            RecordingEventType[RecordingEventType["startScan"] = 0] = "startScan";
            RecordingEventType[RecordingEventType["scanFoundFn"] = 1] = "scanFoundFn";
            RecordingEventType[RecordingEventType["stopScan"] = 2] = "stopScan";
            RecordingEventType[RecordingEventType["connect"] = 3] = "connect";
            RecordingEventType[RecordingEventType["disconnectFn"] = 4] = "disconnectFn";
            RecordingEventType[RecordingEventType["disconnect"] = 5] = "disconnect";
            RecordingEventType[RecordingEventType["writeCharacteristic"] = 6] = "writeCharacteristic";
            RecordingEventType[RecordingEventType["readCharacteristic"] = 7] = "readCharacteristic";
            RecordingEventType[RecordingEventType["enableNotification"] = 8] = "enableNotification";
            RecordingEventType[RecordingEventType["notificationReceived"] = 9] = "notificationReceived";
            RecordingEventType[RecordingEventType["disableNotification"] = 10] = "disableNotification";
        })(RecordingEventType = ble.RecordingEventType || (ble.RecordingEventType = {}));
        class RecordingDriver {
            constructor(performanceMonitor, realDriver) {
                this._events = [];
                this._performanceMonitor = performanceMonitor;
                this._realDriver = realDriver;
            }
            getRelativeTime() {
                return ergometer.utils.getTime() - this._startTime;
            }
            addRecording(eventType, data) {
                var newRec = {
                    timeStamp: this.getRelativeTime(),
                    eventType: RecordingEventType[eventType]
                };
                if (data) {
                    newRec.data = data;
                }
                this._events.push(newRec);
                return newRec;
            }
            get events() {
                return this._events;
            }
            set events(value) {
                this._events = value;
            }
            clear() {
                this._events = [];
            }
            startRecording() {
                this.clear();
                this._startTime = ergometer.utils.getTime();
            }
            recordResolveFunc(resolve, rec) {
                return () => {
                    rec.timeStampReturn = this.getRelativeTime();
                    resolve();
                };
            }
            recordResolveBufferFunc(resolve, rec) {
                return (data) => {
                    rec.timeStampReturn = this.getRelativeTime();
                    rec.data.data = ergometer.utils.typedArrayToHexString(data);
                    resolve(data);
                };
            }
            recordErrorFunc(reject, rec) {
                return (e) => {
                    rec.timeStampReturn = this.getRelativeTime();
                    rec.error = e;
                    reject(e);
                };
            }
            startScan(foundFn) {
                return new Promise((resolve, reject) => {
                    var rec = this.addRecording(RecordingEventType.startScan);
                    this._realDriver.startScan((device) => {
                        this.addRecording(RecordingEventType.scanFoundFn, {
                            address: device.address,
                            name: device.name,
                            rssi: device.rssi
                        });
                        foundFn(device);
                    })
                        .then(this.recordResolveFunc(resolve, rec), this.recordErrorFunc(reject, rec));
                });
            }
            stopScan() {
                this.addRecording(RecordingEventType.stopScan);
                this._realDriver.stopScan();
            }
            connect(device, disconnectFn) {
                return new Promise((resolve, reject) => {
                    var rec = this.addRecording(RecordingEventType.connect);
                    this._realDriver.connect(device, () => {
                        this.addRecording(RecordingEventType.disconnectFn);
                        disconnectFn();
                    }).then(this.recordResolveFunc(resolve, rec), this.recordErrorFunc(reject, rec));
                });
            }
            disconnect() {
                this.addRecording(RecordingEventType.disconnect);
                this._realDriver.disconnect();
            }
            writeCharacteristic(serviceUIID, characteristicUUID, data) {
                return new Promise((resolve, reject) => {
                    var rec = this.addRecording(RecordingEventType.writeCharacteristic, {
                        serviceUIID: serviceUIID,
                        characteristicUUID: characteristicUUID,
                        data: ergometer.utils.typedArrayToHexString(data.buffer)
                    });
                    this._realDriver.writeCharacteristic(serviceUIID, characteristicUUID, data)
                        .then(this.recordResolveFunc(resolve, rec), this.recordErrorFunc(reject, rec));
                });
            }
            readCharacteristic(serviceUIID, characteristicUUID) {
                return new Promise((resolve, reject) => {
                    var rec = this.addRecording(RecordingEventType.readCharacteristic, {
                        serviceUIID: serviceUIID,
                        characteristicUUID: characteristicUUID
                    });
                    this._realDriver.readCharacteristic(serviceUIID, characteristicUUID)
                        .then(this.recordResolveBufferFunc(resolve, rec), this.recordErrorFunc(reject, rec));
                });
            }
            enableNotification(serviceUIID, characteristicUUID, receive) {
                /*
                //make a wrapper for each call otherwise it returns the
                class ReturnWrapper {
          
                    constructor (private serviceUIID,private characteristicUUID,private receive,private driver)  {
          
                    }
                    public getReturnFunc() {
                        return (data:ArrayBuffer) => {
                        this.driver.addRecording(RecordingEventType.notificationReceived,{
                            serviceUIID:this.serviceUIID,
                            characteristicUUID:this.characteristicUUID,
                            data:utils.typedArrayToHexString(data)});
                        this.receive(data);
                    }
                }
                }
                var receivedWrapper = new ReturnWrapper(serviceUIID,characteristicUUID,receive,this);
                */
                return new Promise((resolve, reject) => {
                    var rec = this.addRecording(RecordingEventType.enableNotification, {
                        serviceUIID: serviceUIID,
                        characteristicUUID: characteristicUUID
                    });
                    this._realDriver.enableNotification(serviceUIID, characteristicUUID, (data) => {
                        this.addRecording(RecordingEventType.notificationReceived, {
                            serviceUIID: serviceUIID,
                            characteristicUUID: characteristicUUID,
                            data: ergometer.utils.typedArrayToHexString(data)
                        });
                        receive(data);
                    })
                        .then(this.recordResolveFunc(resolve, rec), this.recordErrorFunc(reject, rec));
                });
            }
            disableNotification(serviceUIID, characteristicUUID) {
                return new Promise((resolve, reject) => {
                    var rec = this.addRecording(RecordingEventType.disableNotification, {
                        serviceUIID: serviceUIID,
                        characteristicUUID: characteristicUUID
                    });
                    this._realDriver.disableNotification(serviceUIID, characteristicUUID)
                        .then(this.recordResolveFunc(resolve, rec), this.recordErrorFunc(reject, rec));
                });
            }
        }
        ble.RecordingDriver = RecordingDriver;
    })(ble = ergometer.ble || (ergometer.ble = {}));
})(ergometer || (ergometer = {}));
/**
 * Created by tijmen on 18-02-16.
 */
var ergometer;
/**
 * Created by tijmen on 18-02-16.
 */
(function (ergometer) {
    var ble;
    (function (ble) {
        class ReplayDriver {
            getRelativeTime() {
                return ergometer.utils.getTime() - this._startTime;
            }
            constructor(performanceMonitor, realDriver) {
                this._events = [];
                this._eventCallBackMethods = [];
                this._eventCallbacks = [];
                this._playing = false;
                this._eventIndex = 0;
                this._checkQueueTimerId = null;
                this._performanceMonitor = performanceMonitor;
                this._realDriver = realDriver;
            }
            get events() {
                return this._events;
            }
            isCallBack(eventType) {
                return (eventType == ble.RecordingEventType.scanFoundFn ||
                    eventType == ble.RecordingEventType.disconnectFn ||
                    eventType == ble.RecordingEventType.notificationReceived);
            }
            isSameEvent(event1, event2) {
                var result = event1.eventType == event2.eventType;
                if (result && ergometer.utils.isDefined(event1.data) && ergometer.utils.isDefined(event2.data) && event1.data && event2.data) {
                    let data1 = event1.data;
                    let data2 = event2.data;
                    if (result && (ergometer.utils.isDefined(data1.serviceUIID) || ergometer.utils.isDefined(data2.serviceUIID)))
                        result = data1.serviceUIID == data2.serviceUIID;
                    if (result && (ergometer.utils.isDefined(data1.characteristicUUID) || ergometer.utils.isDefined(data2.characteristicUUID)))
                        result = data1.characteristicUUID == data2.characteristicUUID;
                }
                return result;
            }
            runEvent(event, queuedEvent) {
                if (this._performanceMonitor.logLevel >= ergometer.LogLevel.trace)
                    this._performanceMonitor.traceInfo("run event:" + JSON.stringify(event));
                if (event.error) {
                    queuedEvent.reject(event.error);
                }
                else {
                    var data = null;
                    if (event.data) {
                        data = event.data;
                        var eventType = ble.RecordingEventType[event.eventType];
                        if (eventType == ble.RecordingEventType.readCharacteristic ||
                            eventType == ble.RecordingEventType.notificationReceived) {
                            data = ergometer.utils.hexStringToTypedArray(data.data).buffer;
                        }
                    }
                    if (queuedEvent.resolve) {
                        try {
                            if (data)
                                queuedEvent.resolve(data);
                            else
                                queuedEvent.resolve();
                        }
                        catch (e) {
                            //do not let it stop on replay errors, just continue and log
                            this._performanceMonitor.handleError("Error: while replaying event" + e);
                        }
                    }
                }
            }
            runTimedEvent(event, queuedEvent) {
                setTimeout(() => {
                    this.runEvent(event, queuedEvent);
                }, queuedEvent.timeStamp - event.timeStamp);
            }
            removeEvent(i) {
                this._events.splice(i, 1);
            }
            checkQueue() {
                var keepChecking = true;
                while (keepChecking && this._events.length > 0 && this._events[0].timeStamp <= this.getRelativeTime()) {
                    keepChecking = false; //by default do not keep on checking
                    var event = this._events[0];
                    if (this.isCallBack(ble.RecordingEventType[event.eventType])) {
                        //run call backs directly on the given time
                        if (event.timeStamp <= this.getRelativeTime()) {
                            var found = false;
                            this._eventCallbacks.forEach((callbackEvent) => {
                                if (this.isSameEvent(event, callbackEvent)) {
                                    this.runEvent(event, callbackEvent);
                                    keepChecking = true;
                                    found = true;
                                }
                            });
                            if (found)
                                this.removeEvent(0);
                        }
                    }
                    else {
                        if (this._eventCallBackMethods.length > 0) {
                            for (var i = 0; i < this._eventCallBackMethods.length; i++) {
                                var eventQueued = this._eventCallBackMethods[i];
                                if (this.isSameEvent(eventQueued, event)) {
                                    this._eventCallBackMethods.splice(i, 1);
                                    this.removeEvent(0);
                                    keepChecking = true;
                                    if (event.timeStamp <= eventQueued.timeStamp)
                                        this.runEvent(event, eventQueued);
                                    else
                                        this.runTimedEvent(event, eventQueued);
                                    break;
                                }
                            }
                        }
                    }
                }
                if (this._events.length > 0) {
                    let event = this._events[0];
                    this.timeNextCheck(event.timeStamp);
                }
                this.checkAllEventsProcessd();
            }
            checkAllEventsProcessd() {
                var allDone = (this.events.length == 0) && (this._eventCallBackMethods.length == 0);
                if (allDone && this.playing) {
                    this.playing = false;
                }
                return allDone;
            }
            timeNextCheck(timeStamp) {
                if (this._checkQueueTimerId) {
                    window.clearTimeout(this._checkQueueTimerId);
                    this._checkQueueTimerId = null;
                }
                var duration = 0;
                if (timeStamp) {
                    duration = this.getRelativeTime() - timeStamp;
                    if (duration == 0)
                        duration = 100;
                }
                this._checkQueueTimerId = setTimeout(() => {
                    this.checkQueue();
                }, duration);
            }
            addEvent(eventType, isMethod, resolve, reject, serviceUIID, characteristicUUID) {
                var event = {
                    timeStamp: this.getRelativeTime(),
                    eventType: ble.RecordingEventType[eventType]
                };
                if (resolve)
                    event.resolve = resolve;
                if (reject)
                    event.reject = reject;
                if (serviceUIID || characteristicUUID) {
                    var data = {
                        serviceUIID: serviceUIID,
                        characteristicUUID: characteristicUUID
                    };
                    event.data = data;
                }
                if (isMethod) {
                    this._eventCallBackMethods.push(event);
                }
                else {
                    this._eventCallbacks.push(event);
                    this.timeNextCheck();
                }
            }
            replay(events) {
                this._playing = false;
                this._startTime = ergometer.utils.getTime();
                this._events = events;
                this._eventIndex = 0;
                this.playing = true;
            }
            get playing() {
                return this._playing;
            }
            set playing(value) {
                if (this._playing != value) {
                    this._playing = value;
                    if (!value) {
                        this._eventCallBackMethods = [];
                        this._eventCallbacks = [];
                        this._performanceMonitor.disconnect();
                    }
                }
            }
            /*protected  playEvent(event : IRecordingItem) : Promise<void> {
    
                    var timeDiff = event.timeStamp-event.timeStampReturn;
                    if (event.error)  setTimeout(reject, timeDiff)
                    else setTimeout(resolve, timeDiff);
            }  */
            startScan(foundFn) {
                this.addEvent(ble.RecordingEventType.scanFoundFn, false, foundFn);
                return new Promise((resolve, reject) => {
                    this.addEvent(ble.RecordingEventType.startScan, true, resolve, reject);
                });
            }
            stopScan() {
                this.addEvent(ble.RecordingEventType.stopScan, true);
            }
            connect(device, disconnectFn) {
                this.addEvent(ble.RecordingEventType.disconnectFn, false, disconnectFn);
                return new Promise((resolve, reject) => {
                    this.addEvent(ble.RecordingEventType.connect, true, resolve, reject);
                });
            }
            disconnect() {
                this.addEvent(ble.RecordingEventType.disconnect, true);
            }
            writeCharacteristic(serviceUIID, characteristicUUID, data) {
                return new Promise((resolve, reject) => {
                    this.addEvent(ble.RecordingEventType.writeCharacteristic, true, resolve, reject, serviceUIID, characteristicUUID);
                });
            }
            readCharacteristic(serviceUIID, characteristicUUID) {
                return new Promise((resolve, reject) => {
                    this.addEvent(ble.RecordingEventType.readCharacteristic, true, resolve, reject, serviceUIID, characteristicUUID);
                });
            }
            enableNotification(serviceUIID, characteristicUUID, receive) {
                this.addEvent(ble.RecordingEventType.notificationReceived, false, receive, null, serviceUIID, characteristicUUID);
                return new Promise((resolve, reject) => {
                    this.addEvent(ble.RecordingEventType.enableNotification, true, resolve, reject, serviceUIID, characteristicUUID);
                });
            }
            disableNotification(serviceUIID, characteristicUUID) {
                return new Promise((resolve, reject) => {
                    this.addEvent(ble.RecordingEventType.disableNotification, true, resolve, reject, serviceUIID, characteristicUUID);
                });
            }
        }
        ble.ReplayDriver = ReplayDriver;
    })(ble = ergometer.ble || (ergometer.ble = {}));
})(ergometer || (ergometer = {}));
/**
 * Created by tijmen on 16-01-16.
 */
/** @internal */
var ergometer;
/**
 * Created by tijmen on 16-01-16.
 */
/** @internal */
(function (ergometer) {
    var ble;
    (function (ble) {
        /** @internal */
        ble.PMDEVICE = "ce060000-43e5-11e4-916c-0800200c9a66";
        ble.HEART_RATE_DEVICE_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb"; // "heart_rate";
        ble.HEART_RATE_MEASUREMENT = "00002a37-0000-1000-8000-00805f9b34fb";
        // Service UUIDs
        ble.PMDEVICE_INFO_SERVICE = "ce060010-43e5-11e4-916c-0800200c9a66";
        ble.PMCONTROL_SERVICE = "ce060020-43e5-11e4-916c-0800200c9a66";
        ble.PMROWING_SERVICE = "ce060030-43e5-11e4-916c-0800200c9a66";
        // Characteristic UUIDs for PM device info service
        ble.MODELNUMBER_CHARACTERISIC = "ce060011-43e5-11e4-916c-0800200c9a66";
        ble.SERIALNUMBER_CHARACTERISTIC = "ce060012-43e5-11e4-916c-0800200c9a66";
        ble.HWREVISION_CHARACTERISIC = "ce060013-43e5-11e4-916c-0800200c9a66";
        ble.FWREVISION_CHARACTERISIC = "ce060014-43e5-11e4-916c-0800200c9a66";
        ble.MANUFNAME_CHARACTERISIC = "ce060015-43e5-11e4-916c-0800200c9a66";
        ble.MACHINETYPE_CHARACTERISIC = "ce060016-43e5-11e4-916c-0800200c9a66";
        // Characteristic UUIDs for PM control service
        ble.TRANSMIT_TO_PM_CHARACTERISIC = "ce060021-43e5-11e4-916c-0800200c9a66";
        ble.RECEIVE_FROM_PM_CHARACTERISIC = "ce060022-43e5-11e4-916c-0800200c9a66";
        // Characteristic UUIDs for rowing service
        ble.ROWING_STATUS_CHARACTERISIC = "ce060031-43e5-11e4-916c-0800200c9a66";
        ble.EXTRA_STATUS1_CHARACTERISIC = "ce060032-43e5-11e4-916c-0800200c9a66";
        ble.EXTRA_STATUS2_CHARACTERISIC = "ce060033-43e5-11e4-916c-0800200c9a66";
        ble.ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC = "ce060034-43e5-11e4-916c-0800200c9a66";
        ble.STROKE_DATA_CHARACTERISIC = "ce060035-43e5-11e4-916c-0800200c9a66";
        ble.EXTRA_STROKE_DATA_CHARACTERISIC = "ce060036-43e5-11e4-916c-0800200c9a66";
        ble.SPLIT_INTERVAL_DATA_CHARACTERISIC = "ce060037-43e5-11e4-916c-0800200c9a66";
        ble.EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC = "ce060038-43e5-11e4-916c-0800200c9a66";
        ble.ROWING_SUMMARY_CHARACTERISIC = "ce060039-43e5-11e4-916c-0800200c9a66";
        ble.EXTRA_ROWING_SUMMARY_CHARACTERISIC = "ce06003a-43e5-11e4-916c-0800200c9a66";
        ble.HEART_RATE_BELT_INFO_CHARACTERISIC = "ce06003b-43e5-11e4-916c-0800200c9a66";
        ble.MULTIPLEXED_INFO_CHARACTERISIC = "ce060080-43e5-11e4-916c-0800200c9a66";
        ble.NOTIFICATION_DESCRIPTOR = "00002902-0000-1000-8000-00805f9b34fb";
        ble.PACKET_SIZE = 20;
        ;
        ;
        ;
    })(ble = ergometer.ble || (ergometer.ble = {}));
})(ergometer || (ergometer = {}));
var ergometer;
(function (ergometer) {
    var usb;
    (function (usb) {
        usb.USB_CSAVE_SIZE = 120;
        usb.WRITE_BUF_SIZE = 121;
        usb.REPORT_TYPE = 2;
        usb.CONCEPT2_VENDOR_ID = 6052;
    })(usb = ergometer.usb || (ergometer.usb = {}));
})(ergometer || (ergometer = {}));
var ergometer;
(function (ergometer) {
    var usb;
    (function (usb) {
        class DeviceNodeHid {
            constructor(deviceInfo) {
                this._deviceInfo = deviceInfo;
            }
            callError(err) {
                if (this._onError)
                    this._onError(err);
            }
            open(disconnect, error, receiveData) {
                this._hid = new nodehid.HID(this._deviceInfo.path);
                this._receiveData = receiveData;
                //there is no disconnect in hid api?
                //shoud fix this another way
                this._onError = error;
                this._hid.on('error', (err) => {
                    //should do some error handling
                    this.callError(err);
                });
                this._hid.readTimeout(500); //csafe should be returned directly, do not wait too long
                this._disconnect = disconnect;
                this._deviceInfo.productId;
                return Promise.resolve();
            }
            close() {
                this._hid.close();
                return Promise.resolve();
            }
            sendData(data) {
                return new Promise((resolve, reject) => {
                    try {
                        if (data.byteLength > usb.USB_CSAVE_SIZE)
                            throw `Trying to send to much data, the buffer must be smaller or equal to ${usb.USB_CSAVE_SIZE} and is ${data.byteLength}`;
                        var buf = new ArrayBuffer(usb.WRITE_BUF_SIZE);
                        var view = new Int8Array(buf);
                        view.set([usb.REPORT_TYPE], 0);
                        view.set(new Int8Array(data), 1);
                        var written = this._hid.write(Array.from(view));
                        if (written != usb.WRITE_BUF_SIZE)
                            throw `Only ${written} bytes written to usb device. it should be ${usb.WRITE_BUF_SIZE}`;
                        //resolve the send
                        resolve();
                        //start listening to the result
                        this.readData();
                    }
                    catch (error) {
                        this.callError(error);
                        reject(error);
                    }
                });
            }
            readData() {
                try {
                    this._hid.read((err, inputData) => {
                        if (err)
                            this.callError(err);
                        else {
                            if (inputData && inputData.length >= usb.WRITE_BUF_SIZE && inputData[0] == usb.REPORT_TYPE) {
                                //copy all results into a buffer of 121
                                var endByte = usb.WRITE_BUF_SIZE - 1;
                                while (endByte >= 0 && inputData[endByte] == 0)
                                    endByte--;
                                if (endByte >= 0 && inputData[endByte] == ergometer.csafe.defs.FRAME_END_BYTE) {
                                    var buf = new ArrayBuffer(usb.WRITE_BUF_SIZE);
                                    var ar = new Int8Array(buf);
                                    ar.set(inputData, 0);
                                    //return the the data except for the first byte
                                    var view = new DataView(ar.buffer, 1, endByte);
                                    this._receiveData(view);
                                }
                                else
                                    this.callError("end csafe frame not found");
                            }
                            else
                                this.callError("nothing read");
                        }
                    });
                }
                catch (error) {
                    this.callError(error);
                }
            }
        }
        usb.DeviceNodeHid = DeviceNodeHid;
        class DriverNodeHid {
            requestDevics() {
                try {
                    var result = [];
                    var devices = nodehid.devices();
                    devices.forEach((device) => {
                        //add all concept 2 devices
                        if (device.vendorId == usb.CONCEPT2_VENDOR_ID) {
                            var deviceInfo = new DeviceNodeHid(device);
                            deviceInfo.serialNumber = device.serialNumber;
                            deviceInfo.productId = device.productId;
                            deviceInfo.vendorId = device.vendorId;
                            deviceInfo.productName = device.product;
                            result.push(deviceInfo);
                        }
                    });
                }
                catch (error) {
                    return Promise.reject(error);
                }
                return Promise.resolve(result);
            }
        }
        usb.DriverNodeHid = DriverNodeHid;
    })(usb = ergometer.usb || (ergometer.usb = {}));
})(ergometer || (ergometer = {}));
var ergometer;
(function (ergometer) {
    var usb;
    (function (usb) {
        class DeviceWebHid {
            constructor(deviceInfo) {
                this._deviceInfo = deviceInfo;
            }
            callError(err) {
                if (this._onError)
                    this._onError(err);
            }
            disconnected(device) {
                if (device == this._deviceInfo) {
                    this.detachDisconnect();
                    if (this._disconnect) {
                        this._disconnect();
                    }
                }
            }
            open(disconnect, error, receiveData) {
                if (!this._deviceInfo.opened) {
                    this._disconnect = disconnect;
                    this._receiveData = receiveData;
                    this._deviceInfo.oninputreport = this.receivedReport.bind(this);
                    //this._deviceInfo.addEventListener('oninputreport', this.receivedReportd.bind(this));
                    //navigator.hid.ondisconnect=this.disconnected.bind(this);
                    //navigator.hid.addEventListener('ondisconnect', this.disconnected.bind(this));
                    this._deviceInfo.productId;
                }
                return this._deviceInfo.open();
            }
            detachDisconnect() {
                navigator.hid.removeEventListener('disconnect', this.disconnected);
            }
            close() {
                this.detachDisconnect();
                return this._deviceInfo.close();
            }
            sendData(data) {
                if (data.byteLength > usb.USB_CSAVE_SIZE)
                    return Promise.reject(`Trying to send to much data, the buffer must be smaller or equal to ${usb.USB_CSAVE_SIZE} and is ${data.byteLength}`);
                var buf = new ArrayBuffer(usb.USB_CSAVE_SIZE);
                var view = new Int8Array(buf);
                view.set(new Int8Array(data), 0);
                return this._deviceInfo.sendReport(usb.REPORT_TYPE, buf);
            }
            receivedReport(ev) {
                var inputData = ev.data;
                //todo chack on ev.reportId==REPORT_TYPE
                if (inputData && inputData.byteLength >= usb.USB_CSAVE_SIZE) {
                    //copy all results into a buffer of 120
                    var endByte = usb.USB_CSAVE_SIZE - 1;
                    while (endByte >= 0 && inputData.getUint8(endByte) == 0)
                        endByte--;
                    if (endByte >= 0 && inputData.getUint8(endByte) == ergometer.csafe.defs.FRAME_END_BYTE) {
                        //return the the data 
                        var view = new DataView(inputData.buffer, 0, endByte);
                        this._receiveData(view);
                    }
                    else
                        this.callError("end csafe frame not found");
                }
                else
                    this.callError("nothing read");
            }
        }
        usb.DeviceWebHid = DeviceWebHid;
        class DriverWebHid {
            requestDevics() {
                return new Promise((resolve, reject) => {
                    try {
                        navigator.hid.requestDevice({ filters: [{
                                    vendorId: usb.CONCEPT2_VENDOR_ID,
                                }] }).then((devices) => {
                            if (devices.length > 0) {
                                var device = devices[0];
                                var deviceInfo = new DeviceWebHid(device);
                                //deviceInfo.serialNumber=device.;
                                deviceInfo.productId = device.productId;
                                deviceInfo.vendorId = device.vendorId;
                                deviceInfo.productName = device.productName;
                                resolve([deviceInfo]);
                            }
                            else
                                reject("device not found");
                        }).catch(reject);
                    }
                    catch (error) {
                        return Promise.reject(error);
                    }
                });
            }
        }
        usb.DriverWebHid = DriverWebHid;
    })(usb = ergometer.usb || (ergometer.usb = {}));
})(ergometer || (ergometer = {}));
var ergometer;
(function (ergometer) {
    var usb;
    (function (usb) {
        class DeviceCordovaHid {
            constructor(device) {
                this._device = device;
            }
            callError(err) {
                if (this._onError)
                    this._onError(err);
            }
            disconnected(device) {
                if (this._disconnect) {
                    this._disconnect();
                }
            }
            open(disconnect, error, receiveData) {
                this._disconnect = disconnect;
                this._receiveData = receiveData;
                return new Promise((resolve, reject) => {
                    //cordova.plugins.UsbHid.registerReadCallback(this.receivedData.bind(this)).then(() => {
                    cordova.plugins.UsbHid.requestPermission(this._device)
                        .then(() => {
                        return cordova.plugins.UsbHid.open({
                            packetSize: usb.WRITE_BUF_SIZE,
                            timeout: 1000,
                            skippFirstByteZero: true
                        });
                    }).then(resolve, reject);
                    //   }).catch(reject);
                });
            }
            close() {
                return cordova.plugins.UsbHid.close();
            }
            sendData(data) {
                if (data.byteLength > usb.USB_CSAVE_SIZE)
                    return Promise.reject(`Trying to send to much data, the buffer must be smaller or equal to ${usb.USB_CSAVE_SIZE} and is ${data.byteLength}`);
                return new Promise((resolve, reject) => {
                    try {
                        var buf = new ArrayBuffer(usb.WRITE_BUF_SIZE);
                        var view = new Int8Array(buf);
                        view.set([usb.REPORT_TYPE], 0);
                        view.set(new Int8Array(data), 1);
                        cordova.plugins.UsbHid.writeRead(buf).then((data) => {
                            resolve();
                            //handle the resolve later
                            setTimeout(() => {
                                if (data && data.byteLength >= usb.WRITE_BUF_SIZE) {
                                    var inputData = new DataView(data);
                                    var endByte = usb.WRITE_BUF_SIZE - 1;
                                    while (endByte >= 1 && inputData.getUint8(endByte) == 0)
                                        endByte--;
                                    if (endByte >= 1 && inputData.getUint8(endByte) == ergometer.csafe.defs.FRAME_END_BYTE) {
                                        //return the the data except for the first byte
                                        var view = new DataView(inputData.buffer, 1, endByte);
                                        this._receiveData(view);
                                    }
                                    else
                                        this.callError("end csafe frame not found");
                                }
                            }), 0;
                        }).catch(reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
        }
        usb.DeviceCordovaHid = DeviceCordovaHid;
        class DriverCordovaHid {
            requestDevics() {
                return new Promise((resolve, reject) => {
                    try {
                        cordova.plugins.UsbHid.enumerateDevices().then((cordovaDevices) => {
                            var result = [];
                            cordovaDevices.forEach((device) => {
                                //add all concept 2 devices
                                if (device.vendorId == usb.CONCEPT2_VENDOR_ID.toString()) {
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
                        reject(e);
                    }
                });
            }
        }
        usb.DriverCordovaHid = DriverCordovaHid;
    })(usb = ergometer.usb || (ergometer.usb = {}));
})(ergometer || (ergometer = {}));
/**
 * Created by tijmen on 16-01-16.
 *
 * translation of concept 2 csafe.h to typescript version  9/16/08 10:51a
 */
var ergometer;
/**
 * Created by tijmen on 16-01-16.
 *
 * translation of concept 2 csafe.h to typescript version  9/16/08 10:51a
 */
(function (ergometer) {
    var csafe;
    (function (csafe) {
        var defs;
        (function (defs) {
            /* Frame contents */
            defs.EXT_FRAME_START_BYTE = 0xF0;
            defs.FRAME_START_BYTE = 0xF1;
            defs.FRAME_END_BYTE = 0xF2;
            defs.FRAME_STUFF_BYTE = 0xF3;
            defs.FRAME_MAX_STUFF_OFFSET_BYTE = 0x03;
            defs.FRAME_FLG_LEN = 2;
            defs.EXT_FRAME_ADDR_LEN = 2;
            defs.FRAME_CHKSUM_LEN = 1;
            defs.SHORT_CMD_TYPE_MSK = 0x80;
            defs.LONG_CMD_HDR_LENGTH = 2;
            defs.LONG_CMD_BYTE_CNT_OFFSET = 1;
            defs.RSP_HDR_LENGTH = 2;
            defs.FRAME_STD_TYPE = 0;
            defs.FRAME_EXT_TYPE = 1;
            defs.DESTINATION_ADDR_HOST = 0x00;
            defs.DESTINATION_ADDR_ERG_MASTER = 0x01;
            defs.DESTINATION_ADDR_BROADCAST = 0xFF;
            defs.DESTINATION_ADDR_ERG_DEFAULT = 0xFD;
            defs.FRAME_MAXSIZE = 96;
            defs.INTERFRAMEGAP_MIN = 50; // msec
            defs.CMDUPLIST_MAXSIZE = 10;
            defs.MEMORY_BLOCKSIZE = 64;
            defs.FORCEPLOT_BLOCKSIZE = 32;
            defs.HEARTBEAT_BLOCKSIZE = 32;
            /* Manufacturer Info */
            defs.MANUFACTURE_ID = 22; // assigned by Fitlinxx for Concept2
            defs.CLASS_ID = 2; // standard CSAFE equipment
            defs.MODEL_NUM = 5; // PM4
            defs.UNITS_TYPE = 0; // Metric
            defs.SERIALNUM_DIGITS = 9;
            defs.HMS_FORMAT_CNT = 3;
            defs.YMD_FORMAT_CNT = 3;
            defs.ERRORCODE_FORMAT_CNT = 3;
            /* Command space partitioning for standard commands */
            defs.CTRL_CMD_LONG_MIN = 0x01;
            defs.CFG_CMD_LONG_MIN = 0x10;
            defs.DATA_CMD_LONG_MIN = 0x20;
            defs.AUDIO_CMD_LONG_MIN = 0x40;
            defs.TEXTCFG_CMD_LONG_MIN = 0x60;
            defs.TEXTSTATUS_CMD_LONG_MIN = 0x65;
            defs.CAP_CMD_LONG_MIN = 0x70;
            defs.PMPROPRIETARY_CMD_LONG_MIN = 0x76;
            defs.CTRL_CMD_SHORT_MIN = 0x80;
            defs.STATUS_CMD_SHORT_MIN = 0x91;
            defs.DATA_CMD_SHORT_MIN = 0xA0;
            defs.AUDIO_CMD_SHORT_MIN = 0xC0;
            defs.TEXTCFG_CMD_SHORT_MIN = 0xE0;
            defs.TEXTSTATUS_CMD_SHORT_MIN = 0xE5;
            /* Command space partitioning for PM proprietary commands */
            defs.GETPMCFG_CMD_SHORT_MIN = 0x80;
            defs.GETPMCFG_CMD_LONG_MIN = 0x50;
            defs.SETPMCFG_CMD_SHORT_MIN = 0xE0;
            defs.SETPMCFG_CMD_LONG_MIN = 0x00;
            defs.GETPMDATA_CMD_SHORT_MIN = 0xA0;
            defs.GETPMDATA_CMD_LONG_MIN = 0x68;
            defs.SETPMDATA_CMD_SHORT_MIN = 0xD0;
            defs.SETPMDATA_CMD_LONG_MIN = 0x30;
            ;
            /* Status byte flag and mask definitions */
            defs.PREVOK_FLG = 0x00;
            defs.PREVREJECT_FLG = 0x10;
            defs.PREVBAD_FLG = 0x20;
            defs.PREVNOTRDY_FLG = 0x30;
            defs.PREVFRAMESTATUS_MSK = 0x30;
            defs.SLAVESTATE_ERR_FLG = 0x00;
            defs.SLAVESTATE_RDY_FLG = 0x01;
            defs.SLAVESTATE_IDLE_FLG = 0x02;
            defs.SLAVESTATE_HAVEID_FLG = 0x03;
            defs.SLAVESTATE_INUSE_FLG = 0x05;
            defs.SLAVESTATE_PAUSE_FLG = 0x06;
            defs.SLAVESTATE_FINISH_FLG = 0x07;
            defs.SLAVESTATE_MANUAL_FLG = 0x08;
            defs.SLAVESTATE_OFFLINE_FLG = 0x09;
            defs.FRAMECNT_FLG = 0x80;
            defs.SLAVESTATE_MSK = 0x0F;
            /* AUTOUPLOAD_CMD flag definitions */
            defs.AUTOSTATUS_FLG = 0x01;
            defs.UPSTATUS_FLG = 0x02;
            defs.UPLIST_FLG = 0x04;
            defs.ACK_FLG = 0x10;
            defs.EXTERNCONTROL_FLG = 0x40;
            /* CSAFE Slave Capabilities Codes */
            defs.CAPCODE_PROTOCOL = 0x00;
            defs.CAPCODE_POWER = 0x01;
            defs.CAPCODE_TEXT = 0x02;
            /* CSAFE units format definitions: <type>_<unit>_<tens>_<decimals> */
            defs.DISTANCE_MILE_0_0 = 0x01;
            defs.DISTANCE_MILE_0_1 = 0x02;
            defs.DISTANCE_MILE_0_2 = 0x03;
            defs.DISTANCE_MILE_0_3 = 0x04;
            defs.DISTANCE_FEET_0_0 = 0x05;
            defs.DISTANCE_INCH_0_0 = 0x06;
            defs.WEIGHT_LBS_0_0 = 0x07;
            defs.WEIGHT_LBS_0_1 = 0x08;
            defs.DISTANCE_FEET_1_0 = 0x0A;
            defs.SPEED_MILEPERHOUR_0_0 = 0x10;
            defs.SPEED_MILEPERHOUR_0_1 = 0x11;
            defs.SPEED_MILEPERHOUR_0_2 = 0x12;
            defs.SPEED_FEETPERMINUTE_0_0 = 0x13;
            defs.DISTANCE_KM_0_0 = 0x21;
            defs.DISTANCE_KM_0_1 = 0x22;
            defs.DISTANCE_KM_0_2 = 0x23;
            defs.DISTANCE_METER_0_0 = 0x24;
            defs.DISTANCE_METER_0_1 = 0x25;
            defs.DISTANCE_CM_0_0 = 0x26;
            defs.WEIGHT_KG_0_0 = 0x27;
            defs.WEIGHT_KG_0_1 = 0x28;
            defs.SPEED_KMPERHOUR_0_0 = 0x30;
            defs.SPEED_KMPERHOUR_0_1 = 0x31;
            defs.SPEED_KMPERHOUR_0_2 = 0x32;
            defs.SPEED_METERPERMINUTE_0_0 = 0x33;
            defs.PACE_MINUTEPERMILE_0_0 = 0x37;
            defs.PACE_MINUTEPERKM_0_0 = 0x38;
            defs.PACE_SECONDSPERKM_0_0 = 0x39;
            defs.PACE_SECONDSPERMILE_0_0 = 0x3A;
            defs.DISTANCE_FLOORS_0_0 = 0x41;
            defs.DISTANCE_FLOORS_0_1 = 0x42;
            defs.DISTANCE_STEPS_0_0 = 0x43;
            defs.DISTANCE_REVS_0_0 = 0x44;
            defs.DISTANCE_STRIDES_0_0 = 0x45;
            defs.DISTANCE_STROKES_0_0 = 0x46;
            defs.MISC_BEATS_0_0 = 0x47;
            defs.ENERGY_CALORIES_0_0 = 0x48;
            defs.GRADE_PERCENT_0_0 = 0x4A;
            defs.GRADE_PERCENT_0_2 = 0x4B;
            defs.GRADE_PERCENT_0_1 = 0x4C;
            defs.CADENCE_FLOORSPERMINUTE_0_1 = 0x4F;
            defs.CADENCE_FLOORSPERMINUTE_0_0 = 0x50;
            defs.CADENCE_STEPSPERMINUTE_0_0 = 0x51;
            defs.CADENCE_REVSPERMINUTE_0_0 = 0x52;
            defs.CADENCE_STRIDESPERMINUTE_0_0 = 0x53;
            defs.CADENCE_STROKESPERMINUTE_0_0 = 0x54;
            defs.MISC_BEATSPERMINUTE_0_0 = 0x55;
            defs.BURN_CALORIESPERMINUTE_0_0 = 0x56;
            defs.BURN_CALORIESPERHOUR_0_0 = 0x57;
            defs.POWER_WATTS_0_0 = 0x58;
            defs.ENERGY_INCHLB_0_0 = 0x5A;
            defs.ENERGY_FOOTLB_0_0 = 0x5B;
            defs.ENERGY_NM_0_0 = 0x5C;
            /* Conversion constants */
            defs.KG_TO_LBS = 2.2046;
            defs.LBS_TO_KG = (1. / defs.KG_TO_LBS);
            /* ID Digits */
            defs.IDDIGITS_MIN = 2;
            defs.IDDIGITS_MAX = 5;
            defs.DEFAULT_IDDIGITS = 5;
            defs.DEFAULT_ID = 0;
            defs.MANUAL_ID = 999999999;
            /* Slave State Tiimeout Parameters */
            defs.DEFAULT_SLAVESTATE_TIMEOUT = 20; // seconds
            defs.PAUSED_SLAVESTATE_TIMEOUT = 220; // seconds
            defs.INUSE_SLAVESTATE_TIMEOUT = 6; // seconds
            defs.IDLE_SLAVESTATE_TIMEOUT = 30; // seconds
            /* Base Year */
            defs.BASE_YEAR = 1900;
            /* Default time intervals */
            defs.DEFAULT_STATUSUPDATE_INTERVAL = 256; // seconds
            defs.DEFAULT_CMDUPLIST_INTERVAL = 256; // seconds
        })(defs = csafe.defs || (csafe.defs = {}));
    })(csafe = ergometer.csafe || (ergometer.csafe = {}));
})(ergometer || (ergometer = {}));
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 * this is the core, you do not have to change this code.
 *
 */
var ergometer;
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 * this is the core, you do not have to change this code.
 *
 */
(function (ergometer) {
    var csafe;
    (function (csafe) {
        class CommandManagager {
            constructor() {
                this._commands = [];
            }
            register(createCommand) {
                this._commands.push(createCommand);
            }
            apply(buffer, monitor) {
                this._commands.forEach((command) => {
                    command(buffer, monitor);
                });
            }
        }
        csafe.CommandManagager = CommandManagager;
        csafe.commandManager = new CommandManagager();
        function registerStandardSet(functionName, command, setParams) {
            csafe.commandManager.register((buffer, monitor) => {
                buffer[functionName] = function (params) {
                    buffer.addRawCommand({
                        waitForResponse: false,
                        command: command,
                        data: setParams(params),
                        onError: params.onError
                    });
                    return buffer;
                };
            });
        }
        csafe.registerStandardSet = registerStandardSet;
        function registerStandardSetConfig(functionName, command, setParams) {
            csafe.commandManager.register((buffer, monitor) => {
                buffer[functionName] = function (params) {
                    buffer.addRawCommand({
                        waitForResponse: false,
                        command: 26 /* csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD */,
                        detailCommand: command,
                        data: setParams(params),
                        onError: params.onError
                    });
                    return buffer;
                };
            });
        }
        csafe.registerStandardSetConfig = registerStandardSetConfig;
        function registerStandardGetConfig(functionName, detailCommand, converter) {
            csafe.commandManager.register((buffer, monitor) => {
                buffer[functionName] = function (params) {
                    buffer.addRawCommand({
                        waitForResponse: true,
                        command: 26 /* csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD */,
                        detailCommand: detailCommand,
                        onDataReceived: (data) => { params.onDataReceived(converter(data)); },
                        onError: params.onError
                    });
                    return buffer;
                };
            });
        }
        csafe.registerStandardGetConfig = registerStandardGetConfig;
        function registerStandardShortGet(functionName, command, converter) {
            csafe.commandManager.register((buffer, monitor) => {
                buffer[functionName] = function (params) {
                    buffer.addRawCommand({
                        waitForResponse: true,
                        command: command,
                        onDataReceived: (data) => { params.onDataReceived(converter(data)); },
                        onError: params.onError
                    });
                    return buffer;
                };
            });
        }
        csafe.registerStandardShortGet = registerStandardShortGet;
        //
        //Proprietary Short Set Configuration Commands 
        //C2 Proprietary Long Set Configuration Commands
        function registerStandardProprietarySetConfig(functionName, command, setParams) {
            csafe.commandManager.register((buffer, monitor) => {
                buffer[functionName] = function (params) {
                    buffer.addRawCommand({
                        waitForResponse: false,
                        command: 118 /* csafe.defs.LONG_PMPROPRIETARY_CMDS.SETPMCFG_CMD */,
                        detailCommand: command,
                        data: setParams(params),
                        onError: params.onError
                    });
                    return buffer;
                };
            });
        }
        csafe.registerStandardProprietarySetConfig = registerStandardProprietarySetConfig;
        //Proprietary Short Set Data Commands 
        //C2 Proprietary Long Set Data Commands
        function registerStandardProprietarySetData(functionName, command, setParams) {
            csafe.commandManager.register((buffer, monitor) => {
                buffer[functionName] = function (params) {
                    buffer.addRawCommand({
                        waitForResponse: false,
                        command: 119 /* csafe.defs.LONG_PMPROPRIETARY_CMDS.SETPMDATA_CMD */,
                        detailCommand: command,
                        data: setParams(params),
                        onError: params.onError
                    });
                    return buffer;
                };
            });
        }
        csafe.registerStandardProprietarySetData = registerStandardProprietarySetData;
        //hoofdstuk C2 Proprietary Short Get Configuration
        function registerStandardProprietaryGetConfig(functionName, detailCommand, converter) {
            csafe.commandManager.register((buffer, monitor) => {
                buffer[functionName] = function (params) {
                    buffer.addRawCommand({
                        waitForResponse: true,
                        command: 126 /* csafe.defs.PROPRIETARY_GET_CMDS.GETPMCFG_CMD */,
                        detailCommand: detailCommand,
                        onDataReceived: (data) => { params.onDataReceived(converter(data)); },
                        onError: params.onError
                    });
                    return buffer;
                };
            });
        }
        csafe.registerStandardProprietaryGetConfig = registerStandardProprietaryGetConfig;
        //C2 Proprietary Short Get Data Commands
        function registerStandardProprietaryGetData(functionName, detailCommand, converter) {
            csafe.commandManager.register((buffer, monitor) => {
                buffer[functionName] = function (params) {
                    buffer.addRawCommand({
                        waitForResponse: true,
                        command: 127 /* csafe.defs.PROPRIETARY_GET_CMDS.GETPMDATA_CMD */,
                        detailCommand: detailCommand,
                        onDataReceived: (data) => { params.onDataReceived(converter(data)); },
                        onError: params.onError
                    });
                    return buffer;
                };
            });
        }
        csafe.registerStandardProprietaryGetData = registerStandardProprietaryGetData;
    })(csafe = ergometer.csafe || (ergometer.csafe = {}));
})(ergometer || (ergometer = {}));
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
var ergometer;
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
(function (ergometer) {
    var csafe;
    (function (csafe) {
        //----------------------------- get the stoke state ------------------------------------
        csafe.commandManager.register((buffer, monitor) => {
            buffer.getStrokeState = function (params) {
                buffer.addRawCommand({
                    waitForResponse: true,
                    command: 26 /* csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD */,
                    detailCommand: 191 /* csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKESTATE */,
                    onDataReceived: (data) => {
                        if (params.onDataReceived)
                            params.onDataReceived(data.getUint8(0));
                    },
                    onError: params.onError
                });
                return buffer;
            };
        });
        csafe.commandManager.register((buffer, monitor) => {
            buffer.getDragFactor = function (params) {
                buffer.addRawCommand({
                    waitForResponse: true,
                    command: 26 /* csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD */,
                    detailCommand: 193 /* csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_DRAGFACTOR */,
                    onDataReceived: (data) => {
                        if (params.onDataReceived)
                            params.onDataReceived(data.getUint8(0));
                    },
                    onError: params.onError
                });
                return buffer;
            };
        });
        csafe.commandManager.register((buffer, monitor) => {
            buffer.getWorkDistance = function (params) {
                buffer.addRawCommand({
                    waitForResponse: true,
                    command: 26 /* csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD */,
                    detailCommand: 163 /* csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_WORKDISTANCE */,
                    onDataReceived: (data) => {
                        if (params.onDataReceived) {
                            var distance = (data.getUint8(0) +
                                (data.getUint8(1) << 8) +
                                (data.getUint8(2) << 16) +
                                (data.getUint8(3) << 24)) / 10;
                            var fraction = (data.getUint8(4) / 10.0);
                            var workDistance = distance + fraction;
                            params.onDataReceived(workDistance);
                        }
                    },
                    onError: params.onError
                });
                return buffer;
            };
        });
        csafe.commandManager.register((buffer, monitor) => {
            buffer.getWorkTime = function (params) {
                buffer.addRawCommand({
                    waitForResponse: true,
                    command: 26 /* csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD */,
                    detailCommand: 160 /* csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_WORKTIME */,
                    onDataReceived: (data) => {
                        if (params.onDataReceived) {
                            var timeInSeconds = ((data.getUint8(0) +
                                (data.getUint8(1) << 8) +
                                (data.getUint8(2) << 16) +
                                (data.getUint8(3) << 24))) / 100;
                            var fraction = data.getUint8(4) / 100;
                            var workTimeMs = (timeInSeconds + fraction) * 1000;
                            params.onDataReceived(workTimeMs);
                        }
                    },
                    onError: params.onError
                });
                return buffer;
            };
        });
        var receivePowerCurvePart = [];
        var currentPowerCurve = [];
        var peekValue = 0;
        csafe.commandManager.register((buffer, monitor) => {
            buffer.getPowerCurve = function (params) {
                buffer.addRawCommand({
                    waitForResponse: true,
                    command: 26 /* csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD */,
                    detailCommand: 107 /* csafe.defs.PM_LONG_PULL_DATA_CMDS.PM_GET_FORCEPLOTDATA */,
                    data: [20],
                    onError: params.onError,
                    onDataReceived: function (data) {
                        if (params.onDataReceived) {
                            var bytesReturned = data.getUint8(0); //first byte
                            monitor.traceInfo("received power curve count " + bytesReturned);
                            var endFound = false;
                            if (bytesReturned > 0) {
                                //when it is going down we are near the end                            
                                var value = 0;
                                var lastValue = 0;
                                if (receivePowerCurvePart.length > 0)
                                    lastValue = receivePowerCurvePart[receivePowerCurvePart.length - 1];
                                for (var i = 1; i < bytesReturned + 1; i += 2) {
                                    value = data.getUint16(i, true); //in ltile endian format
                                    //console.log("receive curve "+value+" peek value "+peekValue);
                                    //work around the problem that since the last update we can not detect the end
                                    //when going up again near to the end it is a new curve (25% of the Peek value)
                                    //so directly send it                                    
                                    if (receivePowerCurvePart.length > 20 && lastValue < (peekValue / 4) && value > lastValue) {
                                        //console.log("going up again , split!");
                                        //console.log("Curve:" + JSON.stringify(currentPowerCurve));
                                        monitor.traceInfo("Curve:" + JSON.stringify(currentPowerCurve));
                                        currentPowerCurve = receivePowerCurvePart;
                                        receivePowerCurvePart = [];
                                        peekValue = 0;
                                        if (params.onDataReceived && currentPowerCurve.length > 4)
                                            params.onDataReceived(currentPowerCurve);
                                    }
                                    receivePowerCurvePart.push(value);
                                    if (value > peekValue)
                                        peekValue = value;
                                    lastValue = value;
                                }
                                //sometimes the last value is 0 in that case it is the end of the curve
                                if (receivePowerCurvePart.length > 10 && value === 0) {
                                    endFound = true;
                                    //console.log("end found")
                                }
                                if (!endFound) {
                                    monitor.traceInfo("received part :" + JSON.stringify(receivePowerCurvePart));
                                    //console.log("wait for next")
                                    monitor.newCsafeBuffer()
                                        .getPowerCurve({ onDataReceived: params.onDataReceived })
                                        .send();
                                }
                            }
                            else
                                endFound = true;
                            if (endFound) {
                                //console.log("send received");
                                //console.log("Curve:" + JSON.stringify(currentPowerCurve));
                                peekValue = 0;
                                currentPowerCurve = receivePowerCurvePart;
                                receivePowerCurvePart = [];
                                monitor.traceInfo("Curve:" + JSON.stringify(currentPowerCurve));
                                if (params.onDataReceived && currentPowerCurve.length > 4)
                                    params.onDataReceived(currentPowerCurve);
                            }
                        }
                    }
                });
                return buffer;
            };
        });
        csafe.commandManager.register((buffer, monitor) => {
            buffer.getStrokeStats = function (params) {
                buffer.addRawCommand({
                    waitForResponse: true,
                    command: 26 /* csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD */,
                    data: [0],
                    detailCommand: 110 /* csafe.defs.PM_LONG_PULL_DATA_CMDS.CSAFE_PM_GET_STROKESTATS */,
                    onError: params.onError,
                    onDataReceived: (data) => {
                        /*
    Byte 0: Stroke Distance (MSB)
    Byte 1: Stroke Distance (LSB)
    Byte 2: Stroke Drive Time
    Byte 3: Stroke Recovery Time (MSB)
    Byte 4: Stroke Recovery Time (LSB)
    Byte 5: Stroke Length
    Byte 6: Drive Counter (MSB)
    Byte 7: Drive Counter (LSB)
    Byte 8: Peak Drive Force (MSB)
    Byte 9: Peak Drive Force (LSB)
    Byte 10: Impulse Drive Force (MSB)
    Byte 11: Impulse Drive Force (LSB)
    Byte 12: Avg Drive Force (MSB)
    Byte 13: Avg Drive Force (LSB)
    Byte 14: Work Per Stroke (MSB)
    Byte 15: Work Per Stroke (LSB)
                        */
                        if (params.onDataReceived && data.byteLength >= 3) {
                            var strokeDistance = (data.getUint8(0) + data.getUint8(1) * 256) / 100;
                            var driveTime = data.getUint8(2);
                            var strokeRecoveryTime = data.getUint8(3) + data.getUint8(4) * 256;
                            var strokeCount = data.getUint8(6) + data.getUint8(7) * 256;
                            params.onDataReceived(strokeDistance, driveTime, strokeRecoveryTime, strokeCount);
                        }
                    }
                });
                return buffer;
            };
        });
        csafe.registerStandardGetConfig("getWorkoutType", 137 /* csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_WORKOUTTYPE */, data => data.getUint8(0));
        csafe.registerStandardGetConfig("getWorkoutState", 141 /* csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_WORKOUTSTATE */, data => data.getUint8(0));
        csafe.registerStandardGetConfig("getWorkoutIntervalCount", 159 /* csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_WORKOUTINTERVALCOUNT */, data => data.getUint8(0));
        csafe.registerStandardGetConfig("getWorkoutIntervalType", 142 /* csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_INTERVALTYPE */, data => data.getUint8(0));
        csafe.registerStandardGetConfig("getWorkoutIntervalRestTime", 207 /* csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_RESTTIME */, data => data.getUint16(0, true));
        csafe.registerStandardGetConfig("getWork", 160 /* csafe.defs.SHORT_DATA_CMDS.GETTWORK_CMD */, data => {
            var result = data.getUint8(0) * 60 * 60 +
                data.getUint8(1) * 60 +
                data.getUint8(2);
            return result * 1000;
        });
        csafe.registerStandardSet("setProgram", 36 /* csafe.defs.LONG_DATA_CMDS.SETPROGRAM_CMD */, (params) => { return [ergometer.utils.getByte(params.value, 0), 0]; });
        csafe.registerStandardSet("setTime", 17 /* csafe.defs.LONG_CFG_CMDS.SETTIME_CMD */, (params) => { return [params.hour, params.minute, params.second]; });
        csafe.registerStandardSet("setDate", 18 /* csafe.defs.LONG_CFG_CMDS.SETDATE_CMD */, (params) => { return [ergometer.utils.getByte(params.year, 0), params.month, params.day]; });
        csafe.registerStandardSet("setTimeout", 19 /* csafe.defs.LONG_CFG_CMDS.SETTIMEOUT_CMD */, (params) => { return [params.value]; });
        csafe.registerStandardSet("setWork", 32 /* csafe.defs.LONG_DATA_CMDS.SETTWORK_CMD */, (params) => { return [params.hour, params.minute, params.second]; });
        csafe.registerStandardSet("setDistance", 33 /* csafe.defs.LONG_DATA_CMDS.SETHORIZONTAL_CMD */, (params) => { return [ergometer.utils.getByte(params.value, 0), ergometer.utils.getByte(params.value, 1), params.unit]; });
        csafe.registerStandardSet("setTotalCalories", 35 /* csafe.defs.LONG_DATA_CMDS.SETCALORIES_CMD */, (params) => { return [ergometer.utils.getByte(params.value, 0), ergometer.utils.getByte(params.value, 1)]; });
        csafe.registerStandardSet("setPower", 52 /* csafe.defs.LONG_DATA_CMDS.SETPOWER_CMD */, (params) => { return [ergometer.utils.getByte(params.value, 0), ergometer.utils.getByte(params.value, 1), params.unit]; });
    })(csafe = ergometer.csafe || (ergometer.csafe = {}));
})(ergometer || (ergometer = {}));
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
var ergometer;
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
(function (ergometer) {
    var csafe;
    (function (csafe) {
        //----------------------------- get the version info ------------------------------------
        csafe.commandManager.register((buffer, monitor) => {
            buffer.getVersion = function (params) {
                buffer.addRawCommand({
                    waitForResponse: true,
                    command: 145 /* defs.SHORT_STATUS_CMDS.GETVERSION_CMD */,
                    onDataReceived: (data) => {
                        if (params.onDataReceived)
                            params.onDataReceived({
                                ManufacturerId: data.getUint8(0),
                                CID: data.getUint8(1),
                                Model: data.getUint8(2),
                                HardwareVersion: data.getUint16(3, true),
                                FirmwareVersion: data.getUint16(5, true)
                            });
                    },
                    onError: params.onError
                });
                return buffer;
            };
        });
        csafe.registerStandardShortGet("getDistance", 161 /* csafe.defs.SHORT_DATA_CMDS.GETHORIZONTAL_CMD */, (data) => { return { value: data.getUint16(0, true), unit: data.getUint8(2) }; });
        csafe.registerStandardShortGet("getPace", 166 /* csafe.defs.SHORT_DATA_CMDS.GETPACE_CMD */, (data) => { return data.getUint16(0, true); });
        csafe.registerStandardShortGet("getPower", 180 /* csafe.defs.SHORT_DATA_CMDS.GETPOWER_CMD */, (data) => { return data.getUint16(0, true); });
        csafe.registerStandardShortGet("getCadence", 167 /* csafe.defs.SHORT_DATA_CMDS.GETCADENCE_CMD */, (data) => { return data.getUint16(0, true); });
        csafe.registerStandardShortGet("getHorizontal", 161 /* csafe.defs.SHORT_DATA_CMDS.GETHORIZONTAL_CMD */, (data) => {
            var value = data.getUint16(0, true);
            return value;
        });
        csafe.registerStandardShortGet("getCalories", 163 /* csafe.defs.SHORT_DATA_CMDS.GETCALORIES_CMD */, (data) => {
            var value = data.getUint16(0, true);
            return value;
        });
        csafe.registerStandardShortGet("getHeartRate", 176 /* csafe.defs.SHORT_DATA_CMDS.GETHRCUR_CMD */, (data) => {
            var value = data.getUint8(0);
            return value;
        });
    })(csafe = ergometer.csafe || (ergometer.csafe = {}));
})(ergometer || (ergometer = {}));
var ergometer;
(function (ergometer) {
    var csafe;
    (function (csafe) {
        csafe.registerStandardProprietarySetConfig("setWorkoutType", 1 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_WORKOUTTYPE */, (params) => { return [ergometer.utils.getByte(params.value, 0)]; });
        csafe.registerStandardProprietarySetConfig("setWorkoutDuration", 3 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_WORKOUTDURATION */, (params) => { return [params.durationType, ergometer.utils.getByte(params.value, 3), ergometer.utils.getByte(params.value, 2), ergometer.utils.getByte(params.value, 1), ergometer.utils.getByte(params.value, 0)]; });
        csafe.registerStandardProprietarySetConfig("setRestDuration", 4 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_RESTDURATION */, (params) => { return [ergometer.utils.getByte(params.value, 1), ergometer.utils.getByte(params.value, 0)]; });
        csafe.registerStandardProprietarySetConfig("setSplitDuration", 5 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_SPLITDURATION */, (params) => { return [params.durationType, ergometer.utils.getByte(params.value, 3), ergometer.utils.getByte(params.value, 2), ergometer.utils.getByte(params.value, 1), ergometer.utils.getByte(params.value, 0)]; });
        csafe.registerStandardProprietarySetConfig("setTargetPaceTime", 6 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_TARGETPACETIME */, (params) => { return [ergometer.utils.getByte(params.value, 3), ergometer.utils.getByte(params.value, 2), ergometer.utils.getByte(params.value, 1), ergometer.utils.getByte(params.value, 0)]; });
        csafe.registerStandardProprietarySetConfig("setScreenState", 19 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_SCREENSTATE */, (params) => { return [ergometer.utils.getByte(params.screenType, 0), ergometer.utils.getByte(params.value, 0)]; });
        csafe.registerStandardProprietarySetConfig("setConfigureWorkout", 20 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_CONFIGURE_WORKOUT */, (params) => { return [params.programmingMode ? 1 : 0]; });
        csafe.registerStandardProprietarySetConfig("setTargetAverageWatt", 21 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_TARGETAVGWATTS */, (params) => { return [ergometer.utils.getByte(params.value, 1), ergometer.utils.getByte(params.value, 0)]; });
        csafe.registerStandardProprietarySetConfig("setTargetCaloriesPerHour", 22 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_TARGETCALSPERHR */, (params) => { return [ergometer.utils.getByte(params.value, 1), ergometer.utils.getByte(params.value, 0)]; });
        csafe.registerStandardProprietarySetConfig("setIntervalType", 23 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_INTERVALTYPE */, (params) => { return [params.value]; });
        csafe.registerStandardProprietarySetConfig("setWorkoutIntervalCount", 24 /* csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_WORKOUTINTERVALCOUNT */, (params) => { return [params.value]; });
    })(csafe = ergometer.csafe || (ergometer.csafe = {}));
})(ergometer || (ergometer = {}));
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
//to fix the problem that the base is not yet declared (not a problem during the actual build)
/// <reference path="monitorBase.ts"/>
var ergometer;
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
//to fix the problem that the base is not yet declared (not a problem during the actual build)
/// <reference path="monitorBase.ts"/>
(function (ergometer) {
    class WaitResponseBuffer {
        get commands() {
            return this._commands;
        }
        removeRemainingCommands() {
            this._commands.forEach(command => {
                if (this._monitor.logLevel >= ergometer.LogLevel.error)
                    this._monitor.handleError(`command removed without result command=${command.command} detail= ${command.detailCommand}`);
                if (command.onError)
                    command.onError("command removed without result");
            });
            this._commands = [];
        }
        timeOut() {
            this.removeRemainingCommands();
            this.remove();
            if (this._reject)
                this._reject("Time out buffer");
            if (this._monitor.logLevel >= ergometer.LogLevel.error)
                this._monitor.handleError("buffer time out");
        }
        constructor(monitor, resolve, reject, commands, timeOut) {
            //variables for parsing the csafe buffer
            //needs to be in the buffer because the parsing can be split
            //over multiple messages
            this.command = 0;
            this.commandDataIndex = 0;
            this.frameState = 0 /* FrameState.initial */;
            this.nextDataLength = 0;
            this.detailCommand = 0;
            this.statusByte = 0;
            this.monitorStatus = 0;
            this.prevFrameState = 0;
            this.calcCheck = 0;
            //commands where we are waiting for
            this._commands = [];
            this.stuffByteActive = false;
            this._monitor = monitor;
            this._resolve = resolve;
            this._reject = reject;
            this._timeOutHandle = setTimeout(this.timeOut.bind(this), timeOut);
            commands.forEach((command) => {
                if (command.waitForResponse)
                    this._commands.push(command);
            });
        }
        remove() {
            if (this._timeOutHandle) {
                clearTimeout(this._timeOutHandle);
                this._timeOutHandle = null;
            }
            this._monitor.removeResponseBuffer(this);
        }
        processedBuffer() {
            this.removeRemainingCommands();
            this.remove();
            if (this._resolve)
                this._resolve();
        }
        removedWithError(e) {
            this._commands.forEach((command) => {
                if (command.onError)
                    command.onError(e);
            });
            if (this._reject)
                this._reject(e);
        }
        receivedCSaveCommand(parsed) {
            if (this._monitor.logLevel == ergometer.LogLevel.trace)
                this._monitor.traceInfo("received command:" + JSON.stringify(parsed));
            //check on all the commands which where send and
            for (let i = 0; i < this._commands.length; i++) {
                let command = this._commands[i];
                if (command.command == parsed.command &&
                    (command.detailCommand == parsed.detailCommand ||
                        (!command.detailCommand && !parsed.detailCommand))) {
                    if (command.onDataReceived) {
                        var dataView = new DataView(parsed.data.buffer);
                        this._monitor.traceInfo("call received");
                        command.responseBuffer = this;
                        command.onDataReceived(dataView);
                    }
                    this._commands.splice(i, 1); //remove the item from the send list
                    break;
                }
            }
        }
    }
    ergometer.WaitResponseBuffer = WaitResponseBuffer;
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
    class PerformanceMonitorBase extends ergometer.MonitorBase {
        constructor() {
            super(...arguments);
            this._waitResonseBuffers = [];
            this._checksumCheckEnabled = false;
            this.sortCommands = false;
            this._sendBufferQueue = [];
        }
        initialize() {
            this._powerCurveEvent = new ergometer.pubSub.Event();
            this._powerCurveEvent.registerChangedEvent(this.enableDisableNotification.bind(this));
            this._splitCommandsWhenToBigErrorMessage = false;
            this._receivePartialBuffers = false;
            this._commandTimeout = 1000;
        }
        removeResponseBuffer(buffer) {
            var i = this._waitResonseBuffers.indexOf(buffer);
            if (i >= 0)
                this._waitResonseBuffers.splice(i, 1);
        }
        enableDisableNotification() {
            return Promise.resolve();
        }
        /**
         * returns error and other log information. Some errors can only be received using the logEvent
         * @returns {pubSub.Event<LogEvent>}
         */
        get powerCurveEvent() {
            return this._powerCurveEvent;
        }
        get powerCurve() {
            return this._powerCurve;
        }
        clearAllBuffers() {
            this.clearWaitResponseBuffers();
            this._sendBufferQueue = [];
        }
        beforeConnected() {
            this.clearAllBuffers();
        }
        /* ***************************************************************************************
         *                               csafe
         *****************************************************************************************  */
        clearWaitResponseBuffers() {
            var list = this._waitResonseBuffers;
            list.forEach(b => b.remove());
            this._waitResonseBuffers = [];
        }
        driver_write(data) {
            return Promise.reject("not implemented");
        }
        /**
         *  send everyt thing which is put into the csave buffer
         *
         * @param success
         * @param error
         * @returns {Promise<void>|Promise} use promis instead of success and error function
         */
        sendCSafeBuffer(csafeBuffer) {
            return new Promise((resolve, reject) => {
                //prepare the array to be send
                var rawCommandBuffer = csafeBuffer.rawCommands;
                var commandArray = [];
                var prevCommand = -1;
                var prevCommandIndex = -1;
                if (this.sortCommands)
                    rawCommandBuffer.sort((first, next) => { return first.command - next.command; });
                rawCommandBuffer.forEach((command) => {
                    var commandMerged = false;
                    var commandIndex = commandArray.length;
                    if (command.command >= ergometer.csafe.defs.CTRL_CMD_SHORT_MIN) {
                        commandArray.push(command.command);
                        //it is an short command
                        if (command.detailCommand || command.data) {
                            throw "short commands can not contain data or a detail command";
                        }
                    }
                    else {
                        if (command.detailCommand) {
                            if (prevCommand === command.command) {
                                //add it to the last command if it is the same command
                                //this is more efficent
                                var dataLength = 1;
                                if (command.data && command.data.length > 0)
                                    dataLength += (command.data.length + 1);
                                commandArray[prevCommandIndex + 1] += dataLength;
                                commandMerged = true;
                            }
                            else {
                                commandArray.push(command.command);
                                var dataLength = 1;
                                if (command.data && command.data.length > 0)
                                    dataLength += command.data.length + 1;
                                commandArray.push(dataLength);
                            }
                            //length for the short command
                            //the detail command
                            commandArray.push(command.detailCommand);
                        }
                        else
                            commandArray.push(command.command);
                        //the data
                        if (command.data && command.data.length > 0) {
                            commandArray.push(command.data.length);
                            commandArray = commandArray.concat(command.data);
                        }
                    }
                    if (!commandMerged) {
                        prevCommand = command.command;
                        prevCommandIndex = commandIndex;
                    }
                });
                this._sendBufferQueue.push({
                    commandArray: commandArray,
                    resolve: resolve,
                    reject: reject,
                    rawCommandBuffer: rawCommandBuffer
                });
                this.checkSendBuffer();
                //send all the csafe commands in one go
            });
        }
        checkSendBufferAtEnd() {
            if (this._sendBufferQueue.length > 0)
                setTimeout(this.checkSendBuffer.bind(this), 0);
        }
        checkSendBuffer() {
            //make sure that only one buffer is send/received at a time
            //when something to send and all received then send the next
            if (this._waitResonseBuffers.length == 0 && this._sendBufferQueue.length > 0) {
                //directly add a wait buffer so no others can send commands
                //extract the send data 
                var sendData = this._sendBufferQueue.shift();
                this.sendBufferFromQueue(sendData);
            }
        }
        sendBufferFromQueue(sendData) {
            var resolve = () => {
                if (sendData.resolve)
                    sendData.resolve();
                this.checkSendBufferAtEnd();
            };
            var reject = (err) => {
                if (sendData.reject)
                    sendData.reject(err);
                this.checkSendBufferAtEnd();
            };
            var waitBuffer = new WaitResponseBuffer(this, resolve, reject, sendData.rawCommandBuffer, this._commandTimeout);
            this._waitResonseBuffers.push(waitBuffer);
            //then send the data
            this.sendCsafeCommands(sendData.commandArray)
                .catch((e) => {
                //When it could not be send remove it
                this.removeResponseBuffer(waitBuffer);
                //send the error to all items
                waitBuffer.removedWithError(e);
                this.checkSendBufferAtEnd();
            });
        }
        sendCsafeCommands(byteArray) {
            return new Promise((resolve, reject) => {
                //is there anything to send?
                if (byteArray && byteArray.length > 0) {
                    //calc the checksum of the data to be send
                    var checksum = 0;
                    for (let i = 0; i < byteArray.length; i++)
                        checksum = checksum ^ byteArray[i];
                    var newArray = [];
                    for (let i = 0; i < byteArray.length; i++) {
                        var value = byteArray[i];
                        if (value >= 0xF0 && value <= 0xF3) {
                            newArray.push(0xF3);
                            newArray.push(value - 0xF0);
                            if (this.logLevel == ergometer.LogLevel.trace)
                                this.traceInfo("stuffed to byte:" + value);
                        }
                        else
                            newArray.push(value);
                    }
                    //prepare all the data to be send in one array
                    //begin with a start byte ad end with a checksum and an end byte
                    var bytesToSend = ([ergometer.csafe.defs.FRAME_START_BYTE].concat(newArray)).concat([checksum, ergometer.csafe.defs.FRAME_END_BYTE]);
                    if (this._splitCommandsWhenToBigErrorMessage && bytesToSend.length > this.getPacketSize())
                        reject(`Csafe commands with length ${bytesToSend.length} does not fit into buffer with size ${this.getPacketSize()} `);
                    else {
                        var sendBytesIndex = 0;
                        //continue while not all bytes are send
                        while (sendBytesIndex < bytesToSend.length) {
                            //prepare a buffer with the data which can be send in one packet
                            var bufferLength = Math.min(this.getPacketSize(), bytesToSend.length - sendBytesIndex);
                            var buffer = new ArrayBuffer(bufferLength); //start and end and
                            var dataView = new DataView(buffer);
                            var bufferIndex = 0;
                            while (bufferIndex < bufferLength) {
                                dataView.setUint8(bufferIndex, bytesToSend[sendBytesIndex]);
                                sendBytesIndex++;
                                bufferIndex++;
                            }
                            if (this.logLevel == ergometer.LogLevel.trace)
                                this.traceInfo("send csafe: " + ergometer.utils.typedArrayToHexString(buffer, true));
                            this.driver_write(dataView).then(() => {
                                this.traceInfo("csafe command send");
                                if (sendBytesIndex >= bytesToSend.length) {
                                    //resolve when all data is send
                                    resolve();
                                }
                            })
                                .catch((e) => {
                                sendBytesIndex = bytesToSend.length; //stop the loop
                                reject(e);
                            });
                        }
                    }
                    //send in packages of max 20 bytes (ble.PACKET_SIZE)
                }
                else
                    resolve();
            });
        }
        moveToNextBuffer() {
            var result = null;
            if (this.logLevel == ergometer.LogLevel.trace)
                this.traceInfo("next buffer: count=" + this._waitResonseBuffers.length);
            if (this._waitResonseBuffers.length > 0) {
                var waitBuffer = this._waitResonseBuffers[0];
                //if the first then do not wait any more                               
                waitBuffer.processedBuffer();
            }
            if (this._waitResonseBuffers.length > 0) {
                result = this._waitResonseBuffers[0];
                ;
            }
            return result;
        }
        //because of the none blocking nature, the receive
        //function tries to match the send command with the received command
        //if they are not in the same order this routine tries to match them
        handeReceivedDriverData(dataView) {
            //skipp empty 0 ble blocks
            if (this._waitResonseBuffers.length > 0 && (dataView.byteLength != 1 || dataView.getUint8(0) != 0)) {
                var waitBuffer = this._waitResonseBuffers[0];
                if (this.logLevel == ergometer.LogLevel.trace)
                    this.traceInfo("continious receive csafe: " + ergometer.utils.typedArrayToHexString(dataView.buffer, true));
                var i = 0;
                var moveToNextBuffer = false;
                while (i < dataView.byteLength && !moveToNextBuffer) {
                    var currentByte = dataView.getUint8(i);
                    if (waitBuffer.stuffByteActive && currentByte <= 3) {
                        currentByte = 0xF0 + currentByte; //unstuff
                        if (this.logLevel == ergometer.LogLevel.trace)
                            this.traceInfo("unstuffed to byte:" + currentByte);
                        waitBuffer.stuffByteActive = false;
                    }
                    else {
                        waitBuffer.stuffByteActive = (currentByte == 0xF3);
                        if (waitBuffer.stuffByteActive && this.logLevel == ergometer.LogLevel.trace)
                            this.traceInfo("start stuff byte");
                    }
                    //when stuffbyte is active then move to the next
                    if (!waitBuffer.stuffByteActive) {
                        if (waitBuffer.frameState != 0 /* FrameState.initial */) {
                            waitBuffer.calcCheck = waitBuffer.calcCheck ^ currentByte; //xor for a simple crc check
                        }
                        if (this.logLevel == ergometer.LogLevel.trace)
                            this.traceInfo(`parse: ${i}: ${ergometer.utils.toHexString(currentByte, 1)} state: ${waitBuffer.frameState} checksum:${ergometer.utils.toHexString(waitBuffer.calcCheck, 1)} `);
                        switch (waitBuffer.frameState) {
                            case 0 /* FrameState.initial */: {
                                //expect a start frame
                                if (currentByte != ergometer.csafe.defs.FRAME_START_BYTE) {
                                    moveToNextBuffer = true;
                                    if (this.logLevel == ergometer.LogLevel.trace)
                                        this.traceInfo("stop byte " + ergometer.utils.toHexString(currentByte, 1));
                                }
                                else
                                    waitBuffer.frameState = 1 /* FrameState.statusByte */;
                                waitBuffer.calcCheck = 0;
                                break;
                            }
                            case 1 /* FrameState.statusByte */:
                                {
                                    waitBuffer.frameState = 2 /* FrameState.parseCommand */;
                                    waitBuffer.statusByte = currentByte;
                                    waitBuffer.monitorStatus = currentByte & ergometer.csafe.defs.SLAVESTATE_MSK;
                                    waitBuffer.prevFrameState = ((currentByte & ergometer.csafe.defs.PREVFRAMESTATUS_MSK) >> 4);
                                    if (this.logLevel == ergometer.LogLevel.trace)
                                        this.traceInfo(`monitor status: ${waitBuffer.monitorStatus},prev frame state: ${waitBuffer.prevFrameState}`);
                                    waitBuffer._responseState = currentByte;
                                    break;
                                }
                            case 2 /* FrameState.parseCommand */: {
                                waitBuffer.command = currentByte;
                                waitBuffer.frameState = 3 /* FrameState.parseCommandLength */;
                                //the real command follows so skip this 
                                break;
                            }
                            case 3 /* FrameState.parseCommandLength */: {
                                //first work arround strange results where the status byte is the same
                                //as the the command and the frame directly ends, What is the meaning of
                                //this? some kind of status??
                                if (waitBuffer.statusByte == waitBuffer.command && currentByte == ergometer.csafe.defs.FRAME_END_BYTE) {
                                    waitBuffer.command = 0; //do not check checksum
                                    moveToNextBuffer = true;
                                }
                                else if (i == dataView.byteLength - 1 && currentByte == ergometer.csafe.defs.FRAME_END_BYTE) {
                                    var checksum = waitBuffer.command;
                                    //remove the last 2 bytes from the checksum which was added too much
                                    waitBuffer.calcCheck = waitBuffer.calcCheck ^ currentByte;
                                    waitBuffer.calcCheck = waitBuffer.calcCheck ^ waitBuffer.command;
                                    //check the calculated with the message checksum
                                    if (this._checksumCheckEnabled && checksum != waitBuffer.calcCheck)
                                        this.handleError(`Wrong checksum ${ergometer.utils.toHexString(checksum, 1)} expected ${ergometer.utils.toHexString(waitBuffer.calcCheck, 1)} `);
                                    waitBuffer.command = 0; //do not check checksum
                                    moveToNextBuffer = true;
                                }
                                else if (i < dataView.byteLength) {
                                    waitBuffer.endCommand = i + currentByte;
                                    waitBuffer.nextDataLength = currentByte;
                                    if (waitBuffer.command >= ergometer.csafe.defs.CTRL_CMD_SHORT_MIN) {
                                        waitBuffer.frameState = 6 /* FrameState.parseCommandData */;
                                    }
                                    else
                                        waitBuffer.frameState = 4 /* FrameState.parseDetailCommand */;
                                }
                                break;
                            }
                            case 4 /* FrameState.parseDetailCommand */: {
                                waitBuffer.detailCommand = currentByte;
                                waitBuffer.frameState = 5 /* FrameState.parseDetailCommandLength */;
                                break;
                            }
                            case 5 /* FrameState.parseDetailCommandLength */: {
                                waitBuffer.nextDataLength = currentByte;
                                waitBuffer.frameState = 6 /* FrameState.parseCommandData */;
                                break;
                            }
                            case 6 /* FrameState.parseCommandData */: {
                                if (!waitBuffer.commandData) {
                                    waitBuffer.commandDataIndex = 0;
                                    waitBuffer.commandData = new Uint8Array(waitBuffer.nextDataLength);
                                }
                                waitBuffer.commandData[waitBuffer.commandDataIndex] = currentByte;
                                waitBuffer.nextDataLength--;
                                waitBuffer.commandDataIndex++;
                                if (waitBuffer.nextDataLength == 0) {
                                    if (waitBuffer.command < ergometer.csafe.defs.CTRL_CMD_SHORT_MIN
                                        && i < waitBuffer.endCommand)
                                        waitBuffer.frameState = 4 /* FrameState.parseDetailCommand */;
                                    else
                                        waitBuffer.frameState = 2 /* FrameState.parseCommand */;
                                    try {
                                        waitBuffer.receivedCSaveCommand({
                                            command: waitBuffer.command,
                                            detailCommand: waitBuffer.detailCommand,
                                            data: waitBuffer.commandData
                                        });
                                    }
                                    catch (e) {
                                        this.handleError(e); //never let the receive crash the main loop
                                    }
                                    waitBuffer.commandData = null;
                                    waitBuffer.detailCommand = 0;
                                }
                                break;
                            }
                        }
                    }
                    i++;
                }
                if (this._receivePartialBuffers) {
                    //when something went wrong, the bluetooth block is endend but the frame not
                    //this is for blue tooth
                    if (moveToNextBuffer)
                        waitBuffer = this.moveToNextBuffer();
                    else if (dataView.byteLength != this.getPacketSize() && waitBuffer && waitBuffer.frameState != 0 /* FrameState.initial */) {
                        waitBuffer = this.moveToNextBuffer();
                        this.handleError("wrong csafe frame ending.");
                    }
                }
                else {
                    //for usb all should be processd, 
                    //so allways move to the next buffer at the end of parsing
                    waitBuffer = this.moveToNextBuffer();
                }
            }
        }
        getPacketSize() {
            throw "getPacketSize not implemented";
        }
        newCsafeBuffer() {
            //init the buffer when needed
            var csafeBuffer = {
                rawCommands: []
            };
            csafeBuffer.send = (sucess, error) => {
                return this.sendCSafeBuffer(csafeBuffer)
                    .then(sucess)
                    .catch(e => {
                    this.handleError(e);
                    if (error)
                        error(e);
                    return Promise.reject(e);
                });
            };
            csafeBuffer.addRawCommand = (info) => {
                csafeBuffer.rawCommands.push(info);
                return csafeBuffer;
            };
            ergometer.csafe.commandManager.apply(csafeBuffer, this);
            return csafeBuffer;
        }
    }
    ergometer.PerformanceMonitorBase = PerformanceMonitorBase;
})(ergometer || (ergometer = {}));
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
var ergometer;
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
(function (ergometer) {
    class UsbDevice {
    }
    ergometer.UsbDevice = UsbDevice;
    const WAIT_TIME_MEASURING = 30; //min ms when actively getting data when rowing or starting to row
    const WAIT_TIME_INIT = 500; //min ms
    const WAIT_TIME_LOW_RES = 200;
    class StrokeData {
        constructor() {
            this.dragFactor = 0;
            this.workDistance = 0;
            this.workTime = 0;
            this.splitTime = 0;
            this.power = 0;
            this.strokesPerMinuteAverage = 0;
            this.strokesPerMinute = 0;
            this.distance = 0;
            //time =0;  //does not yet work remove for now
            this.totCalories = 0; // accumulated calories burned  CSAFE_GETCALORIES_CMD
            this.caloriesPerHour = 0; // calories/Hr derived from pace (GETPACE)
            this.heartRate = 0;
        }
    }
    ergometer.StrokeData = StrokeData;
    class TrainingData {
        constructor() {
            this.duration = 0; //ms	
            this.distance = 0;
            this.workoutIntervalCount = 0;
            this.intervalType = 255 /* IntervalType.none */;
            this.restTime = 0;
            this.endDistance = 0;
            this.endDuration = 0;
        }
    }
    ergometer.TrainingData = TrainingData;
    ;
    class PerformanceMonitorUsb extends ergometer.PerformanceMonitorBase {
        constructor() {
            super(...arguments);
            this._nSPMReads = 0;
            this._nSPM = 0;
            this._strokeStateEvent = new ergometer.pubSub.Event();
            this._trainingDataEvent = new ergometer.pubSub.Event();
            this._strokeDataEvent = new ergometer.pubSub.Event();
            this._strokeData = new StrokeData();
            this._trainingData = new TrainingData();
            this._lastTrainingTime = new Date().getTime();
            this._lastLowResUpdate = null;
            this._autoUpdating = false;
            this._startPhaseTime = 0;
        }
        //sending and reading
        get strokeData() {
            return this._strokeData;
        }
        get trainingData() {
            return this._trainingData;
        }
        get strokeState() {
            return this._strokeState;
        }
        get device() {
            return this._device;
        }
        get strokeStateEvent() {
            return this._strokeStateEvent;
        }
        get trainingDataEvent() {
            return this._trainingDataEvent;
        }
        get strokeDataEvent() {
            return this._strokeDataEvent;
        }
        static canUseNodeHid() {
            return typeof nodehid != "undefined";
        }
        static canUseWebHid() {
            return typeof navigator.hid != "undefined";
        }
        static canUseCordovaHid() {
            return typeof cordova != "undefined" && typeof cordova.plugins != "undefined" && typeof cordova.plugins.UsbHid != "undefined";
        }
        static canUseUsb() {
            return PerformanceMonitorUsb.canUseNodeHid() ||
                PerformanceMonitorUsb.canUseWebHid() ||
                PerformanceMonitorUsb.canUseCordovaHid();
        }
        initialize() {
            super.initialize();
            this.initDriver();
            this._splitCommandsWhenToBigErrorMessage = false;
            this._receivePartialBuffers = false;
        }
        initDriver() {
            if (PerformanceMonitorUsb.canUseNodeHid()) {
                this._driver = new ergometer.usb.DriverNodeHid();
            }
            else if (PerformanceMonitorUsb.canUseCordovaHid()) {
                this._driver = new ergometer.usb.DriverCordovaHid();
            }
            else if (PerformanceMonitorUsb.canUseWebHid()) {
                this._driver = new ergometer.usb.DriverWebHid();
            }
        }
        checkInitDriver() {
            if (!this._driver)
                this.initDriver();
            if (!this._driver)
                throw "No suitable driver found";
        }
        get driver() {
            return this._driver;
        }
        set driver(value) {
            this._driver = value;
        }
        driver_write(data) {
            if (this.connectionState != ergometer.MonitorConnectionState.readyForCommunication)
                return Promise.reject("Can not write, erogmeter is not connected");
            return new Promise((resolve, reject) => {
                this._device.sendData(data.buffer)
                    .then(resolve)
                    .catch((err) => {
                    //the usb has not an disconnect event, assume an error is an disconnect
                    this.disconnected();
                    reject(err);
                });
            });
        }
        receiveData(data) {
            this.handeReceivedDriverData(data);
        }
        sendCSafeBuffer(csafeBuffer) {
            if (this.connectionState != ergometer.MonitorConnectionState.readyForCommunication)
                return Promise.reject("can not send data, not connected");
            return new Promise((resolve, reject) => {
                if (this.connectionState != ergometer.MonitorConnectionState.readyForCommunication)
                    reject("can not send data, not connected");
                //if buzy try again later, send receive one at a time
                /*if (this.csafeSendBuzy) {
                    return Promise.reject("can not send data, ergometer send is aready buzy");
                }
                else*/
                {
                    this.traceInfo("send " + JSON.stringify(csafeBuffer.rawCommands));
                    //the send will resolve when all is received
                    super.sendCSafeBuffer(csafeBuffer).then(() => {
                        resolve();
                    }).catch((e) => {
                        this.disconnected(); //the usb has not an disconnect event, assume an error is an disconnect
                        this.handleError(e);
                        this.traceInfo("end buzy");
                        reject(e);
                    });
                }
            });
        }
        requestDevics() {
            return new Promise((resolve, reject) => {
                try {
                    this.checkInitDriver();
                    this._driver.requestDevics().then((driverDevices) => {
                        var result = [];
                        driverDevices.forEach((driverDevice) => {
                            var device = new UsbDevice();
                            device.productId = driverDevice.productId;
                            device.productName = driverDevice.productName;
                            device.vendorId = driverDevice.vendorId;
                            device.serialNumber = driverDevice.serialNumber;
                            device._internalDevice = driverDevice;
                            result.push(device);
                        });
                        resolve(result);
                    }).catch(reject);
                }
                catch (e) {
                    reject(e);
                }
            });
        }
        disconnect() {
            if (this.connectionState >= ergometer.MonitorConnectionState.deviceReady) {
                if (this._device)
                    this._device.close();
                this.changeConnectionState(ergometer.MonitorConnectionState.deviceReady);
            }
        }
        disconnected() {
            if (this._device) {
                this.changeConnectionState(ergometer.MonitorConnectionState.deviceReady);
                this._device = null;
            }
        }
        connectToDevice(device) {
            if (!this._driver)
                return Promise.reject("driver not set");
            if (!device)
                return Promise.reject("device is null");
            this._device = device._internalDevice;
            this.changeConnectionState(ergometer.MonitorConnectionState.connecting);
            var result = this._device.open(this.disconnected, this.handleError.bind(this), this.receiveData.bind(this));
            result.then(() => {
                this.changeConnectionState(ergometer.MonitorConnectionState.connected);
                this.changeConnectionState(ergometer.MonitorConnectionState.readyForCommunication);
            });
            return result;
        }
        getPacketSize() {
            return ergometer.usb.USB_CSAVE_SIZE - 1;
        }
        highResolutionUpdate() {
            this.traceInfo("start high res update");
            var previousStrokeState = this.strokeState;
            return new Promise((resolve, reject) => {
                this.newCsafeBuffer()
                    .getStrokeState({
                    onDataReceived: (strokeState) => {
                        // Update the stroke phase.
                        this.newStrokeState(strokeState);
                    }
                })
                    .send()
                    .then(() => {
                    this.traceInfo("end high res update");
                    if (this.strokeState != previousStrokeState) {
                        // If this is the dwell, complete the power curve.
                        //if (_previousStrokePhase == StrokePhase_Drive)
                        var now = new Date().getTime();
                        var doPowerCurveUpdate = this.strokeState == 4 /* StrokeState.recoveryState */;
                        if (doPowerCurveUpdate ||
                            this._lastLowResUpdate == null ||
                            (!this.isWaiting && (now - this._lastLowResUpdate) > WAIT_TIME_LOW_RES)) {
                            this._lastLowResUpdate = now;
                            this.traceInfo("Start low res update");
                            this.lowResolutionUpdate().then(() => {
                                if (doPowerCurveUpdate && this.powerCurveEvent.count > 0) {
                                    this.traceInfo("start power curveupdate");
                                    this.handlePowerCurve().then(() => {
                                        this.traceInfo("end power curve and end low res update");
                                        this.traceInfo("resolve high");
                                        resolve();
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
            });
        }
        handlePowerCurve() {
            return this.newCsafeBuffer()
                .getPowerCurve({
                onDataReceived: (curve) => {
                    this.powerCurveEvent.pub(curve);
                    this._powerCurve = curve;
                }
            })
                .send();
        }
        connected() {
            super.connected();
            //when connected start monitoring after all is handled
            setTimeout(() => {
                this.autoUpdate();
            }, 500);
        }
        listeningToEvents() {
            return;
        }
        autoUpdate(first = true) {
            this.traceInfo("auto update :" + first);
            //check on start if any one is listening, if not then
            //do not start the auto updating llop
            if (first && (this.strokeStateEvent.count == 0 &&
                this.trainingDataEvent.count == 0 &&
                this.strokeStateEvent.count == 0))
                return;
            //preventing starting update twice 
            //and stop when not connected any more
            if (this.connectionState == ergometer.MonitorConnectionState.readyForCommunication
                && (!first || !this._autoUpdating)) {
                this._autoUpdating = true;
                //do not update while an csafe read write action is active
                //it is possible but you can get unexpected results because it may
                //change the order of things
                //ensure that allways an next update is called
                try {
                    this.update().then(() => {
                        this.nextAutoUpdate();
                    }).catch(error => {
                        this.handleError(error);
                        this.nextAutoUpdate();
                    });
                }
                catch (error) {
                    this.handleError(error);
                    this.nextAutoUpdate();
                }
            }
            else {
                this.traceInfo("no auto update");
                this._autoUpdating = false;
            }
        }
        isWaiting() {
            const waitingStates = [0 /* WorkoutState.waitToBegin */,
                10 /* WorkoutState.workoutEnd */,
                11 /* WorkoutState.terminate */,
                12 /* WorkoutState.workoutLogged */,
                13 /* WorkoutState.rearm */];
            return (this.strokeState == 0 /* StrokeState.waitingForWheelToReachMinSpeedState */)
                && waitingStates.indexOf(this.trainingData.workoutState) >= 0;
        }
        nextAutoUpdate() {
            this.traceInfo("nextAutoUpdate");
            var waitTime = this.isWaiting() ? WAIT_TIME_INIT : WAIT_TIME_MEASURING;
            if (this.connectionState == ergometer.MonitorConnectionState.readyForCommunication) {
                setTimeout(() => { this.autoUpdate(false); }, waitTime);
            }
            else
                this._autoUpdating = false;
        }
        update() {
            return new Promise((resolve, reject) => {
                this.highResolutionUpdate().then(() => {
                    var currenttime = new Date().getTime();
                    var diff = currenttime - this._lastTrainingTime; //note _lastTraingTime is initialized in trainingDataUpdate, which is called in the begining
                    //when work out is buzy update every second, before update every 200 ms
                    if ((this.trainingData.workoutState != 1 /* WorkoutState.workoutRow */ && diff > 200) ||
                        (this.trainingData.workoutState == 1 /* WorkoutState.workoutRow */ && diff > 1000)) {
                        this.traceInfo("start training update");
                        this.trainingDataUpdate().then(() => {
                            this.traceInfo("resolved training update");
                            resolve();
                        }, reject);
                    }
                    else
                        resolve();
                }).catch(reject);
            });
        }
        calcStrokeStateDuration() {
            var duration = 0;
            if (this.strokeState == 4 /* StrokeState.recoveryState */ ||
                this.strokeState == 2 /* StrokeState.drivingState */) {
                var endPhase = new Date().getTime();
                duration = endPhase - this._startPhaseTime;
                this._startPhaseTime = endPhase;
            }
            if (this.strokeState == 1 /* StrokeState.waitingForWheelToAccelerateState */ ||
                this.strokeState == 0 /* StrokeState.waitingForWheelToReachMinSpeedState */) {
                this._startPhaseTime = new Date().getTime();
            }
            return duration;
        }
        lowResolutionUpdate() {
            return this.newCsafeBuffer()
                .getDragFactor({
                onDataReceived: (value) => {
                    this.strokeData.dragFactor = value;
                }
            })
                .getWorkDistance({
                onDataReceived: (value) => {
                    this.strokeData.workDistance = value;
                }
            })
                /*.getWork({onDataReceived: (value) => {
                     this.strokeData.time=value;
                }})*/
                .getPace({
                onDataReceived: (pace) => {
                    var caloriesPerHour = 0;
                    var paced = pace / 1000.0; // formular needs pace in sec/m (not sec/km)
                    if (pace > 0) {
                        //get cal/hr: Calories/Hr = (((2.8 / ( pace * pace * pace )) * ( 4.0 * 0.8604)) + 300.0)
                        var paced = pace / 1000.0; // formular needs pace in sec/m (not sec/km)
                        caloriesPerHour = Math.round(((2.8 / (paced * paced * paced)) * (4.0 * 0.8604)) + 300.0);
                    }
                    this.strokeData.caloriesPerHour = caloriesPerHour;
                    // get pace in seconds / 500m           
                    var fPace = pace / 2.0;
                    this.strokeData.splitTime = fPace * 1000; //from seconds to ms
                }
            })
                .getCalories({
                onDataReceived: (value) => {
                    this.strokeData.totCalories = value;
                }
            })
                .getCadence({
                onDataReceived: (value) => {
                    if (value > 0) {
                        this._nSPM += value;
                        this._nSPMReads++;
                        this.strokeData.strokesPerMinute = value;
                        this.strokeData.strokesPerMinuteAverage = this._nSPM / this._nSPMReads;
                    }
                }
            })
                .getPower({
                onDataReceived: (value) => {
                    this.strokeData.power = value;
                }
            })
                .getWorkTime({
                onDataReceived: (value) => {
                    this.strokeData.workTime = value;
                }
            })
                .getHorizontal({
                onDataReceived: (value) => {
                    this.strokeData.distance = value;
                }
            })
                .getHeartRate({
                onDataReceived: (value) => {
                    this.strokeData.heartRate = value;
                }
            })
                .getStrokeStats({
                onDataReceived: (strokeDistance, driveTime, strokeRecoveryTime, strokeCount) => {
                    this.strokeData.strokeDistance = strokeDistance;
                    this.strokeData.driveTime = driveTime;
                    this.strokeData.strokeRecoveryTime = strokeRecoveryTime;
                    this.strokeData.strokeCount = strokeCount;
                    this.strokeDataEvent.pub(this.strokeData);
                }
            })
                .send()
                .then(() => {
                /*console.log({
                    workTime:this.strokeData.workTime,
                    distance:this.strokeData.distance ,
                    workDistance: this.strokeData.workDistance

                });*/
                this.traceInfo("after low res update");
                this.strokeDataEvent.pub(this.strokeData);
            });
        }
        newStrokeState(state) {
            if (state != this.strokeState) {
                var oldState = this.strokeState;
                this._strokeState = state;
                var duration = this.calcStrokeStateDuration();
                this.strokeStateEvent.pub(oldState, state, duration);
            }
        }
        trainingDataUpdate() {
            this._lastTrainingTime = new Date().getTime();
            var changed = false;
            var strokeDataChanged = false;
            var actualDistance = 0;
            var actualTime = 0;
            var duration = 0;
            var distance = 0;
            return this.newCsafeBuffer()
                .getWorkoutType({ onDataReceived: (value) => {
                    if (this.trainingData.workoutType != value) {
                        this.trainingData.workoutType = value;
                        changed = true;
                    }
                } })
                .getWorkoutState({ onDataReceived: (value) => {
                    if (this.trainingData.workoutState != value) {
                        this.trainingData.workoutState = value;
                        changed = true;
                    }
                } })
                .getWorkoutIntervalCount({ onDataReceived: (value) => {
                    if (this.trainingData.workoutIntervalCount != value) {
                        this.trainingData.workoutIntervalCount = value;
                        changed = true;
                    }
                } })
                .getWorkoutIntervalType({ onDataReceived: (value) => {
                    if (this.trainingData.intervalType != value) {
                        this.trainingData.intervalType = value;
                        changed = true;
                    }
                } })
                .getWorkoutIntervalRestTime({ onDataReceived: (value) => {
                    if (this.trainingData.restTime != value) {
                        this.trainingData.restTime = value;
                        changed = true;
                    }
                } })
                .getWorkTime({ onDataReceived: (value) => {
                    duration = value;
                } })
                .getWorkDistance({ onDataReceived: (value) => {
                    distance = value;
                } })
                .getWork({ onDataReceived: (value) => {
                    actualTime = value;
                } })
                .getHorizontal({ onDataReceived: (value) => {
                    actualDistance = value;
                } })
                .send()
                .then(() => {
                /* console.log({
                     duration:duration,
                     distance:distance,
                     actualTime:actualTime,
                     actualDistance:actualDistance,
                     workoutState:this.trainingData.workoutState
                 });*/
                //total time and distance can be changed because the rower is rowing.
                //the work time and work distance should be 0 for initial change
                if (this.strokeState <= 1 /* StrokeState.waitingForWheelToAccelerateState */ &&
                    actualDistance == 0) {
                    //we are here just before the rower starts, if there are still values
                    //of the previous race, then reset
                    if (this._nSPM != 0) {
                        this.resetStartRowing();
                        strokeDataChanged = true;
                    }
                    var durationRound = Math.round(duration);
                    if (this.trainingData.duration != durationRound) {
                        this.trainingData.duration = durationRound;
                        changed = true;
                    }
                    var distanceRound = Math.round(distance);
                    if (this.trainingData.distance != distanceRound) {
                        this.trainingData.distance = distanceRound;
                        changed = true;
                    }
                }
                //if (_trainingData.workoutState==wsWorkoutLogged) {
                //    _trainingData.endDuration=_trainingData.endDuration;
                //}
                if (this.trainingData.workoutState == 12 /* WorkoutState.workoutLogged */ &&
                    ((this.trainingData.endDuration === 0) &&
                        (this.trainingData.endDistance === 0))) {
                    //otherwise the work time does not reflect the last time and distance
                    if (this.trainingData.workoutType >= 2 /* WorkoutType.fixedDistanceNoAplits */ &&
                        this.trainingData.workoutType <= 5 /* WorkoutType.fixedTimeSplits */) {
                        if (this.trainingData.duration && this.trainingData.duration > 0) { //doing an fixed time
                            this.strokeData.workTime = this.trainingData.duration;
                            this.strokeData.workDistance = distance;
                            //this.strokeData.time=duration;
                            this.strokeData.distance = distance;
                            this.trainingData.endDistance = distance;
                            this.trainingData.endDuration = this.trainingData.duration;
                            //console.log("Fixed time Send stroke state and training");
                        }
                        else if (this.trainingData.distance > 0) { //doing a fixed distance
                            this.strokeData.workTime = duration;
                            this.strokeData.workDistance = 0;
                            //this.strokeData.time=duration;
                            this.strokeData.distance = distance;
                            this.trainingData.endDistance = this.trainingData.distance;
                            this.trainingData.endDuration = duration;
                            //console.log("Fixed distance Send stroke state and training");
                        }
                        strokeDataChanged = true; //send the updated last end time/ duration to the server
                    }
                    changed = true;
                }
                if (this.trainingData.workoutState != 12 /* WorkoutState.workoutLogged */ &&
                    (this.trainingData.endDistance || this.trainingData.endDistance != 0 ||
                        this.trainingData.endDuration != 0 || this.trainingData.endDuration)) {
                    this.trainingData.endDistance = 0;
                    this.trainingData.endDuration = 0;
                    changed = true;
                }
                if (strokeDataChanged)
                    this._strokeDataEvent.pub(this.strokeData);
                if (changed)
                    this.trainingDataEvent.pub(this.trainingData);
            });
        }
        resetStartRowing() {
            //reset the averages
            this._nSPM = 0;
            this._nSPMReads = 0;
            this.strokeData.dragFactor = 0;
            //this.strokeData.workDistance =0 ; 
            //this.strokeData.workTime =0;
            this.strokeData.splitTime = 0;
            this.strokeData.power = 0;
            this.strokeData.strokesPerMinuteAverage = 0;
            this.strokeData.strokesPerMinute = 0;
            this.strokeData.distance = 0;
            //this.strokeData.time =0;
            this.strokeData.totCalories = 0; // accumulated calories burned  CSAFE_GETCALORIES_CMD
            this.strokeData.caloriesPerHour = 0; // calories/Hr derived from pace (GETPACE)
            this.strokeData.heartRate = 0;
        }
    }
    ergometer.PerformanceMonitorUsb = PerformanceMonitorUsb;
})(ergometer || (ergometer = {}));
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
var ergometer;
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
(function (ergometer) {
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
    class PerformanceMonitorBle extends ergometer.PerformanceMonitorBase {
        constructor() {
            super(...arguments);
            this._devices = [];
            this._multiplex = false;
            this._multiplexSubscribeCount = 0;
            this._sampleRate = 1 /* SampleRate.rate500ms */;
            //disabled the auto reconnect, because it reconnects while the connection on the device is switched off
            //this causes some strange state on the device which breaks communcation after reconnecting
            this._autoReConnect = false;
            this._generalStatusEventAttachedByPowerCurve = false;
            this._recording = false;
            this._registeredGuids = {};
        }
        get recordingDriver() {
            if (!this._recordingDriver) {
                this._recordingDriver = new ergometer.ble.RecordingDriver(this, this._driver);
            }
            return this._recordingDriver;
        }
        set driver(value) {
            this._driver = value;
        }
        get recording() {
            return this._recording;
        }
        set recording(value) {
            this._recording = value;
            if (value)
                this.recordingDriver.startRecording();
        }
        get replayDriver() {
            if (!this._replayDriver)
                this._replayDriver = new ergometer.ble.ReplayDriver(this, this._driver);
            return this._replayDriver;
        }
        get replaying() {
            return this.replayDriver.playing;
        }
        replay(events) {
            this.replayDriver.replay(events);
        }
        set replaying(value) {
            this.replayDriver.playing = value;
        }
        get recordingEvents() {
            return this.recordingDriver.events;
        }
        set recordingEvents(value) {
            this.recordingDriver.events = value;
        }
        get driver() {
            if (this.recording) {
                return this.recordingDriver;
            }
            else if (this.replaying)
                return this.replayDriver;
            else
                return this._driver;
        }
        /**
         * when the connection is lost re-connect
         * @returns {boolean}
         */
        get autoReConnect() {
            return this._autoReConnect;
        }
        /**
         *
         * when the connection is lost re-connect
         * @param value
         */
        set autoReConnect(value) {
            this._autoReConnect = value;
        }
        /**
         * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
         * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
         * the documentation in the properties You must set the multi plex property before connecting
         *
         * @returns {boolean}
         */
        get multiplex() {
            return this._multiplex;
        }
        /**
         * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
         * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
         * the documentation in the properties You must set the multi plex property before connecting
         * @param value
         */
        set multiplex(value) {
            if (value != this._multiplex) {
                if (this.connectionState >= ergometer.MonitorConnectionState.servicesFound)
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
        get devices() {
            return this._devices;
        }
        /**
         * The values of the last rowingGeneralStatus event
         *
         * @returns {RowingGeneralStatus}
         */
        get rowingGeneralStatus() {
            return this._rowingGeneralStatus;
        }
        /**
         * The values of the last rowingAdditionalStatus1 event
         * @returns {RowingAdditionalStatus1}
         */
        get rowingAdditionalStatus1() {
            return this._rowingAdditionalStatus1;
        }
        /**
         * The values of the last RowingAdditionalStatus2 event
         * @returns {RowingAdditionalStatus2}
         */
        get rowingAdditionalStatus2() {
            return this._rowingAdditionalStatus2;
        }
        /**
         *  The values of the last rowingStrokeData event
         * @returns {RowingStrokeData}
         */
        get rowingStrokeData() {
            return this._rowingStrokeData;
        }
        /**
         * The values of the last rowingAdditionalStrokeData event
         * @returns {RowingAdditionalStrokeData}
         */
        get rowingAdditionalStrokeData() {
            return this._rowingAdditionalStrokeData;
        }
        /**
         * The values of the last rowingSplitIntervalData event
         * @returns {RowingSplitIntervalData}
         */
        get rowingSplitIntervalData() {
            return this._rowingSplitIntervalData;
        }
        /**
         * The values of the last rowingAdditionalSplitIntervalData event
         * @returns {RowingAdditionalSplitIntervalData}
         */
        get rowingAdditionalSplitIntervalData() {
            return this._rowingAdditionalSplitIntervalData;
        }
        /**
         * The values of the last workoutSummaryData event
         * @returns {WorkoutSummaryData}
         */
        get workoutSummaryData() {
            return this._workoutSummaryData;
        }
        /**
         * The values of the last additionalWorkoutSummaryData event
         * @returns {AdditionalWorkoutSummaryData}
         */
        get additionalWorkoutSummaryData() {
            return this._additionalWorkoutSummaryData;
        }
        /**
         * The values of the last AdditionalWorkoutSummaryData2 event
         * @returns {AdditionalWorkoutSummaryData2}
         */
        get additionalWorkoutSummaryData2() {
            return this._additionalWorkoutSummaryData2;
        }
        /**
         * The values of the last heartRateBeltInformation event
         * @returns {HeartRateBeltInformation}
         */
        get heartRateBeltInformation() {
            return this._heartRateBeltInformation;
        }
        /**
         * read rowingGeneralStatus data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingGeneralStatusEvent>}
         */
        get rowingGeneralStatusEvent() {
            return this._rowingGeneralStatusEvent;
        }
        /**
         * read rowingGeneralStatus1 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus1Event>}
         */
        get rowingAdditionalStatus1Event() {
            return this._rowingAdditionalStatus1Event;
        }
        /**
         * read rowingAdditionalStatus2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus2Event>}
         */
        get rowingAdditionalStatus2Event() {
            return this._rowingAdditionalStatus2Event;
        }
        /**
         * read rowingStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingStrokeDataEvent>}
         */
        get rowingStrokeDataEvent() {
            return this._rowingStrokeDataEvent;
        }
        /**
         * read rowingAdditionalStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStrokeDataEvent>}
         */
        get rowingAdditionalStrokeDataEvent() {
            return this._rowingAdditionalStrokeDataEvent;
        }
        /**
         * read rowingSplitIntervalDat data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingSplitIntervalDataEvent>}
         */
        get rowingSplitIntervalDataEvent() {
            return this._rowingSplitIntervalDataEvent;
        }
        /**
         * read rowingAdditionalSplitIntervalData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalSplitIntervalDataEvent>}
         */
        get rowingAdditionalSplitIntervalDataEvent() {
            return this._rowingAdditionalSplitIntervalDataEvent;
        }
        /**
         * read workoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<WorkoutSummaryDataEvent>}
         */
        get workoutSummaryDataEvent() {
            return this._workoutSummaryDataEvent;
        }
        /**
         * read additionalWorkoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryDataEvent>}
         */
        get additionalWorkoutSummaryDataEvent() {
            return this._additionalWorkoutSummaryDataEvent;
        }
        /**
         * read additionalWorkoutSummaryData2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryData2Event>}
         */
        get additionalWorkoutSummaryData2Event() {
            return this._additionalWorkoutSummaryData2Event;
        }
        /**
         * read heartRateBeltInformation data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<HeartRateBeltInformationEvent>}
         */
        get heartRateBeltInformationEvent() {
            return this._heartRateBeltInformationEvent;
        }
        /**
         * Get device information of the connected device.
         * @returns {DeviceInfo}
         */
        get deviceInfo() {
            return this._deviceInfo;
        }
        /**
         * read the performance montitor sample rate. By default this is 500 ms
         * @returns {number}
         */
        get sampleRate() {
            return this._sampleRate;
        }
        /**
         * Change the performance monitor sample rate.
         * @param value
         */
        set sampleRate(value) {
            if (value != this._sampleRate) {
                var dataView = new DataView(new ArrayBuffer(1));
                dataView.setUint8(0, value);
                this.driver.writeCharacteristic(ergometer.ble.PMROWING_SERVICE, ergometer.ble.ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC, dataView)
                    .then(() => {
                    this._sampleRate = value;
                }, this.getErrorHandlerFunc("Can not set sample rate"));
            }
        }
        /**
         * disconnect the current connected device
         */
        disconnect() {
            if (this.connectionState >= ergometer.MonitorConnectionState.deviceReady) {
                this.driver.disconnect();
                this.changeConnectionState(ergometer.MonitorConnectionState.deviceReady);
            }
        }
        clearAllBuffers() {
            this.clearRegisterdGuids();
        }
        /**
         *
         */
        enableMultiplexNotification() {
            var result;
            if (this._multiplexSubscribeCount == 0)
                result = this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.MULTIPLEXED_INFO_CHARACTERISIC, (data) => { this.handleDataCallbackMulti(data); })
                    .catch(this.getErrorHandlerFunc("Can not enable multiplex"));
            else
                result = Promise.resolve();
            this._multiplexSubscribeCount++;
            return result;
        }
        /**
         *
         */
        disableMultiPlexNotification() {
            var result;
            this._multiplexSubscribeCount--;
            if (this._multiplexSubscribeCount == 0)
                result = this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.MULTIPLEXED_INFO_CHARACTERISIC)
                    .catch(this.getErrorHandlerFunc("can not disable multiplex"));
            else
                result = Promise.resolve();
            return result;
        }
        clearRegisterdGuids() {
            this._registeredGuids = {};
        }
        enableNotification(serviceUIID, characteristicUUID, receive) {
            if (this._registeredGuids[characteristicUUID] === 1)
                return Promise.resolve();
            this._registeredGuids[characteristicUUID] = 1;
            return this.driver.enableNotification(serviceUIID, characteristicUUID, receive);
        }
        disableNotification(serviceUIID, characteristicUUID) {
            if (this._registeredGuids[characteristicUUID] === 1) {
                this._registeredGuids[characteristicUUID] = 0;
                return this.driver.disableNotification(serviceUIID, characteristicUUID);
            }
            return Promise.resolve();
        }
        /**
         *
         */
        enableDisableNotification() {
            super.enableDisableNotification();
            var promises = [];
            var enableMultiPlex = false;
            if (this.connectionState >= ergometer.MonitorConnectionState.servicesFound) {
                if (this.rowingGeneralStatusEvent.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.ROWING_STATUS_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleRowingGeneralStatus);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.ROWING_STATUS_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.rowingAdditionalStatus1Event.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_STATUS1_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleRowingAdditionalStatus1);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_STATUS1_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.rowingAdditionalStatus2Event.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_STATUS2_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleRowingAdditionalStatus2);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_STATUS2_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.rowingStrokeDataEvent.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.STROKE_DATA_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleRowingStrokeData);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.STROKE_DATA_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.rowingAdditionalStrokeDataEvent.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_STROKE_DATA_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleRowingAdditionalStrokeData);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_STROKE_DATA_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.rowingSplitIntervalDataEvent.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.SPLIT_INTERVAL_DATA_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleRowingSplitIntervalData);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.SPLIT_INTERVAL_DATA_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.rowingAdditionalSplitIntervalDataEvent.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleRowingAdditionalSplitIntervalData);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.workoutSummaryDataEvent.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.ROWING_SUMMARY_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleWorkoutSummaryData);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.ROWING_SUMMARY_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.additionalWorkoutSummaryDataEvent.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_ROWING_SUMMARY_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleAdditionalWorkoutSummaryData);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.EXTRA_ROWING_SUMMARY_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.additionalWorkoutSummaryData2Event.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    //this data is only available for multi ples
                }
                if (this.heartRateBeltInformationEvent.count > 0) {
                    if (this.multiplex) {
                        enableMultiPlex = true;
                    }
                    else {
                        promises.push(this.enableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.HEART_RATE_BELT_INFO_CHARACTERISIC, (data) => {
                            this.handleDataCallback(data, this.handleHeartRateBeltInformation);
                        }).catch(this.getErrorHandlerFunc("")));
                    }
                }
                else {
                    if (!this.multiplex)
                        promises.push(this.disableNotification(ergometer.ble.PMROWING_SERVICE, ergometer.ble.HEART_RATE_BELT_INFO_CHARACTERISIC)
                            .catch(this.getErrorHandlerFunc("")));
                }
                if (this.powerCurveEvent.count > 0) {
                    //when the status changes collect the power info
                    if (!this._generalStatusEventAttachedByPowerCurve) {
                        this._generalStatusEventAttachedByPowerCurve = true;
                        this.rowingGeneralStatusEvent.sub(this, this.onPowerCurveRowingGeneralStatus);
                    }
                }
                else {
                    if (this._generalStatusEventAttachedByPowerCurve) {
                        this._generalStatusEventAttachedByPowerCurve = false;
                        this.rowingGeneralStatusEvent.unsub(this.onPowerCurveRowingGeneralStatus);
                    }
                }
                if (this.multiplex && enableMultiPlex) {
                    enableMultiPlex = true;
                    promises.push(this.enableMultiplexNotification());
                }
                else
                    promises.push(this.disableMultiPlexNotification());
            }
            //utils.promiseAllSync(promisses) or use a slower method
            return Promise.all(promises).then(() => {
                return Promise.resolve();
            });
        }
        onPowerCurveRowingGeneralStatus(data) {
            if (this.logLevel >= ergometer.LogLevel.trace)
                this.traceInfo('RowingGeneralStatus:' + JSON.stringify(data));
            //test to receive the power curve
            if (this.rowingGeneralStatus && this.rowingGeneralStatus.strokeState != data.strokeState) {
                if (data.strokeState == 4 /* StrokeState.recoveryState */) {
                    //send a power curve request
                    this.newCsafeBuffer()
                        .getPowerCurve({
                        onDataReceived: (curve) => {
                            this.powerCurveEvent.pub(curve);
                            this._powerCurve = curve;
                        }
                    })
                        .send();
                }
            }
        }
        currentDriverIsWebBlueTooth() {
            return this._driver instanceof ergometer.ble.DriverWebBlueTooth;
        }
        initDriver() {
            if (bleCentral.available())
                this._driver = new bleCentral.DriverBleCentral([ergometer.ble.PMDEVICE]);
            else if ((typeof bleat !== 'undefined') && bleat)
                this._driver = new ergometer.ble.DriverBleat();
            else if ((typeof simpleBLE !== 'undefined') && simpleBLE)
                this._driver = new ergometer.ble.DriverSimpleBLE();
            else if (ergometer.ble.hasWebBlueTooth())
                this._driver = new ergometer.ble.DriverWebBlueTooth(this, [ergometer.ble.PMDEVICE], [ergometer.ble.PMDEVICE_INFO_SERVICE, ergometer.ble.PMCONTROL_SERVICE, ergometer.ble.PMROWING_SERVICE]);
            else
                this.handleError("No suitable blue tooth driver found to connect to the ergometer. You need to load bleat on native platforms and a browser with web blue tooth capability.");
        }
        checkInitDriver() {
            if (!this._driver)
                this.initDriver();
            if (!this._driver)
                throw "No suitable blue tooth driver found to connect to the ergometer.";
        }
        /**
         *
         */
        initialize() {
            super.initialize();
            this._splitCommandsWhenToBigErrorMessage = true;
            this._receivePartialBuffers = true;
            /*document.addEventListener(
                'deviceready',
                 ()=> {
                     evothings.scriptsLoaded(()=>{
                         this.onDeviceReady();})},
                false);   */
            this.initDriver();
            var enableDisableFunc = () => { this.enableDisableNotification().catch(this.handleError); };
            this._rowingGeneralStatusEvent = new ergometer.pubSub.Event();
            this.rowingGeneralStatusEvent.registerChangedEvent(enableDisableFunc);
            this._rowingAdditionalStatus1Event = new ergometer.pubSub.Event();
            this.rowingAdditionalStatus1Event.registerChangedEvent(enableDisableFunc);
            this._rowingAdditionalStatus2Event = new ergometer.pubSub.Event();
            this.rowingAdditionalStatus2Event.registerChangedEvent(enableDisableFunc);
            this._rowingStrokeDataEvent = new ergometer.pubSub.Event();
            this.rowingStrokeDataEvent.registerChangedEvent(enableDisableFunc);
            this._rowingAdditionalStrokeDataEvent = new ergometer.pubSub.Event();
            this.rowingAdditionalStrokeDataEvent.registerChangedEvent(enableDisableFunc);
            this._rowingSplitIntervalDataEvent = new ergometer.pubSub.Event();
            this.rowingSplitIntervalDataEvent.registerChangedEvent(enableDisableFunc);
            this._rowingAdditionalSplitIntervalDataEvent = new ergometer.pubSub.Event();
            this.rowingAdditionalSplitIntervalDataEvent.registerChangedEvent(enableDisableFunc);
            this._workoutSummaryDataEvent = new ergometer.pubSub.Event();
            this.workoutSummaryDataEvent.registerChangedEvent(enableDisableFunc);
            this._additionalWorkoutSummaryDataEvent = new ergometer.pubSub.Event();
            this.additionalWorkoutSummaryDataEvent.registerChangedEvent(enableDisableFunc);
            this._additionalWorkoutSummaryData2Event = new ergometer.pubSub.Event();
            this.additionalWorkoutSummaryData2Event.registerChangedEvent(enableDisableFunc);
            this._heartRateBeltInformationEvent = new ergometer.pubSub.Event();
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
         *
         * @param device
         */
        removeDevice(device) {
            this._devices = this._devices.splice(this._devices.indexOf(device), 1);
        }
        /**
         *
         * @param device
         */
        addDevice(device) {
            var existing = this.findDevice(device.name);
            if (existing)
                this.removeDevice(existing);
            this._devices.push(device);
            //sort on hightest quality above
            this._devices.sort((device1, device2) => { return device2.quality - device1.quality; });
        }
        /**
         *
         * @param name
         * @returns {DeviceInfo}
         */
        findDevice(name) {
            var result = null;
            this._devices.forEach((device) => {
                if (device.name == name)
                    result = device;
            });
            return result;
        }
        /**
         *
         */
        stopScan() {
            if (this.connectionState == ergometer.MonitorConnectionState.scanning) {
                this.driver.stopScan();
            }
        }
        /**
         * Scan for device use the deviceFound to connect .
         * @param deviceFound
         */
        startScan(deviceFound, errorFn) {
            try {
                this.checkInitDriver();
                this._devices = [];
                // Save it for next time we use the this.
                //localStorage.setItem('deviceName', this._deviceName);
                // Call stop before you start, just in case something else is running.
                this.stopScan();
                this.changeConnectionState(ergometer.MonitorConnectionState.scanning);
                // Only report s once.
                //evothings.easyble.reportDeviceOnce(true);
                return this.driver.startScan((device) => {
                    // Do not show un-named devices.
                    /*var deviceName = device.advertisementData ?
                     device.advertisementData.kCBAdvDataLocalName : null;
                     */
                    if (!device.name) {
                        return;
                    }
                    // Print "name : mac address" for every device found.
                    this.debugInfo(device.name + ' : ' + device.address.toString().split(':').join(''));
                    // If my device is found connect to it.
                    //find any thing starting with PM and then a number a space and a serial number
                    if (device.name.match(/PM\d \d*/g)) {
                        this.showInfo('Status: DeviceInfo found: ' + device.name);
                        var deviceInfo = {
                            connected: false,
                            _internalDevice: device,
                            name: device.name,
                            address: device.address,
                            quality: 2 * (device.rssi + 100)
                        };
                        this.addDevice(deviceInfo);
                        if (deviceFound && deviceFound(deviceInfo)) {
                            this.connectToDevice(deviceInfo.name);
                        }
                    }
                }).then(() => {
                    this.showInfo('Status: Scanning...');
                }).catch(this.getErrorHandlerFunc("Scan error", (e) => {
                    if (errorFn)
                        errorFn(e);
                    if (this.connectionState < ergometer.MonitorConnectionState.connected)
                        this.changeConnectionState(ergometer.MonitorConnectionState.deviceReady);
                }));
            }
            catch (e) {
                if (this.connectionState < ergometer.MonitorConnectionState.connected)
                    this.changeConnectionState(ergometer.MonitorConnectionState.inactive);
                this.getErrorHandlerFunc("Scan error", errorFn)(e);
                return Promise.reject(e);
            }
        }
        /**
         * connect to a specific device. This should be a PM5 device which is found by the startScan. You can
         * only call this function after startScan is called. Connection to a device will stop the scan.
         * @param deviceName
         */
        connectToDevice(deviceName) {
            this.showInfo('Status: Connecting...');
            this.stopScan();
            this.changeConnectionState(ergometer.MonitorConnectionState.connecting);
            var deviceInfo = this.findDevice(deviceName);
            if (!deviceInfo)
                throw `Device ${deviceName} not found`;
            this._deviceInfo = deviceInfo;
            return this.driver.connect(deviceInfo._internalDevice, () => {
                this.changeConnectionState(ergometer.MonitorConnectionState.deviceReady);
                this.showInfo('Disconnected');
                if (this.autoReConnect && !this.currentDriverIsWebBlueTooth()) {
                    //do not auto connect too quick otherwise it will reconnect when
                    //the device has triggered a disconenct and it will end up half disconnected
                    setTimeout(() => {
                        this.startScan((device) => {
                            return device.name == deviceName;
                        });
                    }, 2000);
                }
            }).then(() => {
                this.changeConnectionState(ergometer.MonitorConnectionState.connected);
                this.showInfo('Status: Connected');
                return this.readPheripheralInfo();
            }).then(() => {
                // Debug logging of all services, characteristics and descriptors
                // reported by the BLE board.
                this.deviceConnected();
            }).catch((errorCode) => {
                this.changeConnectionState(ergometer.MonitorConnectionState.deviceReady);
                this.handleError(errorCode);
            });
        }
        /**
         * the promise is never fail
         * @param serviceUUID
         * @param UUID
         * @param readValue
         */
        readStringCharacteristic(serviceUUID, UUID) {
            return new Promise((resolve, reject) => {
                this.driver.readCharacteristic(serviceUUID, UUID).then((data) => {
                    resolve(ergometer.utils.bufferToString(data));
                }, reject);
            });
        }
        /**
         * the promise will never fail
         * @param done
         */
        readSampleRate() {
            return this.driver.readCharacteristic(ergometer.ble.PMROWING_SERVICE, ergometer.ble.ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC)
                .then((data) => {
                var view = new DataView(data);
                this._sampleRate = view.getUint8(0);
            });
        }
        /**
         *
         * @param done
         */
        readPheripheralInfo() {
            return new Promise((resolve, reject) => {
                Promise.all([
                    this.readStringCharacteristic(ergometer.ble.PMDEVICE_INFO_SERVICE, ergometer.ble.SERIALNUMBER_CHARACTERISTIC)
                        .then((value) => {
                        this._deviceInfo.serial = value;
                    }),
                    this.readStringCharacteristic(ergometer.ble.PMDEVICE_INFO_SERVICE, ergometer.ble.HWREVISION_CHARACTERISIC)
                        .then((value) => {
                        this._deviceInfo.hardwareRevision = value;
                    }),
                    this.readStringCharacteristic(ergometer.ble.PMDEVICE_INFO_SERVICE, ergometer.ble.FWREVISION_CHARACTERISIC)
                        .then((value) => {
                        this._deviceInfo.firmwareRevision = value;
                    }),
                    this.readStringCharacteristic(ergometer.ble.PMDEVICE_INFO_SERVICE, ergometer.ble.MANUFNAME_CHARACTERISIC)
                        .then((value) => {
                        this._deviceInfo.manufacturer = value;
                        this._deviceInfo.connected = true;
                    }),
                    this.readSampleRate()
                ]).then(() => { resolve(); }, (e) => { this.handleError(e); resolve(e); }); //log erro let not get this into the way of connecting
            });
        }
        /**
         *
         * @param data
         */
        handleRowingGeneralStatus(data) {
            var parsed = {
                elapsedTime: ergometer.utils.getUint24(data, 0 /* ble.PM_Rowing_Status_BLE_Payload.ELAPSED_TIME_LO */) * 10, //in mili seconds
                distance: ergometer.utils.getUint24(data, 3 /* ble.PM_Rowing_Status_BLE_Payload.DISTANCE_LO */) / 10,
                workoutType: data.getUint8(6 /* ble.PM_Rowing_Status_BLE_Payload.WORKOUT_TYPE */),
                intervalType: data.getUint8(7 /* ble.PM_Rowing_Status_BLE_Payload.INTERVAL_TYPE */),
                workoutState: data.getUint8(8 /* ble.PM_Rowing_Status_BLE_Payload.WORKOUT_STATE */),
                rowingState: data.getUint8(9 /* ble.PM_Rowing_Status_BLE_Payload.ROWING_STATE */),
                strokeState: data.getUint8(10 /* ble.PM_Rowing_Status_BLE_Payload.STROKE_STATE */),
                totalWorkDistance: ergometer.utils.getUint24(data, 11 /* ble.PM_Rowing_Status_BLE_Payload.TOTAL_WORK_DISTANCE_LO */),
                workoutDuration: ergometer.utils.getUint24(data, 14 /* ble.PM_Rowing_Status_BLE_Payload.WORKOUT_DURATION_LO */),
                workoutDurationType: data.getUint8(17 /* ble.PM_Rowing_Status_BLE_Payload.WORKOUT_DURATION_TYPE */),
                dragFactor: data.getUint8(18 /* ble.PM_Rowing_Status_BLE_Payload.DRAG_FACTOR */),
            };
            if (parsed.workoutDurationType == 0 /* WorkoutDurationType.time */)
                parsed.workoutDuration = parsed.workoutDuration * 10; //in mili seconds
            if (JSON.stringify(this.rowingGeneralStatus) !== JSON.stringify(parsed)) {
                this.rowingGeneralStatusEvent.pub(parsed);
                this._rowingGeneralStatus = parsed;
            }
        }
        calcPace(lowByte, highByte) {
            return (lowByte + highByte * 256) * 10;
        }
        /**
         *
         * @param data
         */
        handleRowingAdditionalStatus1(data) {
            var parsed = {
                elapsedTime: ergometer.utils.getUint24(data, 0 /* ble.PM_Extra_Status1_BLE_Payload.ELAPSED_TIME_LO */) * 10, //in mili seconds
                speed: data.getUint16(3 /* ble.PM_Extra_Status1_BLE_Payload.SPEED_LO */) / 1000, // m/s
                strokeRate: data.getUint8(5 /* ble.PM_Extra_Status1_BLE_Payload.STROKE_RATE */),
                heartRate: ergometer.utils.valueToNullValue(data.getUint8(6 /* ble.PM_Extra_Status1_BLE_Payload.HEARTRATE */), 255),
                currentPace: this.calcPace(data.getUint8(7 /* ble.PM_Extra_Status1_BLE_Payload.CURRENT_PACE_LO */), data.getUint8(8 /* ble.PM_Extra_Status1_BLE_Payload.CURRENT_PACE_HI */)),
                averagePace: this.calcPace(data.getUint8(9 /* ble.PM_Extra_Status1_BLE_Payload.AVG_PACE_LO */), data.getUint8(10 /* ble.PM_Extra_Status1_BLE_Payload.AVG_PACE_HI */)),
                restDistance: data.getUint16(11 /* ble.PM_Extra_Status1_BLE_Payload.REST_DISTANCE_LO */),
                restTime: ergometer.utils.getUint24(data, 13 /* ble.PM_Extra_Status1_BLE_Payload.REST_TIME_LO */) * 10, //mili seconds
                averagePower: null
            };
            if (data.byteLength == 18 /* ble.PM_Mux_Extra_Status1_BLE_Payload.BLE_PAYLOAD_SIZE */)
                parsed.averagePower = data.getUint16(16 /* ble.PM_Mux_Extra_Status1_BLE_Payload.AVG_POWER_LO */);
            if (JSON.stringify(this.rowingAdditionalStatus1) !== JSON.stringify(parsed)) {
                this.rowingAdditionalStatus1Event.pub(parsed);
                this._rowingAdditionalStatus1 = parsed;
            }
        }
        /**
         *
         * @param data
         */
        handleRowingAdditionalStatus2(data) {
            var parsed;
            if (data.byteLength == 20 /* ble.PM_Extra_Status2_BLE_Payload.BLE_PAYLOAD_SIZE */) {
                parsed = {
                    elapsedTime: ergometer.utils.getUint24(data, 0 /* ble.PM_Extra_Status2_BLE_Payload.ELAPSED_TIME_LO */) * 10, //in mili seconds
                    intervalCount: data.getUint8(3 /* ble.PM_Extra_Status2_BLE_Payload.INTERVAL_COUNT */),
                    averagePower: data.getUint16(4 /* ble.PM_Extra_Status2_BLE_Payload.AVG_POWER_LO */),
                    totalCalories: data.getUint16(6 /* ble.PM_Extra_Status2_BLE_Payload.TOTAL_CALORIES_LO */),
                    splitAveragePace: this.calcPace(data.getUint8(8 /* ble.PM_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_PACE_LO */), data.getUint8(9 /* ble.PM_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_PACE_HI */)), // ms,
                    splitAveragePower: data.getUint16(10 /* ble.PM_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_POWER_LO */), //watt
                    splitAverageCalories: data.getUint16(12 /* ble.PM_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_CALORIES_LO */), // cal/hour
                    lastSplitTime: data.getUint16(14 /* ble.PM_Extra_Status2_BLE_Payload.LAST_SPLIT_TIME_LO */) * 100, //the doc 0.1 factor is this right?
                    lastSplitDistance: ergometer.utils.getUint24(data, 17 /* ble.PM_Extra_Status2_BLE_Payload.LAST_SPLIT_DISTANCE_LO */)
                };
            }
            else {
                parsed = {
                    elapsedTime: ergometer.utils.getUint24(data, 0 /* ble.PM_Mux_Extra_Status2_BLE_Payload.ELAPSED_TIME_LO */) * 10, //in mili seconds
                    intervalCount: data.getUint8(3 /* ble.PM_Mux_Extra_Status2_BLE_Payload.INTERVAL_COUNT */),
                    averagePower: null,
                    totalCalories: data.getUint16(4 /* ble.PM_Mux_Extra_Status2_BLE_Payload.TOTAL_CALORIES_LO */),
                    splitAveragePace: this.calcPace(data.getUint8(6 /* ble.PM_Mux_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_PACE_LO */), data.getUint8(7 /* ble.PM_Mux_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_PACE_HI */)), //ms,
                    splitAveragePower: data.getUint16(8 /* ble.PM_Mux_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_POWER_LO */), //watt
                    splitAverageCalories: data.getUint16(10 /* ble.PM_Mux_Extra_Status2_BLE_Payload.SPLIT_INTERVAL_AVG_CALORIES_LO */), // cal/hour
                    lastSplitTime: data.getUint16(12 /* ble.PM_Mux_Extra_Status2_BLE_Payload.LAST_SPLIT_TIME_LO */) * 100, //the doc 0.1 factor is this right?
                    lastSplitDistance: ergometer.utils.getUint24(data, 15 /* ble.PM_Mux_Extra_Status2_BLE_Payload.LAST_SPLIT_DISTANCE_LO */)
                };
            }
            if (JSON.stringify(this.rowingAdditionalStatus2) !== JSON.stringify(parsed)) {
                this.rowingAdditionalStatus2Event.pub(parsed);
                this._rowingAdditionalStatus2 = parsed;
            }
        }
        /**
         *
         * @param data
         */
        handleRowingStrokeData(data) {
            var parsed;
            if (data.byteLength == 20 /* ble.PM_Stroke_Data_BLE_Payload.BLE_PAYLOAD_SIZE */) {
                parsed = {
                    elapsedTime: ergometer.utils.getUint24(data, 0 /* ble.PM_Stroke_Data_BLE_Payload.ELAPSED_TIME_LO */) * 10, //in mili seconds
                    distance: ergometer.utils.getUint24(data, 3 /* ble.PM_Stroke_Data_BLE_Payload.DISTANCE_LO */) / 10, //meter
                    driveLength: data.getUint8(6 /* ble.PM_Stroke_Data_BLE_Payload.DRIVE_LENGTH */) / 100, //meters
                    driveTime: data.getUint8(7 /* ble.PM_Stroke_Data_BLE_Payload.DRIVE_TIME */) * 10, //ms
                    strokeRecoveryTime: (data.getUint8(8 /* ble.PM_Stroke_Data_BLE_Payload.STROKE_RECOVERY_TIME_LO */) + data.getUint8(9 /* ble.PM_Stroke_Data_BLE_Payload.STROKE_RECOVERY_TIME_HI */) * 256) * 10, //ms
                    strokeDistance: (data.getUint8(10 /* ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_DISTANCE_LO */) + data.getUint8(11 /* ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_DISTANCE_HI */) * 256) / 100, //meter
                    peakDriveForce: data.getUint16(12 /* ble.PM_Stroke_Data_BLE_Payload.PEAK_DRIVE_FORCE_LO */) / 10, //lbs
                    averageDriveForce: data.getUint16(14 /* ble.PM_Stroke_Data_BLE_Payload.AVG_DRIVE_FORCE_LO */) / 10, //lbs
                    workPerStroke: data.getUint16(16 /* ble.PM_Stroke_Data_BLE_Payload.WORK_PER_STROKE_LO */) / 10, //jouls
                    strokeCount: data.getUint8(18 /* ble.PM_Stroke_Data_BLE_Payload.STROKE_COUNT_LO */) + data.getUint8(19 /* ble.PM_Stroke_Data_BLE_Payload.STROKE_COUNT_HI */) * 256 //PM bug: LSB and MSB are swapped
                };
            }
            else {
                parsed = {
                    elapsedTime: ergometer.utils.getUint24(data, 0 /* ble.PM_Mux_Stroke_Data_BLE_Payload.ELAPSED_TIME_LO */) * 10, //in mili seconds
                    distance: ergometer.utils.getUint24(data, 3 /* ble.PM_Mux_Stroke_Data_BLE_Payload.DISTANCE_LO */) / 10, //meter
                    driveLength: data.getUint8(6 /* ble.PM_Mux_Stroke_Data_BLE_Payload.DRIVE_LENGTH */) / 100, //meters
                    driveTime: data.getUint8(7 /* ble.PM_Mux_Stroke_Data_BLE_Payload.DRIVE_TIME */) * 10, //ms
                    strokeRecoveryTime: data.getUint16(8 /* ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_RECOVERY_TIME_LO */) * 10, //ms
                    strokeDistance: (data.getUint8(10 /* ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_DISTANCE_LO */) + data.getUint8(11 /* ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_DISTANCE_HI */) * 256) / 100, //meter
                    peakDriveForce: data.getUint16(12 /* ble.PM_Mux_Stroke_Data_BLE_Payload.PEAK_DRIVE_FORCE_LO */) / 10, //lbs
                    averageDriveForce: data.getUint16(14 /* ble.PM_Mux_Stroke_Data_BLE_Payload.AVG_DRIVE_FORCE_LO */) / 10, //lbs
                    workPerStroke: null,
                    strokeCount: data.getUint8(16 /* ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_COUNT_LO */) + data.getUint8(17 /* ble.PM_Mux_Stroke_Data_BLE_Payload.STROKE_COUNT_HI */) * 256 //PM bug: LSB and MSB are swapped
                };
            }
            if (JSON.stringify(this.rowingStrokeData) !== JSON.stringify(parsed)) {
                this.rowingStrokeDataEvent.pub(parsed);
                this._rowingStrokeData = parsed;
            }
        }
        /**
         *
         * @param data
         */
        handleRowingAdditionalStrokeData(data) {
            var parsed = {
                elapsedTime: ergometer.utils.getUint24(data, 0 /* ble.PM_Extra_Stroke_Data_BLE_Payload.ELAPSED_TIME_LO */) * 10, //in mili seconds
                strokePower: data.getUint8(3 /* ble.PM_Extra_Stroke_Data_BLE_Payload.STROKE_POWER_LO */) + data.getUint8(4 /* ble.PM_Extra_Stroke_Data_BLE_Payload.STROKE_POWER_HI */) * 256, //watts
                strokeCalories: data.getUint16(5 /* ble.PM_Extra_Stroke_Data_BLE_Payload.STROKE_CALORIES_LO */), //cal/hr
                strokeCount: data.getUint8(7 /* ble.PM_Extra_Stroke_Data_BLE_Payload.STROKE_COUNT_LO */) + data.getUint8(8 /* ble.PM_Extra_Stroke_Data_BLE_Payload.STROKE_COUNT_HI */) * 256, //PM bug: LSB and MSB are swapped
                projectedWorkTime: ergometer.utils.getUint24(data, 9 /* ble.PM_Extra_Stroke_Data_BLE_Payload.PROJ_WORK_TIME_LO */) * 1000, //ms
                projectedWorkDistance: ergometer.utils.getUint24(data, 12 /* ble.PM_Extra_Stroke_Data_BLE_Payload.PROJ_WORK_DIST_LO */), //meter
                workPerStroke: null //filled when multiplexed is true
            };
            if (data.byteLength == 17 /* ble.PM_Mux_Extra_Stroke_Data_BLE_Payload.BLE_PAYLOAD_SIZE */)
                parsed.workPerStroke = data.getUint16(15 /* ble.PM_Mux_Extra_Stroke_Data_BLE_Payload.WORK_PER_STROKE_LO */);
            if (JSON.stringify(this.rowingAdditionalStrokeData) !== JSON.stringify(parsed)) {
                this.rowingAdditionalStrokeDataEvent.pub(parsed);
                this._rowingAdditionalStrokeData = parsed;
            }
        }
        /**
         *
         * @param data
         */
        handleRowingSplitIntervalData(data) {
            var parsed = {
                elapsedTime: ergometer.utils.getUint24(data, 0 /* ble.PM_Split_Interval_Data_BLE_Payload.ELAPSED_TIME_LO */) * 10, //in mili seconds
                distance: ergometer.utils.getUint24(data, 3 /* ble.PM_Split_Interval_Data_BLE_Payload.DISTANCE_LO */) / 10, //meters
                intervalTime: ergometer.utils.getUint24(data, 6 /* ble.PM_Split_Interval_Data_BLE_Payload.SPLIT_TIME_LO */) * 100,
                intervalDistance: ergometer.utils.getUint24(data, 9 /* ble.PM_Split_Interval_Data_BLE_Payload.SPLIT_DISTANCE_LO */),
                intervalRestTime: data.getUint16(12 /* ble.PM_Split_Interval_Data_BLE_Payload.REST_TIME_LO */) * 1000,
                intervalRestDistance: data.getUint16(14 /* ble.PM_Split_Interval_Data_BLE_Payload.REST_DISTANCE_LO */), //meter
                intervalType: data.getUint8(16 /* ble.PM_Split_Interval_Data_BLE_Payload.TYPE */),
                intervalNumber: data.getUint8(17 /* ble.PM_Split_Interval_Data_BLE_Payload.INT_NUMBER */),
            };
            if (JSON.stringify(this.rowingSplitIntervalData) !== JSON.stringify(parsed)) {
                this.rowingSplitIntervalDataEvent.pub(parsed);
                this._rowingSplitIntervalData = parsed;
            }
        }
        /**
         *
         * @param data
         */
        handleRowingAdditionalSplitIntervalData(data) {
            var parsed = {
                elapsedTime: ergometer.utils.getUint24(data, 0 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.ELAPSED_TIME_LO */) * 10, //in mili seconds
                intervalAverageStrokeRate: data.getUint8(3 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.STROKE_RATE */),
                intervalWorkHeartrate: data.getUint8(4 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.WORK_HR */),
                intervalRestHeartrate: data.getUint8(5 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.REST_HR */),
                intervalAveragePace: data.getUint16(6 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.AVG_PACE_LO */) * 10, //ms lbs
                intervalTotalCalories: data.getUint16(8 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.CALORIES_LO */),
                intervalAverageCalories: data.getUint16(10 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.AVG_CALORIES_LO */),
                intervalSpeed: data.getUint16(12 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.SPEED_LO */) / 1000, //m/s
                intervalPower: data.getUint16(14 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.POWER_LO */),
                splitAverageDragFactor: data.getUint8(16 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.AVG_DRAG_FACTOR */),
                intervalNumber: data.getUint8(17 /* ble.PM_Extra_Split_Interval_Data_BLE_Payload.INT_NUMBER */)
            };
            if (JSON.stringify(this.rowingAdditionalSplitIntervalData) !== JSON.stringify(parsed)) {
                this.rowingAdditionalSplitIntervalDataEvent.pub(parsed);
                this._rowingAdditionalSplitIntervalData = parsed;
            }
        }
        /**
         *
         * @param data
         */
        handleWorkoutSummaryData(data) {
            var parsed = {
                logEntryDate: data.getUint16(0 /* ble.PM_Workout_Summary_Data_BLE_Payload.LOG_DATE_LO */),
                logEntryTime: data.getUint16(2 /* ble.PM_Workout_Summary_Data_BLE_Payload.LOG_TIME_LO */),
                elapsedTime: ergometer.utils.getUint24(data, 4 /* ble.PM_Workout_Summary_Data_BLE_Payload.ELAPSED_TIME_LO */) * 10,
                distance: ergometer.utils.getUint24(data, 7 /* ble.PM_Workout_Summary_Data_BLE_Payload.DISTANCE_LO */) / 10,
                averageStrokeRate: data.getUint8(10 /* ble.PM_Workout_Summary_Data_BLE_Payload.AVG_SPM */),
                endingHeartrate: data.getUint8(11 /* ble.PM_Workout_Summary_Data_BLE_Payload.END_HR */),
                averageHeartrate: data.getUint8(12 /* ble.PM_Workout_Summary_Data_BLE_Payload.AVG_HR */),
                minHeartrate: data.getUint8(13 /* ble.PM_Workout_Summary_Data_BLE_Payload.MIN_HR */),
                maxHeartrate: data.getUint8(14 /* ble.PM_Workout_Summary_Data_BLE_Payload.MAX_HR */),
                dragFactorAverage: data.getUint8(15 /* ble.PM_Workout_Summary_Data_BLE_Payload.AVG_DRAG_FACTOR */),
                recoveryHeartRate: data.getUint8(16 /* ble.PM_Workout_Summary_Data_BLE_Payload.RECOVERY_HR */),
                workoutType: data.getUint8(17 /* ble.PM_Workout_Summary_Data_BLE_Payload.WORKOUT_TYPE */),
                averagePace: null
            };
            if (data.byteLength == 20 /* ble.PM_Workout_Summary_Data_BLE_Payload.BLE_PAYLOAD_SIZE */) {
                parsed.averagePace = data.getUint16(18 /* ble.PM_Workout_Summary_Data_BLE_Payload.AVG_PACE_LO */);
            }
            if (JSON.stringify(this.workoutSummaryData) !== JSON.stringify(parsed)) {
                this.workoutSummaryDataEvent.pub(parsed);
                this._workoutSummaryData = parsed;
            }
        }
        /**
         *
         * @param data
         */
        handleAdditionalWorkoutSummaryData(data) {
            var parsed;
            if (data.byteLength == 19 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.DATA_BLE_PAYLOAD_SIZE */) {
                parsed = {
                    logEntryDate: data.getUint16(0 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.LOG_DATE_LO */),
                    logEntryTime: data.getUint16(1 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.LOG_DATE_HI */),
                    intervalType: data.getUint8(4 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_TYPE */),
                    intervalSize: data.getUint16(5 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_SIZE_LO */), //meters or seconds
                    intervalCount: data.getUint8(7 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_COUNT */),
                    totalCalories: data.getUint16(8 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.WORK_CALORIES_LO */),
                    watts: data.getUint16(10 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.WATTS_LO */),
                    totalRestDistance: ergometer.utils.getUint24(data, 12 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.TOTAL_REST_DISTANCE_LO */),
                    intervalRestTime: data.getUint16(15 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.INTERVAL_REST_TIME_LO */),
                    averageCalories: data.getUint16(17 /* ble.PM_Extra_Workout_Summary_Data_BLE_Payload.AVG_CALORIES_LO */)
                };
            }
            else {
                parsed = {
                    logEntryDate: data.getUint16(0 /* ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.LOG_DATE_LO */),
                    logEntryTime: data.getUint16(2 /* ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.LOG_TIME_LO */),
                    intervalType: null,
                    intervalSize: data.getUint16(4 /* ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_SIZE_LO */), //meters or seconds
                    intervalCount: data.getUint8(6 /* ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.SPLIT_INT_COUNT */),
                    totalCalories: data.getUint16(7 /* ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.WORK_CALORIES_LO */),
                    watts: data.getUint16(9 /* ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.WATTS_LO */),
                    totalRestDistance: ergometer.utils.getUint24(data, 11 /* ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.TOTAL_REST_DISTANCE_LO */),
                    intervalRestTime: data.getUint16(14 /* ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.INTERVAL_REST_TIME_LO */),
                    averageCalories: data.getUint16(16 /* ble.PM_Mux_Extra_Workout_Summary_Data_BLE_Payload.AVG_CALORIES_LO */)
                };
            }
            if (JSON.stringify(this.additionalWorkoutSummaryData) !== JSON.stringify(parsed)) {
                this.additionalWorkoutSummaryDataEvent.pub(parsed);
                this._additionalWorkoutSummaryData = parsed;
            }
        }
        /**
         *
         * @param data
         */
        handleAdditionalWorkoutSummaryData2(data) {
            var parsed = {
                logEntryDate: data.getUint16(0 /* ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.LOG_DATE_LO */),
                logEntryTime: data.getUint16(1 /* ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.LOG_DATE_HI */),
                averagePace: data.getUint16(4 /* ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.AVG_PACE_LO */),
                gameIdentifier: data.getUint8(6 /* ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.GAME_ID */),
                gameScore: data.getUint16(7 /* ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.GAME_SCORE_LO */),
                ergMachineType: data.getUint8(9 /* ble.PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload.MACHINE_TYPE */),
            };
            if (JSON.stringify(this.additionalWorkoutSummaryData2) !== JSON.stringify(parsed)) {
                this.additionalWorkoutSummaryData2Event.pub(parsed);
                this._additionalWorkoutSummaryData2 = parsed;
            }
        }
        /**
         *
         * @param data
         */
        handleHeartRateBeltInformation(data) {
            var parsed = {
                manufacturerId: data.getUint8(0 /* ble.PM_Heart_Rate_Belt_Info_BLE_Payload.MANUFACTURER_ID */),
                deviceType: data.getUint8(1 /* ble.PM_Heart_Rate_Belt_Info_BLE_Payload.DEVICE_TYPE */),
                beltId: data.getUint32(2 /* ble.PM_Heart_Rate_Belt_Info_BLE_Payload.BELT_ID_LO */),
            };
            if (JSON.stringify(this.heartRateBeltInformation) !== JSON.stringify(parsed)) {
                this.heartRateBeltInformationEvent.pub(parsed);
                this._heartRateBeltInformation = parsed;
            }
        }
        /**
         *
         * @internal
         */
        deviceConnected() {
            this.debugInfo("readServices success");
            this.debugInfo('Status: notifications are activated');
            //handle to the notification
            this.changeConnectionState(ergometer.MonitorConnectionState.servicesFound);
            //first enable all notifications and wait till they are active
            //and then set the connection state to ready           
            this.handleCSafeNotifications().then(() => {
                return this.enableDisableNotification();
            }).then(() => {
                //fix problem of notifications not completaly ready yet
                this.changeConnectionState(ergometer.MonitorConnectionState.readyForCommunication);
            }).catch(this.handleError);
            //allways connect to csafe
        }
        handleCSafeNotifications() {
            this.traceInfo("enable notifications csafe");
            return this.enableNotification(ergometer.ble.PMCONTROL_SERVICE, ergometer.ble.RECEIVE_FROM_PM_CHARACTERISIC, (data) => {
                var dataView = new DataView(data);
                this.handeReceivedDriverData(dataView);
            }).catch(this.getErrorHandlerFunc(""));
        }
        /**
         *
         * @param data
         */
        handleDataCallbackMulti(data) {
            //this.debugInfo("multi data received: " + evothings.util.typedArrayToHexString(data));
            var ar = new DataView(data);
            var dataType = ar.getUint8(0);
            ar = new DataView(data, 1);
            switch (dataType) {
                case 49 /* ble.PM_Multiplexed_Info_Type_ID.ROWING_GENERAL_STATUS */: {
                    if (this.rowingGeneralStatusEvent.count > 0)
                        this.handleRowingGeneralStatus(ar);
                    break;
                }
                case 50 /* ble.PM_Multiplexed_Info_Type_ID.ROWING_ADDITIONAL_STATUS1 */: {
                    if (this.rowingAdditionalStatus1Event.count > 0)
                        this.handleRowingAdditionalStatus1(ar);
                    break;
                }
                case 51 /* ble.PM_Multiplexed_Info_Type_ID.ROWING_ADDITIONAL_STATUS2 */: {
                    if (this.rowingAdditionalStatus2Event.count > 0)
                        this.handleRowingAdditionalStatus2(ar);
                    break;
                }
                case 53 /* ble.PM_Multiplexed_Info_Type_ID.STROKE_DATA_STATUS */: {
                    if (this.rowingStrokeDataEvent.count > 0)
                        this.handleRowingStrokeData(ar);
                    break;
                }
                case 54 /* ble.PM_Multiplexed_Info_Type_ID.EXTRA_STROKE_DATA_STATUS */: {
                    if (this.rowingAdditionalStrokeDataEvent.count > 0)
                        this.handleRowingAdditionalStrokeData(ar);
                    break;
                }
                case 55 /* ble.PM_Multiplexed_Info_Type_ID.SPLIT_INTERVAL_STATUS */: {
                    if (this.rowingSplitIntervalDataEvent.count > 0)
                        this.handleRowingSplitIntervalData(ar);
                    break;
                }
                case 56 /* ble.PM_Multiplexed_Info_Type_ID.EXTRA_SPLIT_INTERVAL_STATUS */: {
                    if (this.rowingAdditionalSplitIntervalDataEvent.count > 0)
                        this.handleRowingAdditionalSplitIntervalData(ar);
                    break;
                }
                case 57 /* ble.PM_Multiplexed_Info_Type_ID.WORKOUT_SUMMARY_STATUS */: {
                    if (this.workoutSummaryDataEvent.count > 0)
                        this.handleWorkoutSummaryData(ar);
                    break;
                }
                case 58 /* ble.PM_Multiplexed_Info_Type_ID.EXTRA_WORKOUT_SUMMARY_STATUS1 */: {
                    if (this.additionalWorkoutSummaryDataEvent.count > 0)
                        this.handleAdditionalWorkoutSummaryData(ar);
                    break;
                }
                case 59 /* ble.PM_Multiplexed_Info_Type_ID.HEART_RATE_BELT_INFO_STATUS */: {
                    if (this.heartRateBeltInformationEvent.count > 0)
                        this.handleHeartRateBeltInformation(ar);
                    break;
                }
                case 60 /* ble.PM_Multiplexed_Info_Type_ID.EXTRA_WORKOUT_SUMMARY_STATUS2 */: {
                    if (this.additionalWorkoutSummaryData2Event.count > 0)
                        this.handleAdditionalWorkoutSummaryData2(ar);
                    break;
                }
            }
        }
        ;
        /**
         *
         * @param data
         * @param func
         */
        handleDataCallback(data, func) {
            //this.debugInfo("data received: " + evothings.util.typedArrayToHexString(data));
            var ar = new DataView(data);
            //call the function within the scope of the object
            func.apply(this, [ar]);
        }
        driver_write(data) {
            return this.driver.writeCharacteristic(ergometer.ble.PMCONTROL_SERVICE, ergometer.ble.TRANSMIT_TO_PM_CHARACTERISIC, data);
        }
        getPacketSize() {
            return ergometer.ble.PACKET_SIZE;
        }
    }
    ergometer.PerformanceMonitorBle = PerformanceMonitorBle;
})(ergometer || (ergometer = {}));
var ergometer;
(function (ergometer) {
    class HeartRateMonitorBle extends ergometer.MonitorBase {
        constructor() {
            super(...arguments);
            this._devices = [];
            this._heartRateDataEvent = new ergometer.pubSub.Event();
            this._registeredGuids = {};
        }
        get driver() {
            return this._driver;
        }
        get heartRateDataEvent() {
            return this._heartRateDataEvent;
        }
        initialize() {
            super.initialize();
            this.initDriver();
        }
        checkInitDriver() {
            if (!this._driver)
                this.initDriver();
            if (!this._driver)
                throw "No suitable driver found";
        }
        initDriver() {
            if (bleCentral.available())
                this._driver = new bleCentral.DriverBleCentral([ergometer.ble.HEART_RATE_DEVICE_SERVICE]);
            else if ((typeof bleat !== 'undefined') && bleat)
                this._driver = new ergometer.ble.DriverBleat();
            else if ((typeof simpleBLE !== 'undefined') && simpleBLE)
                this._driver = new ergometer.ble.DriverSimpleBLE();
            else if (ergometer.ble.hasWebBlueTooth())
                this._driver = new ergometer.ble.DriverWebBlueTooth(this, [ergometer.ble.HEART_RATE_DEVICE_SERVICE], []);
            else
                this.handleError("No suitable blue tooth driver found to connect to the ergometer. You need to load bleat on native platforms and a browser with web blue tooth capability.");
        }
        disconnect() {
            if (this.connectionState >= ergometer.MonitorConnectionState.deviceReady) {
                this.driver.disconnect();
                this.changeConnectionState(ergometer.MonitorConnectionState.deviceReady);
            }
        }
        get deviceInfo() {
            return this._deviceInfo;
        }
        currentDriverIsWebBlueTooth() {
            return this._driver instanceof ergometer.ble.DriverWebBlueTooth;
        }
        /**
                *
                * @param device
                */
        removeDevice(device) {
            this._devices = this._devices.splice(this._devices.indexOf(device), 1);
        }
        /**
         *
         * @param device
         */
        addDevice(device) {
            var existing = this.findDevice(device.name);
            if (existing)
                this.removeDevice(existing);
            this._devices.push(device);
            //sort on hightest quality above
            this._devices.sort((device1, device2) => { return device2.quality - device1.quality; });
        }
        /**
         *
         * @param name
         * @returns {DeviceInfo}
         */
        findDevice(name) {
            var result = null;
            this._devices.forEach((device) => {
                if (device.name == name)
                    result = device;
            });
            return result;
        }
        /**
         *
         */
        stopScan() {
            if (this.connectionState == ergometer.MonitorConnectionState.scanning) {
                this.driver.stopScan();
            }
        }
        /**
         * Scan for device use the deviceFound to connect .
         * @param deviceFound
         */
        startScan(deviceFound, errorFn) {
            try {
                this.checkInitDriver();
                this._devices = [];
                // Save it for next time we use the this.
                //localStorage.setItem('deviceName', this._deviceName);
                // Call stop before you start, just in case something else is running.
                this.stopScan();
                this.changeConnectionState(ergometer.MonitorConnectionState.scanning);
                // Only report s once.
                //evothings.easyble.reportDeviceOnce(true);
                return this.driver.startScan((device) => {
                    // Do not show un-named devices.
                    /*var deviceName = device.advertisementData ?
                    device.advertisementData.kCBAdvDataLocalName : null;
                    */
                    if (!device.name) {
                        return;
                    }
                    // Print "name : mac address" for every device found.
                    this.debugInfo(device.name + ' : ' + device.address.toString().split(':').join(''));
                    // If my device is found connect to it.
                    //find any thing starting with PM and then a number a space and a serial number
                    this.showInfo('Status: DeviceInfo found: ' + device.name);
                    var deviceInfo = {
                        connected: false,
                        _internalDevice: device,
                        name: device.name,
                        address: device.address,
                        quality: 2 * (device.rssi + 100)
                    };
                    this.addDevice(deviceInfo);
                    if (deviceFound && deviceFound(deviceInfo)) {
                        this.connectToDevice(deviceInfo.name);
                    }
                }).then(() => {
                    this.showInfo('Status: Scanning...');
                }).catch(this.getErrorHandlerFunc("Scan error", errorFn));
            }
            catch (e) {
                this.changeConnectionState(ergometer.MonitorConnectionState.inactive);
                this.getErrorHandlerFunc("Scan error", errorFn)(e);
                return Promise.reject(e);
            }
        }
        /**
         * connect to a specific device. This should be a PM5 device which is found by the startScan. You can
         * only call this function after startScan is called. Connection to a device will stop the scan.
         * @param deviceName
         */
        connectToDevice(deviceName) {
            this.showInfo('Status: Connecting...');
            this.stopScan();
            this.changeConnectionState(ergometer.MonitorConnectionState.connecting);
            var deviceInfo = this.findDevice(deviceName);
            if (!deviceInfo)
                throw `Device ${deviceName} not found`;
            this._deviceInfo = deviceInfo;
            return this.driver.connect(deviceInfo._internalDevice, () => {
                this.changeConnectionState(ergometer.MonitorConnectionState.deviceReady);
                this.showInfo('Disconnected');
            }).then(() => {
                this.changeConnectionState(ergometer.MonitorConnectionState.connected);
                this.showInfo('Status: Connected');
            }).then(() => {
                // Debug logging of all services, characteristics and descriptors
                // reported by the BLE board.
                this.deviceConnected();
            }).catch((errorCode) => {
                this.changeConnectionState(ergometer.MonitorConnectionState.deviceReady);
                this.handleError(errorCode);
            });
        }
        deviceConnected() {
            this.debugInfo("readServices success");
            this.debugInfo('Status: notifications are activated');
            //handle to the notification
            this.changeConnectionState(ergometer.MonitorConnectionState.servicesFound);
            //first enable all notifications and wait till they are active
            //and then set the connection state to ready           
            this.driver.enableNotification(ergometer.ble.HEART_RATE_DEVICE_SERVICE, ergometer.ble.HEART_RATE_MEASUREMENT, this.handleDataHeartRate.bind(this)).then(() => {
                //fix problem of notifications not completaly ready yet
                this.changeConnectionState(ergometer.MonitorConnectionState.readyForCommunication);
            }).catch(this.handleError);
        }
        handleDataHeartRate(data) {
            var value = new DataView(data);
            let flags = value.getUint8(0);
            let rate16Bits = flags & 0x1;
            let result = {};
            let index = 1;
            if (rate16Bits) {
                result.heartRate = value.getUint16(index, /*littleEndian=*/ true);
                index += 2;
            }
            else {
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
                result.energyExpended = value.getUint16(index, /*littleEndian=*/ true);
                index += 2;
            }
            let rrIntervalPresent = flags & 0x10;
            if (rrIntervalPresent) {
                let rrIntervals = [];
                for (; index + 1 < value.byteLength; index += 2) {
                    rrIntervals.push(value.getUint16(index, /*littleEndian=*/ true));
                }
                result.rrIntervals = rrIntervals;
            }
            this.heartRateDataEvent.pub(result);
        }
    }
    ergometer.HeartRateMonitorBle = HeartRateMonitorBle;
})(ergometer || (ergometer = {}));
//# sourceMappingURL=ergometer.js.map