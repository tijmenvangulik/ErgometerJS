/**
 * Created by tijmen on 25-12-15.
 */
/** @internal */
var utils;
(function (utils) {
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
})(utils || (utils = {}));
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
var pubSub;
(function (pubSub) {
    var PubSub = (function () {
        function PubSub() {
            this.registry = {};
        }
        PubSub.prototype.pub = function (name) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!this.registry[name])
                return;
            this.registry[name].forEach(function (x) {
                try {
                    x.func.apply(x.object, args);
                }
                catch (e) {
                    console.log(e);
                }
            });
        };
        PubSub.prototype.pubASync = function (name) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!this.registry[name])
                return;
            this.registry[name].forEach(function (x) {
                setTimeout(function () { x.func.apply(x.object, args); }, 0);
            });
        };
        PubSub.prototype.sub = function (applyObject, name, fn) {
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
        };
        PubSub.prototype.unsub = function (name, fn) {
            var evnt = this.registry[name];
            if (evnt) {
                //remove the function
                for (var i = evnt.length - 1; i >= 0; i--) {
                    if (evnt[i].func == fn)
                        evnt.splice(i, 1);
                }
            }
            this.pub("unsubscribed", name, this.subscribeCount(name));
        };
        PubSub.prototype.subscribeCount = function (name) {
            var evnt = this.registry[name];
            if (evnt)
                return evnt.length;
            else
                return 0;
        };
        return PubSub;
    })();
    pubSub.PubSub = PubSub;
    //new style event using generics
    var Event = (function () {
        function Event() {
            this._subscribed = [];
        }
        Event.prototype.doChangedEvent = function () {
            if (this._subScriptionChangedEvent) {
                this._subScriptionChangedEvent(this, this.count);
            }
        };
        Event.prototype.findSubscription = function (event) {
            this._subscribed.forEach(function (item) {
                if (item.func == event)
                    return item;
            });
            return null;
        };
        Event.prototype.sub = function (applyObject, event) {
            var newItem = this.findSubscription(event);
            if (!newItem) {
                newItem = { object: applyObject, func: event };
                this._subscribed.push(newItem);
                this.doChangedEvent();
            }
        };
        Event.prototype.unsub = function (event) {
            for (var i = this._subscribed.length - 1; i >= 0; i--) {
                if (this._subscribed[i].func == event)
                    this._subscribed.splice(i, 1);
            }
            this.doChangedEvent();
        };
        Event.prototype.doPub = function (args) {
            this._subscribed.forEach(function (item) {
                item.func.apply(item.object, args);
            });
        };
        Object.defineProperty(Event.prototype, "pub", {
            get: function () {
                var pubsub = this;
                var func = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    pubsub.doPub(args);
                };
                return func;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "pubAsync", {
            get: function () {
                var pubsub = this;
                var func = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    setTimeout(function () {
                        pubsub.doPub(args);
                    });
                };
                return func;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Event.prototype, "count", {
            get: function () {
                return this._subscribed.length;
            },
            enumerable: true,
            configurable: true
        });
        Event.prototype.registerChangedEvent = function (func) {
            this._subScriptionChangedEvent = func;
        };
        return Event;
    })();
    pubSub.Event = Event;
})(pubSub || (pubSub = {}));
/** @internal */
var ergometer;
(function (ergometer) {
    var ble;
    (function (ble) {
        /** @internal */
        ble.PMDEVICE = "CE060000-43E5-11E4-916C-0800200C9A66";
        // Service UUIDs
        ble.PMDEVICE_INFOS_ERVICE = "CE060010-43E5-11E4-916C-0800200C9A66";
        ble.PMCONTROL_SERVICE = "CE060020-43E5-11E4-916C-0800200C9A66";
        ble.PMROWIN_GSERVICE = "CE060030-43E5-11E4-916C-0800200C9A66";
        // Characteristic UUIDs for PM device info service
        ble.MODELNUMBER_CHARACTERISIC = "CE060011-43E5-11E4-916C-0800200C9A66";
        ble.SERIALNUMBER_CHARACTERISTIC = "CE060012-43E5-11E4-916C-0800200C9A66";
        ble.HWREVISION_CHARACTERISIC = "CE060013-43E5-11E4-916C-0800200C9A66";
        ble.FWREVISION_CHARACTERISIC = "CE060014-43E5-11E4-916C-0800200C9A66";
        ble.MANUFNAME_CHARACTERISIC = "CE060015-43E5-11E4-916C-0800200C9A66";
        ble.MACHINETYPE_CHARACTERISIC = "CE060016-43E5-11E4-916C-0800200C9A66";
        // Characteristic UUIDs for PM control service
        ble.TRANSMIT_TO_PM_CHARACTERISIC = "CE060021-43E5-11E4-916C-0800200C9A66";
        ble.RECEIVE_FROM_PM_CHARACTERISIC = "CE060022-43E5-11E4-916C-0800200C9A66";
        // Characteristic UUIDs for rowing service
        ble.ROWING_STATUS_CHARACTERISIC = "CE060031-43E5-11E4-916C-0800200C9A66";
        ble.EXTRA_STATUS1_CHARACTERISIC = "CE060032-43E5-11E4-916C-0800200C9A66";
        ble.EXTRA_STATUS2_CHARACTERISIC = "CE060033-43E5-11E4-916C-0800200C9A66";
        ble.ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC = "CE060034-43E5-11E4-916C-0800200C9A66";
        ble.STROKE_DATA_CHARACTERISIC = "CE060035-43E5-11E4-916C-0800200C9A66";
        ble.EXTRA_STROKE_DATA_CHARACTERISIC = "CE060036-43E5-11E4-916C-0800200C9A66";
        ble.SPLIT_INTERVAL_DATA_CHARACTERISIC = "CE060037-43E5-11E4-916C-0800200C9A66";
        ble.EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC = "CE060038-43E5-11E4-916C-0800200C9A66";
        ble.ROWING_SUMMARY_CHARACTERISIC = "CE060039-43E5-11E4-916C-0800200C9A66";
        ble.EXTRA_ROWING_SUMMARY_CHARACTERISIC = "CE06003A-43E5-11E4-916C-0800200C9A66";
        ble.HEART_RATE_BELT_INFO_CHARACTERISIC = "CE06003B-43E5-11E4-916C-0800200C9A66";
        ble.MULTIPLEXED_INFO_CHARACTERISIC = "CE060080-43E5-11E4-916C-0800200C9A66";
        ble.NOTIFICATION_DESCRIPTOR = "00002902-0000-1000-8000-00805f9b34fb";
        ;
        ;
        ;
    })(ble = ergometer.ble || (ergometer.ble = {}));
})(ergometer || (ergometer = {}));
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
var ergometer;
(function (ergometer) {
    (function (MonitorConnectionState) {
        MonitorConnectionState[MonitorConnectionState["inactive"] = 0] = "inactive";
        MonitorConnectionState[MonitorConnectionState["deviceReady"] = 1] = "deviceReady";
        MonitorConnectionState[MonitorConnectionState["scanning"] = 2] = "scanning";
        MonitorConnectionState[MonitorConnectionState["connecting"] = 3] = "connecting";
        MonitorConnectionState[MonitorConnectionState["connected"] = 4] = "connected";
        MonitorConnectionState[MonitorConnectionState["servicesFound"] = 5] = "servicesFound";
    })(ergometer.MonitorConnectionState || (ergometer.MonitorConnectionState = {}));
    var MonitorConnectionState = ergometer.MonitorConnectionState;
    (function (LogLevel) {
        LogLevel[LogLevel["error"] = 0] = "error";
        LogLevel[LogLevel["info"] = 1] = "info";
        LogLevel[LogLevel["debug"] = 2] = "debug";
        LogLevel[LogLevel["trace"] = 3] = "trace";
    })(ergometer.LogLevel || (ergometer.LogLevel = {}));
    var LogLevel = ergometer.LogLevel;
    ;
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
    var PerformanceMonitor = (function () {
        /**
         * To work with this class you will need to create it.
         */
        function PerformanceMonitor() {
            this._connectionState = MonitorConnectionState.inactive;
            //events
            this._logEvent = new pubSub.Event();
            this._connectionStateChangedEvent = new pubSub.Event();
            this._devices = [];
            this._multiplex = false;
            this._multiplexSubscribeCount = 0;
            this._sampleRate = 1 /* rate500ms */;
            this._autoReConnect = true;
            this._logLevel = LogLevel.error;
            this.initialize();
        }
        Object.defineProperty(PerformanceMonitor.prototype, "logLevel", {
            /**
             * By default it the logEvent will return errors if you want more debug change the log level
             * @returns {LogLevel}
             */
            get: function () {
                return this._logLevel;
            },
            /**
             * By default it the logEvent will return errors if you want more debug change the log level
             * @param value
             */
            set: function (value) {
                this._logLevel = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "autoReConnect", {
            /**
             * when the connection is lost re-connect
             * @returns {boolean}
             */
            get: function () {
                return this._autoReConnect;
            },
            /**
             *
             * when the connection is lost re-connect
             * @param value
             */
            set: function (value) {
                this._autoReConnect = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "multiplex", {
            /**
             * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
             * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
             * the documentation in the properties You must set the multi plex property before connecting
             *
             * @returns {boolean}
             */
            get: function () {
                return this._multiplex;
            },
            /**
             * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
             * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
             * the documentation in the properties You must set the multi plex property before connecting
             * @param value
             */
            set: function (value) {
                if (value != this._multiplex) {
                    if (this.connectionState >= MonitorConnectionState.servicesFound)
                        throw "property multiplex can not be changed after the connection is made.";
                    this._multiplex = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "devices", {
            /**
             * an array of of performance monitor devices which where found during the scan.
             * the array is sorted by connection quality (best on top)
             *
             * @returns {DeviceInfo[]}
             */
            get: function () {
                return this._devices;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingGeneralStatus", {
            /**
             * The values of the last rowingGeneralStatus event
             *
             * @returns {RowingGeneralStatus}
             */
            get: function () {
                return this._rowingGeneralStatus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingAdditionalStatus1", {
            /**
             * The values of the last rowingAdditionalStatus1 event
             * @returns {RowingAdditionalStatus1}
             */
            get: function () {
                return this._rowingAdditionalStatus1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingAdditionalStatus2", {
            /**
             * The values of the last RowingAdditionalStatus2 event
             * @returns {RowingAdditionalStatus2}
             */
            get: function () {
                return this._rowingAdditionalStatus2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingStrokeData", {
            /**
             *  The values of the last rowingStrokeData event
             * @returns {RowingStrokeData}
             */
            get: function () {
                return this._rowingStrokeData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingAdditionalStrokeData", {
            /**
             * The values of the last rowingAdditionalStrokeData event
             * @returns {RowingAdditionalStrokeData}
             */
            get: function () {
                return this._rowingAdditionalStrokeData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingSplitIntervalData", {
            /**
             * The values of the last rowingSplitIntervalData event
             * @returns {RowingSplitIntervalData}
             */
            get: function () {
                return this._rowingSplitIntervalData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingAdditionalSplitIntervalData", {
            /**
             * The values of the last rowingAdditionalSplitIntervalData event
             * @returns {RowingAdditionalSplitIntervalData}
             */
            get: function () {
                return this._rowingAdditionalSplitIntervalData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "workoutSummaryData", {
            /**
             * The values of the last workoutSummaryData event
             * @returns {WorkoutSummaryData}
             */
            get: function () {
                return this._workoutSummaryData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "additionalWorkoutSummaryData", {
            /**
             * The values of the last additionalWorkoutSummaryData event
             * @returns {AdditionalWorkoutSummaryData}
             */
            get: function () {
                return this._additionalWorkoutSummaryData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "additionalWorkoutSummaryData2", {
            /**
             * The values of the last AdditionalWorkoutSummaryData2 event
             * @returns {AdditionalWorkoutSummaryData2}
             */
            get: function () {
                return this._additionalWorkoutSummaryData2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "heartRateBeltInformation", {
            /**
             * The values of the last heartRateBeltInformation event
             * @returns {HeartRateBeltInformation}
             */
            get: function () {
                return this._heartRateBeltInformation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingGeneralStatusEvent", {
            /**
             * read rowingGeneralStatus data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<RowingGeneralStatusEvent>}
             */
            get: function () {
                return this._rowingGeneralStatusEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingAdditionalStatus1Event", {
            /**
             * read rowingGeneralStatus1 data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<RowingAdditionalStatus1Event>}
             */
            get: function () {
                return this._rowingAdditionalStatus1Event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingAdditionalStatus2Event", {
            /**
             * read rowingAdditionalStatus2 data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<RowingAdditionalStatus2Event>}
             */
            get: function () {
                return this._rowingAdditionalStatus2Event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingStrokeDataEvent", {
            /**
             * read rowingStrokeData data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<RowingStrokeDataEvent>}
             */
            get: function () {
                return this._rowingStrokeDataEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingAdditionalStrokeDataEvent", {
            /**
             * read rowingAdditionalStrokeData data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<RowingAdditionalStrokeDataEvent>}
             */
            get: function () {
                return this._rowingAdditionalStrokeDataEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingSplitIntervalDataEvent", {
            /**
             * read rowingSplitIntervalDat data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<RowingSplitIntervalDataEvent>}
             */
            get: function () {
                return this._rowingSplitIntervalDataEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "rowingAdditionalSplitIntervalDataEvent", {
            /**
             * read rowingAdditionalSplitIntervalData data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<RowingAdditionalSplitIntervalDataEvent>}
             */
            get: function () {
                return this._rowingAdditionalSplitIntervalDataEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "workoutSummaryDataEvent", {
            /**
             * read workoutSummaryData data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<WorkoutSummaryDataEvent>}
             */
            get: function () {
                return this._workoutSummaryDataEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "additionalWorkoutSummaryDataEvent", {
            /**
             * read additionalWorkoutSummaryData data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<AdditionalWorkoutSummaryDataEvent>}
             */
            get: function () {
                return this._additionalWorkoutSummaryDataEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "additionalWorkoutSummaryData2Event", {
            /**
             * read additionalWorkoutSummaryData2 data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<AdditionalWorkoutSummaryData2Event>}
             */
            get: function () {
                return this._additionalWorkoutSummaryData2Event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "heartRateBeltInformationEvent", {
            /**
             * read heartRateBeltInformation data
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<HeartRateBeltInformationEvent>}
             */
            get: function () {
                return this._heartRateBeltInformationEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "connectionStateChangedEvent", {
            /**
             * event which is called when the connection state is changed. For example this way you
             * can check if the device is disconnected.
             * connect to the using .sub(this,myFunction)
             * @returns {pubSub.Event<ConnectionStateChangedEvent>}
             */
            get: function () {
                return this._connectionStateChangedEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "logEvent", {
            /**
             * returns error and other log information. Some errors can only be received using the logEvent
             * @returns {pubSub.Event<LogEvent>}
             */
            get: function () {
                return this._logEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "deviceInfo", {
            /**
             * Get device information of the connected device.
             * @returns {DeviceInfo}
             */
            get: function () {
                return this._deviceInfo;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerformanceMonitor.prototype, "sampleRate", {
            /**
             * read the performance montitor sample rate. By default this is 500 ms
             * @returns {number}
             */
            get: function () {
                return this._sampleRate;
            },
            /**
             * Change the performance monitor sample rate.
             * @param value
             */
            set: function (value) {
                var _this = this;
                if (value != this._sampleRate) {
                    try {
                        var dataView = new DataView(new ArrayBuffer(1));
                        dataView.setUint8(0, value);
                        this._device.writeCharacteristic(ergometer.ble.ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC, dataView, function () { _this._sampleRate = value; }, function (e) { _this.handleError(e); });
                    }
                    catch (e) {
                        this.handleError(e);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * disconnect the current connected device
         */
        PerformanceMonitor.prototype.disconnect = function () {
            if (this.connectionState >= MonitorConnectionState.deviceReady) {
                if (this._device)
                    this._device.close();
                this.connectionState = MonitorConnectionState.deviceReady;
            }
        };
        Object.defineProperty(PerformanceMonitor.prototype, "connectionState", {
            /**
             * read the current connection state
             * @returns {MonitorConnectionState}
             */
            get: function () {
                return this._connectionState;
            },
            enumerable: true,
            configurable: true
        });
        /**
         *
         * @param value
         */
        PerformanceMonitor.prototype.changeConnectionState = function (value) {
            if (this._connectionState != value) {
                var oldValue = this._connectionState;
                this._connectionState = value;
                this.connectionStateChangedEvent.pub(oldValue, value);
            }
        };
        /**
         *
         */
        PerformanceMonitor.prototype.enableMultiplexNotification = function () {
            var _this = this;
            if (this._multiplexSubscribeCount == 0)
                this._device.enableNotification(ergometer.ble.MULTIPLEXED_INFO_CHARACTERISIC, function (data) { _this.handleDataCallbackMulti(data); }, this.handleError);
            this._multiplexSubscribeCount++;
        };
        /**
         *
         */
        PerformanceMonitor.prototype.disableMultiPlexNotification = function () {
            this._multiplexSubscribeCount--;
            if (this._multiplexSubscribeCount == 0)
                this._device.disableNotification(ergometer.ble.MULTIPLEXED_INFO_CHARACTERISIC, function () {
                }, this.handleError);
        };
        /**
         *
         */
        PerformanceMonitor.prototype.enableDisableNotification = function () {
            var _this = this;
            if (this.connectionState >= MonitorConnectionState.servicesFound) {
                if (this.rowingGeneralStatusEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.ROWING_STATUS_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleRowingGeneralStatus);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.ROWING_STATUS_CHARACTERISIC, function () {
                        }, this.handleError);
                }
                if (this.rowingAdditionalStatus1Event.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.EXTRA_STATUS1_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleRowingAdditionalStatus1);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.EXTRA_STATUS1_CHARACTERISIC, function () {
                        }, this.handleError);
                }
                if (this.rowingAdditionalStatus2Event.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.EXTRA_STATUS2_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleRowingAdditionalStatus2);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.EXTRA_STATUS2_CHARACTERISIC, function () {
                        }, this.handleError);
                }
                if (this.rowingStrokeDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.STROKE_DATA_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleRowingStrokeData);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.STROKE_DATA_CHARACTERISIC, function () {
                        }, this.handleError);
                }
                if (this.rowingAdditionalStrokeDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.EXTRA_STROKE_DATA_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleRowingAdditionalStrokeData);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.EXTRA_STROKE_DATA_CHARACTERISIC, function () {
                        }, this.handleError);
                }
                if (this.rowingSplitIntervalDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.SPLIT_INTERVAL_DATA_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleRowingSplitIntervalData);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.SPLIT_INTERVAL_DATA_CHARACTERISIC, function () {
                        }, this.handleError);
                }
                if (this.rowingAdditionalSplitIntervalDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleRowingAdditionalSplitIntervalData);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC, function () {
                        }, this.handleError);
                }
                if (this.workoutSummaryDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.ROWING_SUMMARY_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleWorkoutSummaryData);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.ROWING_SUMMARY_CHARACTERISIC, function () {
                        }, this.handleError);
                }
                if (this.additionalWorkoutSummaryDataEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.EXTRA_ROWING_SUMMARY_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleAdditionalWorkoutSummaryData);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.EXTRA_ROWING_SUMMARY_CHARACTERISIC, function () {
                        }, this.handleError);
                }
                if (this.additionalWorkoutSummaryData2Event.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                }
                if (this.heartRateBeltInformationEvent.count > 0) {
                    if (this.multiplex) {
                        this.enableMultiplexNotification();
                    }
                    else {
                        this._device.enableNotification(ergometer.ble.HEART_RATE_BELT_INFO_CHARACTERISIC, function (data) {
                            _this.handleDataCallback(data, _this.handleHeartRateBeltInformation);
                        }, this.handleError);
                    }
                }
                else {
                    if (this.multiplex)
                        this.disableMultiPlexNotification();
                    else
                        this._device.disableNotification(ergometer.ble.HEART_RATE_BELT_INFO_CHARACTERISIC, function () {
                        }, this.handleError);
                }
            }
        };
        /**
         *
         */
        PerformanceMonitor.prototype.initialize = function () {
            /*document.addEventListener(
             'deviceready',
             ()=> {
             evothings.scriptsLoaded(()=>{
             this.onDeviceReady();})},
             false);   */
            var _this = this;
            var enableDisableFunc = function () { _this.enableDisableNotification(); };
            this._rowingGeneralStatusEvent = new pubSub.Event();
            this.rowingGeneralStatusEvent.registerChangedEvent(enableDisableFunc);
            this._rowingAdditionalStatus1Event = new pubSub.Event();
            this.rowingAdditionalStatus1Event.registerChangedEvent(enableDisableFunc);
            this._rowingAdditionalStatus2Event = new pubSub.Event();
            this.rowingAdditionalStatus2Event.registerChangedEvent(enableDisableFunc);
            this._rowingStrokeDataEvent = new pubSub.Event();
            this.rowingStrokeDataEvent.registerChangedEvent(enableDisableFunc);
            this._rowingAdditionalStrokeDataEvent = new pubSub.Event();
            this.rowingAdditionalStrokeDataEvent.registerChangedEvent(enableDisableFunc);
            this._rowingSplitIntervalDataEvent = new pubSub.Event();
            this.rowingSplitIntervalDataEvent.registerChangedEvent(enableDisableFunc);
            this._rowingAdditionalSplitIntervalDataEvent = new pubSub.Event();
            this.rowingAdditionalSplitIntervalDataEvent.registerChangedEvent(enableDisableFunc);
            this._workoutSummaryDataEvent = new pubSub.Event();
            this.workoutSummaryDataEvent.registerChangedEvent(enableDisableFunc);
            this._additionalWorkoutSummaryDataEvent = new pubSub.Event();
            this.additionalWorkoutSummaryDataEvent.registerChangedEvent(enableDisableFunc);
            this._additionalWorkoutSummaryData2Event = new pubSub.Event();
            this.additionalWorkoutSummaryData2Event.registerChangedEvent(enableDisableFunc);
            this._heartRateBeltInformationEvent = new pubSub.Event();
            this.heartRateBeltInformationEvent.registerChangedEvent(enableDisableFunc);
        };
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
        PerformanceMonitor.prototype.traceInfo = function (info) {
            if (this.logLevel >= LogLevel.trace)
                this.logEvent.pub(info, LogLevel.trace);
        };
        /**
         *
         * @param info
         */
        PerformanceMonitor.prototype.debugInfo = function (info) {
            if (this.logLevel >= LogLevel.debug)
                this.logEvent.pub(info, LogLevel.debug);
        };
        /**
         *
         * @param info
         */
        PerformanceMonitor.prototype.showInfo = function (info) {
            if (this.logLevel >= LogLevel.info)
                this.logEvent.pub(info, LogLevel.info);
        };
        /**
         *
         * @param error
         */
        PerformanceMonitor.prototype.handleError = function (error) {
            if (this.logLevel >= LogLevel.error)
                this.logEvent.pub(error, LogLevel.error);
        };
        /**
         *
         * @param device
         */
        PerformanceMonitor.prototype.removeDevice = function (device) {
            this._devices = this._devices.splice(this._devices.indexOf(device), 1);
        };
        /**
         *
         * @param device
         */
        PerformanceMonitor.prototype.addDevice = function (device) {
            var existing = this.findDevice(device.name);
            if (existing)
                this.removeDevice(existing);
            this._devices.push(device);
            //sort on hightest quality above
            this._devices.sort(function (device1, device2) { return device2.quality - device1.quality; });
        };
        /**
         *
         * @param name
         * @returns {DeviceInfo}
         */
        PerformanceMonitor.prototype.findDevice = function (name) {
            var result = null;
            this._devices.forEach(function (device) {
                if (device.name == name)
                    result = device;
            });
            return result;
        };
        /**
         *
         */
        PerformanceMonitor.prototype.stopScan = function () {
            if (this.connectionState == MonitorConnectionState.scanning) {
                evothings.easyble.stopScan();
            }
        };
        /**
         * Scan for device use the deviceFound to connect .
         * @param deviceFound
         */
        PerformanceMonitor.prototype.startScan = function (deviceFound) {
            var _this = this;
            this._devices = [];
            // Save it for next time we use the this.
            //localStorage.setItem('deviceName', this._deviceName);
            // Call stop before you start, just in case something else is running.
            this.stopScan();
            this.changeConnectionState(MonitorConnectionState.scanning);
            evothings.easyble.closeConnectedDevices();
            // Only report devices once.
            evothings.easyble.reportDeviceOnce(true);
            evothings.easyble.startScan(function (device) {
                // Do not show un-named devices.
                /*var deviceName = device.advertisementData ?
                 device.advertisementData.kCBAdvDataLocalName : null;
                 */
                if (!device.name) {
                    return;
                }
                // Print "name : mac address" for every device found.
                _this.debugInfo(device.name + ' : ' + device.address.toString().split(':').join(''));
                // If my device is found connect to it.
                //find any thing starting with PM and then a number a space and a serial number
                if (device.name.match(/PM\d \d*/g)) {
                    _this.showInfo('Status: DeviceInfo found: ' + device.name);
                    var deviceInfo = {
                        connected: false,
                        _internalDevice: device,
                        name: device.name,
                        address: device.address,
                        quality: 2 * (device.rssi + 100) };
                    _this.addDevice(deviceInfo);
                    if (deviceFound(deviceInfo)) {
                        _this.connectToDevice(deviceInfo.name);
                    }
                }
            }, function (error) {
                _this.showInfo('Error: startScan: ' + error);
            });
            this.showInfo('Status: Scanning...');
        };
        /**
         * connect to a specific device. This should be a PM5 device which is found by the startScan. You can
         * only call this function after startScan is called. Connection to a device will stop the scan.
         * @param deviceName
         */
        PerformanceMonitor.prototype.connectToDevice = function (deviceName) {
            var _this = this;
            this.showInfo('Status: Connecting...');
            this.stopScan();
            this.changeConnectionState(MonitorConnectionState.connecting);
            var deviceInfo = this.findDevice(deviceName);
            if (!deviceInfo)
                throw "Device " + deviceName + " not found";
            this._deviceInfo = deviceInfo;
            deviceInfo._internalDevice.connect(function (device) {
                _this.changeConnectionState(MonitorConnectionState.connected);
                _this._device = device;
                _this.showInfo('Status: Connected');
                _this.readServices(_this._device);
            }, function (errorCode) {
                var deviceName = _this.deviceInfo.name;
                _this.changeConnectionState(MonitorConnectionState.deviceReady);
                if (errorCode == "EASYBLE_ERROR_DISCONNECTED") {
                    _this.showInfo('Disconnected');
                    if (_this.autoReConnect) {
                        _this.startScan(function (device) {
                            return device.name == deviceName;
                        });
                    }
                }
                else
                    _this.handleError(errorCode);
            });
        };
        /**
         *  Dump all information on named device to the debug info
         *  this is called when the log level is set to trace
         * @param device
         */
        PerformanceMonitor.prototype.readServices = function (device) {
            var _this = this;
            // Read all services.
            device.readServices(null, function () {
                _this.debugInfo("readServices success");
                if (_this.logLevel > LogLevel.trace)
                    _this.logAllServices(_this._device);
                _this.readPheripheralInfo(function () {
                    // Debug logging of all services, characteristics and descriptors
                    // reported by the BLE board.
                    _this.deviceConnected(_this._device);
                });
            }, function (error) {
                _this.handleError('Error: Failed to read services: ' + error);
                _this.changeConnectionState(MonitorConnectionState.deviceReady);
            });
        };
        /**
         *
         * @param UUID
         * @param readValue
         */
        PerformanceMonitor.prototype.readStringCharacteristic = function (UUID, readValue) {
            var _this = this;
            try {
                this._device.readCharacteristic(UUID, function (data) {
                    readValue(utils.bufferToString(data));
                }, function (e) { _this.handleError(e); readValue(""); });
            }
            catch (e) {
                readValue("");
                this.handleError(e);
            }
        };
        /**
         *
         * @param done
         */
        PerformanceMonitor.prototype.readSampleRate = function (done) {
            var _this = this;
            //allways call done, don not let get errors into the way
            try {
                this._device.readCharacteristic(ergometer.ble.ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC, function (data) {
                    var view = new DataView(data);
                    _this._sampleRate = view.getUint8(0);
                    done();
                }, function (e) { _this.handleError(e); done(); });
            }
            catch (e) {
                this.handleError(e);
                done();
            }
        };
        /**
         *
         * @param done
         */
        PerformanceMonitor.prototype.readPheripheralInfo = function (done) {
            var _this = this;
            //todo: should implement is a less tricky way. is the readCharacteristic really none blocking?, it not it can be written different
            this.readStringCharacteristic(ergometer.ble.SERIALNUMBER_CHARACTERISTIC, function (value) {
                _this._deviceInfo.serial = value;
                _this.readStringCharacteristic(ergometer.ble.HWREVISION_CHARACTERISIC, function (value) {
                    _this._deviceInfo.hardwareRevision = value;
                    _this.readStringCharacteristic(ergometer.ble.FWREVISION_CHARACTERISIC, function (value) {
                        _this._deviceInfo.firmwareRevision = value;
                        _this.readStringCharacteristic(ergometer.ble.MANUFNAME_CHARACTERISIC, function (value) {
                            _this._deviceInfo.manufacturer = value;
                            _this._deviceInfo.connected = true;
                            _this.readSampleRate(function () { done(); });
                        });
                    });
                });
            });
        };
        /**
         *   Debug logging of found services, characteristics and descriptors.
         * @param device
         */
        PerformanceMonitor.prototype.logAllServices = function (device) {
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
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleRowingGeneralStatus = function (data) {
            var parsed = {
                elapsedTime: utils.getUint24(data, 0 /* ELAPSED_TIME_LO */) * 10,
                distance: utils.getUint24(data, 3 /* DISTANCE_LO */) / 10,
                workoutType: data.getUint8(6 /* WORKOUT_TYPE */),
                intervalType: data.getUint8(7 /* INTERVAL_TYPE */),
                workoutState: data.getUint8(8 /* WORKOUT_STATE */),
                rowingState: data.getUint8(9 /* ROWING_STATE */),
                strokeState: data.getUint8(10 /* STROKE_STATE */),
                totalWorkDistance: utils.getUint24(data, 11 /* TOTAL_WORK_DISTANCE_LO */),
                workoutDuration: utils.getUint24(data, 14 /* WORKOUT_DURATION_LO */),
                workoutDurationType: data.getUint8(17 /* WORKOUT_DURATION_TYPE */),
                dragFactor: data.getUint8(18 /* DRAG_FACTOR */),
            };
            if (parsed.workoutDurationType == 0 /* timeDuration */)
                parsed.workoutDuration = parsed.workoutDuration * 10; //in mili seconds
            if (JSON.stringify(this.rowingGeneralStatus) !== JSON.stringify(parsed)) {
                this._rowingGeneralStatus = parsed;
                this.rowingGeneralStatusEvent.pub(parsed);
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleRowingAdditionalStatus1 = function (data) {
            var parsed = {
                elapsedTime: utils.getUint24(data, 0 /* ELAPSED_TIME_LO */) * 10,
                speed: data.getUint16(3 /* SPEED_LO */) / 1000,
                strokeRate: data.getUint8(5 /* STROKE_RATE */),
                heartRate: utils.valueToNullValue(data.getUint8(6 /* HEARTRATE */), 255),
                currentPace: data.getUint16(7 /* CURRENT_PACE_LO */) / 100,
                averagePace: data.getUint16(9 /* AVG_PACE_LO */) / 100,
                restDistance: data.getUint16(11 /* REST_DISTANCE_LO */),
                restTime: utils.getUint24(data, 13 /* REST_TIME_LO */) * 10,
                averagePower: null
            };
            if (data.byteLength == 18 /* BLE_PAYLOAD_SIZE */)
                parsed.averagePower = data.getUint16(16 /* AVG_POWER_LO */);
            if (JSON.stringify(this.rowingAdditionalStatus1) !== JSON.stringify(parsed)) {
                this._rowingAdditionalStatus1 = parsed;
                this.rowingAdditionalStatus1Event.pub(parsed);
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleRowingAdditionalStatus2 = function (data) {
            var parsed;
            if (data.byteLength == 20 /* BLE_PAYLOAD_SIZE */) {
                parsed = {
                    elapsedTime: utils.getUint24(data, 0 /* ELAPSED_TIME_LO */) * 10,
                    intervalCount: data.getUint8(3 /* INTERVAL_COUNT */),
                    averagePower: data.getUint16(4 /* AVG_POWER_LO */),
                    totalCalories: data.getUint16(6 /* TOTAL_CALORIES_LO */),
                    splitAveragePace: data.getUint16(8 /* SPLIT_INTERVAL_AVG_PACE_LO */) * 10,
                    splitAveragePower: data.getUint16(10 /* SPLIT_INTERVAL_AVG_POWER_LO */),
                    splitAverageCalories: data.getUint16(12 /* SPLIT_INTERVAL_AVG_CALORIES_LO */),
                    lastSplitTime: data.getUint16(14 /* LAST_SPLIT_TIME_LO */) * 100,
                    lastSplitDistance: utils.getUint24(data, 17 /* LAST_SPLIT_DISTANCE_LO */)
                };
            }
            else {
                parsed = {
                    elapsedTime: utils.getUint24(data, 0 /* ELAPSED_TIME_LO */) * 10,
                    intervalCount: data.getUint8(3 /* INTERVAL_COUNT */),
                    averagePower: null,
                    totalCalories: data.getUint16(4 /* TOTAL_CALORIES_LO */),
                    splitAveragePace: data.getUint16(6 /* SPLIT_INTERVAL_AVG_PACE_LO */) * 10,
                    splitAveragePower: data.getUint16(8 /* SPLIT_INTERVAL_AVG_POWER_LO */),
                    splitAverageCalories: data.getUint16(10 /* SPLIT_INTERVAL_AVG_CALORIES_LO */),
                    lastSplitTime: data.getUint16(12 /* LAST_SPLIT_TIME_LO */) * 100,
                    lastSplitDistance: utils.getUint24(data, 15 /* LAST_SPLIT_DISTANCE_LO */)
                };
                if (JSON.stringify(this.rowingAdditionalStatus2) !== JSON.stringify(parsed)) {
                    this._rowingAdditionalStatus2 = parsed;
                    this.rowingAdditionalStatus2Event.pub(parsed);
                }
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleRowingStrokeData = function (data) {
            var parsed;
            if (data.byteLength == 20 /* BLE_PAYLOAD_SIZE */) {
                parsed = {
                    elapsedTime: utils.getUint24(data, 0 /* ELAPSED_TIME_LO */) * 10,
                    distance: utils.getUint24(data, 3 /* DISTANCE_LO */) / 10,
                    driveLength: data.getUint8(6 /* DRIVE_LENGTH */) / 100,
                    driveTime: data.getUint8(7 /* DRIVE_TIME */) * 10,
                    strokeRecoveryTime: data.getUint16(8 /* STROKE_RECOVERY_TIME_LO */) * 10,
                    strokeDistance: data.getUint16(10 /* STROKE_DISTANCE_LO */) / 100,
                    peakDriveForce: data.getUint16(12 /* PEAK_DRIVE_FORCE_LO */) / 10,
                    averageDriveForce: data.getUint16(14 /* AVG_DRIVE_FORCE_LO */) / 10,
                    workPerStroke: data.getUint16(16 /* WORK_PER_STROKE_LO */) / 10,
                    strokeCount: data.getUint16(18 /* STROKE_COUNT_LO */)
                };
            }
            else {
                parsed = {
                    elapsedTime: utils.getUint24(data, 0 /* ELAPSED_TIME_LO */) * 10,
                    distance: utils.getUint24(data, 3 /* DISTANCE_LO */) / 10,
                    driveLength: data.getUint8(6 /* DRIVE_LENGTH */) / 100,
                    driveTime: data.getUint8(7 /* DRIVE_TIME */) * 10,
                    strokeRecoveryTime: data.getUint16(8 /* STROKE_RECOVERY_TIME_LO */) * 10,
                    strokeDistance: data.getUint16(10 /* STROKE_DISTANCE_LO */) / 100,
                    peakDriveForce: data.getUint16(12 /* PEAK_DRIVE_FORCE_LO */) / 10,
                    averageDriveForce: data.getUint16(14 /* AVG_DRIVE_FORCE_LO */) / 10,
                    workPerStroke: null,
                    strokeCount: data.getUint16(16 /* STROKE_COUNT_LO */)
                };
            }
            if (JSON.stringify(this.rowingStrokeData) !== JSON.stringify(parsed)) {
                this._rowingStrokeData = parsed;
                this.rowingStrokeDataEvent.pub(parsed);
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleRowingAdditionalStrokeData = function (data) {
            var parsed = {
                elapsedTime: utils.getUint24(data, 0 /* ELAPSED_TIME_LO */) * 10,
                strokePower: data.getUint16(3 /* STROKE_POWER_LO */),
                strokeCalories: data.getUint16(5 /* STROKE_CALORIES_LO */),
                strokeCount: data.getUint16(7 /* STROKE_COUNT_LO */),
                projectedWorkTime: utils.getUint24(data, 9 /* PROJ_WORK_TIME_LO */) * 1000,
                projectedWorkDistance: utils.getUint24(data, 12 /* PROJ_WORK_DIST_LO */),
                workPerStroke: null //filled when multiplexed is true
            };
            if (data.byteLength == 17 /* BLE_PAYLOAD_SIZE */)
                parsed.workPerStroke = data.getUint16(15 /* WORK_PER_STROKE_LO */);
            if (JSON.stringify(this.rowingAdditionalStrokeData) !== JSON.stringify(parsed)) {
                this._rowingAdditionalStrokeData = parsed;
                this.rowingAdditionalStrokeDataEvent.pub(parsed);
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleRowingSplitIntervalData = function (data) {
            var parsed = {
                elapsedTime: utils.getUint24(data, 0 /* ELAPSED_TIME_LO */) * 10,
                distance: utils.getUint24(data, 3 /* DISTANCE_LO */) / 10,
                intervalTime: utils.getUint24(data, 6 /* SPLIT_TIME_LO */) * 100,
                intervalDistance: utils.getUint24(data, 9 /* SPLIT_DISTANCE_LO */),
                intervalRestTime: data.getUint16(12 /* REST_TIME_LO */) * 1000,
                intervalRestDistance: data.getUint16(14 /* REST_DISTANCE_LO */),
                intervalType: data.getUint8(16 /* TYPE */),
                intervalNumber: data.getUint8(17 /* INT_NUMBER */),
            };
            if (JSON.stringify(this.rowingSplitIntervalData) !== JSON.stringify(parsed)) {
                this._rowingSplitIntervalData = parsed;
                this.rowingSplitIntervalDataEvent.pub(parsed);
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleRowingAdditionalSplitIntervalData = function (data) {
            var parsed = {
                elapsedTime: utils.getUint24(data, 0 /* ELAPSED_TIME_LO */) * 10,
                intervalAverageStrokeRate: data.getUint8(3 /* STROKE_RATE */),
                intervalWorkHeartrate: data.getUint8(4 /* WORK_HR */),
                intervalRestHeartrate: data.getUint8(5 /* REST_HR */),
                intervalAveragePace: data.getUint16(6 /* AVG_PACE_LO */) * 10,
                intervalTotalCalories: data.getUint16(8 /* CALORIES_LO */),
                intervalAverageCalories: data.getUint16(10 /* AVG_CALORIES_LO */),
                intervalSpeed: data.getUint16(12 /* SPEED_LO */) / 1000,
                intervalPower: data.getUint16(14 /* POWER_LO */),
                splitAverageDragFactor: data.getUint8(16 /* AVG_DRAG_FACTOR */),
                intervalNumber: data.getUint8(17 /* INT_NUMBER */)
            };
            if (JSON.stringify(this.rowingAdditionalSplitIntervalData) !== JSON.stringify(parsed)) {
                this._rowingAdditionalSplitIntervalData = parsed;
                this.rowingAdditionalSplitIntervalDataEvent.pub(parsed);
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleWorkoutSummaryData = function (data) {
            var parsed = {
                logEntryDate: data.getUint16(0 /* LOG_DATE_LO */),
                logEntryTime: data.getUint16(2 /* LOG_TIME_LO */),
                elapsedTime: utils.getUint24(data, 4 /* ELAPSED_TIME_LO */) * 10,
                distance: utils.getUint24(data, 7 /* DISTANCE_LO */) / 10,
                averageStrokeRate: data.getUint8(10 /* AVG_SPM */),
                endingHeartrate: data.getUint8(11 /* END_HR */),
                averageHeartrate: data.getUint8(12 /* AVG_HR */),
                minHeartrate: data.getUint8(13 /* MIN_HR */),
                maxHeartrate: data.getUint8(14 /* MAX_HR */),
                dragFactorAverage: data.getUint8(15 /* AVG_DRAG_FACTOR */),
                recoveryHeartRate: data.getUint8(16 /* RECOVERY_HR */),
                workoutType: data.getUint8(17 /* WORKOUT_TYPE */),
                averagePace: null
            };
            if (data.byteLength == 20 /* BLE_PAYLOAD_SIZE */) {
                parsed.averagePace = data.getUint16(18 /* AVG_PACE_LO */);
            }
            if (JSON.stringify(this.workoutSummaryData) !== JSON.stringify(parsed)) {
                this._workoutSummaryData = parsed;
                this.workoutSummaryDataEvent.pub(parsed);
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleAdditionalWorkoutSummaryData = function (data) {
            var parsed;
            if (data.byteLength == 19 /* DATA_BLE_PAYLOAD_SIZE */) {
                parsed = {
                    logEntryDate: data.getUint16(0 /* LOG_DATE_LO */),
                    logEntryTime: data.getUint16(1 /* LOG_DATE_HI */),
                    intervalType: data.getUint8(4 /* SPLIT_INT_TYPE */),
                    intervalSize: data.getUint16(5 /* SPLIT_INT_SIZE_LO */),
                    intervalCount: data.getUint8(7 /* SPLIT_INT_COUNT */),
                    totalCalories: data.getUint16(8 /* WORK_CALORIES_LO */),
                    watts: data.getUint16(10 /* WATTS_LO */),
                    totalRestDistance: utils.getUint24(data, 12 /* TOTAL_REST_DISTANCE_LO */),
                    intervalRestTime: data.getUint16(15 /* INTERVAL_REST_TIME_LO */),
                    averageCalories: data.getUint16(17 /* AVG_CALORIES_LO */)
                };
            }
            else {
                parsed = {
                    logEntryDate: data.getUint16(0 /* LOG_DATE_LO */),
                    logEntryTime: data.getUint16(2 /* LOG_TIME_LO */),
                    intervalType: null,
                    intervalSize: data.getUint16(4 /* SPLIT_INT_SIZE_LO */),
                    intervalCount: data.getUint8(6 /* SPLIT_INT_COUNT */),
                    totalCalories: data.getUint16(7 /* WORK_CALORIES_LO */),
                    watts: data.getUint16(9 /* WATTS_LO */),
                    totalRestDistance: utils.getUint24(data, 11 /* TOTAL_REST_DISTANCE_LO */),
                    intervalRestTime: data.getUint16(14 /* INTERVAL_REST_TIME_LO */),
                    averageCalories: data.getUint16(16 /* AVG_CALORIES_LO */)
                };
            }
            if (JSON.stringify(this.additionalWorkoutSummaryData) !== JSON.stringify(parsed)) {
                this._additionalWorkoutSummaryData = parsed;
                this.additionalWorkoutSummaryDataEvent.pub(parsed);
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleAdditionalWorkoutSummaryData2 = function (data) {
            var parsed = {
                logEntryDate: data.getUint16(0 /* LOG_DATE_LO */),
                logEntryTime: data.getUint16(1 /* LOG_DATE_HI */),
                averagePace: data.getUint16(4 /* AVG_PACE_LO */),
                gameIdentifier: data.getUint8(6 /* GAME_ID */),
                gameScore: data.getUint16(7 /* GAME_SCORE_LO */),
                ergMachineType: data.getUint8(9 /* MACHINE_TYPE */),
            };
            if (JSON.stringify(this.additionalWorkoutSummaryData2) !== JSON.stringify(parsed)) {
                this._additionalWorkoutSummaryData2 = parsed;
                this.additionalWorkoutSummaryData2Event.pub(parsed);
            }
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleHeartRateBeltInformation = function (data) {
            var parsed = {
                manufacturerId: data.getUint8(0 /* MANUFACTURER_ID */),
                deviceType: data.getUint8(1 /* DEVICE_TYPE */),
                beltId: data.getUint32(2 /* BELT_ID_LO */),
            };
            if (JSON.stringify(this.heartRateBeltInformation) !== JSON.stringify(parsed)) {
                this._heartRateBeltInformation = parsed;
                this.heartRateBeltInformationEvent.pub(parsed);
            }
        };
        /**
         *
         * @param device
         * @internal
         */
        PerformanceMonitor.prototype.deviceConnected = function (device) {
            var _this = this;
            // First Read all services so easy ble can map the Characteristic to handles
            device.readServices(null, function () {
                _this.debugInfo("readServices success");
                // Debug logging of all services, characteristics and descriptors
                // reported by the BLE board.
                _this.logAllServices(_this._device);
                _this.debugInfo('Status: notifications are activated');
                //handle to the notification
                _this.changeConnectionState(MonitorConnectionState.servicesFound);
                _this.enableDisableNotification();
            }, function (error) {
                _this.handleError('Error: Failed to read services: ' + error);
            });
        };
        /**
         *
         * @param data
         */
        PerformanceMonitor.prototype.handleDataCallbackMulti = function (data) {
            //this.debugInfo("multi data received: " + evothings.util.typedArrayToHexString(data));
            var ar = new DataView(data);
            var dataType = ar.getUint8(0);
            ar = new DataView(data, 1);
            switch (dataType) {
                case 49 /* ROWING_GENERAL_STATUS */: {
                    if (this.rowingGeneralStatusEvent.count > 0)
                        this.handleRowingGeneralStatus(ar);
                    break;
                }
                case 50 /* ROWING_ADDITIONAL_STATUS1 */: {
                    if (this.rowingAdditionalStatus1Event.count > 0)
                        this.handleRowingAdditionalStatus1(ar);
                    break;
                }
                case 51 /* ROWING_ADDITIONAL_STATUS2 */: {
                    if (this.rowingAdditionalStatus2Event.count > 0)
                        this.handleRowingAdditionalStatus2(ar);
                    break;
                }
                case 53 /* STROKE_DATA_STATUS */: {
                    if (this.rowingStrokeDataEvent.count > 0)
                        this.handleRowingStrokeData(ar);
                    break;
                }
                case 54 /* EXTRA_STROKE_DATA_STATUS */: {
                    if (this.rowingAdditionalStrokeDataEvent.count > 0)
                        this.handleRowingAdditionalStrokeData(ar);
                    break;
                }
                case 55 /* SPLIT_INTERVAL_STATUS */: {
                    if (this.rowingSplitIntervalDataEvent.count > 0)
                        this.handleRowingSplitIntervalData(ar);
                    break;
                }
                case 56 /* EXTRA_SPLIT_INTERVAL_STATUS */: {
                    if (this.rowingAdditionalSplitIntervalDataEvent.count > 0)
                        this.handleRowingAdditionalSplitIntervalData(ar);
                    break;
                }
                case 57 /* WORKOUT_SUMMARY_STATUS */: {
                    if (this.workoutSummaryDataEvent.count > 0)
                        this.handleWorkoutSummaryData(ar);
                    break;
                }
                case 58 /* EXTRA_WORKOUT_SUMMARY_STATUS1 */: {
                    if (this.additionalWorkoutSummaryDataEvent.count > 0)
                        this.handleAdditionalWorkoutSummaryData(ar);
                    break;
                }
                case 59 /* HEART_RATE_BELT_INFO_STATUS */: {
                    if (this.heartRateBeltInformationEvent.count > 0)
                        this.handleHeartRateBeltInformation(ar);
                    break;
                }
                case 60 /* EXTRA_WORKOUT_SUMMARY_STATUS2 */: {
                    if (this.additionalWorkoutSummaryData2Event.count > 0)
                        this.handleAdditionalWorkoutSummaryData2(ar);
                    break;
                }
            }
        };
        ;
        /**
         *
         * @param data
         * @param func
         */
        PerformanceMonitor.prototype.handleDataCallback = function (data, func) {
            //this.debugInfo("data received: " + evothings.util.typedArrayToHexString(data));
            var ar = new DataView(data);
            //call the function within the scope of the object
            func.apply(this, [ar]);
        };
        ;
        return PerformanceMonitor;
    })();
    ergometer.PerformanceMonitor = PerformanceMonitor;
})(ergometer || (ergometer = {}));
//# sourceMappingURL=ergometer.js.map