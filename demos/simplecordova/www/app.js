/**
 * Demo of Concept 2 ergometer Performance Monitor for Cordova
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
/// <reference path="typings/jquery.d.ts"/>
/// <reference path="typings/jquerymobile.d.ts"/>
/// <reference path="typings/ergometer.d.ts"/>
var LogLevel = ergometer.LogLevel;
/**
 * Object that holds application data and functions.
 */
var App = (function () {
    function App() {
        this._lastDeviceName = null;
        this.initialize();
        /*$(document).ready( ()=>{
            document.addEventListener('deviceready', () => {this.onDeviceReady();},false);
            document.addEventListener('pause', () => {this.onPause();}, false);
            document.addEventListener('resume', () => {this.onResume();}, false);
        });  */
    }
    Object.defineProperty(App.prototype, "performanceMonitor", {
        get: function () {
            return this._performanceMonitor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(App.prototype, "lastDeviceName", {
        get: function () {
            if (!this._lastDeviceName) {
                var value = localStorage.getItem("lastDeviceName");
                if (value == "undefined" || value == "null" || value == null)
                    this._lastDeviceName = "";
                else
                    this._lastDeviceName = value;
            }
            return this._lastDeviceName;
        },
        set: function (value) {
            if (this._lastDeviceName != value) {
                this._lastDeviceName = value;
                localStorage.setItem("lastDeviceName", value);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Print debug info to console and application UI.
     */
    App.prototype.showInfo = function (info) {
        $("#info").text(info);
    };
    App.prototype.showData = function (data) {
        $("#data").text(data);
        console.debug(data);
    };
    App.prototype.initialize = function () {
        var _this = this;
        this._performanceMonitor = new ergometer.PerformanceMonitor();
        //this.performanceMonitor.multiplex=true; //needed for some older android devices which limited device capablity. This must be set before ting
        this.performanceMonitor.logLevel = LogLevel.trace; //by default it is error, for more debug info  change the level
        this.performanceMonitor.logEvent.sub(this, this.onLog);
        this.performanceMonitor.connectionStateChangedEvent.sub(this, this.onConnectionStateChanged);
        //connect to the rowing
        this.performanceMonitor.rowingGeneralStatusEvent.sub(this, this.onRowingGeneralStatus);
        this.performanceMonitor.rowingAdditionalStatus1Event.sub(this, this.onRowingAdditionalStatus1);
        this.performanceMonitor.rowingAdditionalStatus2Event.sub(this, this.onRowingAdditionalStatus2);
        this.performanceMonitor.rowingStrokeDataEvent.sub(this, this.onRowingStrokeData);
        this.performanceMonitor.rowingAdditionalStrokeDataEvent.sub(this, this.onRowingAdditionalStrokeData);
        this.performanceMonitor.rowingSplitIntervalDataEvent.sub(this, this.onRowingSplitIntervalData);
        this.performanceMonitor.rowingAdditionalSplitIntervalDataEvent.sub(this, this.onRowingAdditionalSplitIntervalData);
        this.performanceMonitor.workoutSummaryDataEvent.sub(this, this.onWorkoutSummaryData);
        this.performanceMonitor.additionalWorkoutSummaryDataEvent.sub(this, this.onAdditionalWorkoutSummaryData);
        this.performanceMonitor.heartRateBeltInformationEvent.sub(this, this.onHeartRateBeltInformation);
        this.performanceMonitor.additionalWorkoutSummaryData2Event.sub(this, this.onAdditionalWorkoutSummaryData2);
        window.onload = function () {
            document.addEventListener('deviceready', function () { _this.onDeviceReady(); }, false);
        };
    };
    App.prototype.onLog = function (info, logLevel) {
        this.showInfo(info);
    };
    App.prototype.onRowingGeneralStatus = function (data) {
        this.showData('RowingGeneralStatus:' + JSON.stringify(data));
    };
    App.prototype.onRowingAdditionalStatus1 = function (data) {
        this.showData('RowingAdditionalStatus1:' + JSON.stringify(data));
    };
    App.prototype.onRowingAdditionalStatus2 = function (data) {
        this.showData('RowingAdditionalStatus2:' + JSON.stringify(data));
    };
    App.prototype.onRowingStrokeData = function (data) {
        this.showData('RowingStrokeData:' + JSON.stringify(data));
    };
    App.prototype.onRowingAdditionalStrokeData = function (data) {
        this.showData('RowingAdditionalStrokeData:' + JSON.stringify(data));
    };
    App.prototype.onRowingSplitIntervalData = function (data) {
        this.showData('RowingSplitIntervalData:' + JSON.stringify(data));
    };
    App.prototype.onRowingAdditionalSplitIntervalData = function (data) {
        this.showData('RowingAdditionalSplitIntervalData:' + JSON.stringify(data));
    };
    //
    App.prototype.onWorkoutSummaryData = function (data) {
        this.showData('WorkoutSummaryData' + JSON.stringify(data));
    };
    App.prototype.onAdditionalWorkoutSummaryData = function (data) {
        this.showData('AdditionalWorkoutSummaryData' + JSON.stringify(data));
    };
    App.prototype.onAdditionalWorkoutSummaryData2 = function (data) {
        this.showData('AdditionalWorkoutSummaryData2:' + JSON.stringify(data));
    };
    App.prototype.onHeartRateBeltInformation = function (data) {
        this.showData('HeartRateBeltInformation:' + JSON.stringify(data));
    };
    App.prototype.onConnectionStateChanged = function (oldState, newState) {
        if (newState == ergometer.MonitorConnectionState.connected) {
            this.showData(JSON.stringify(this._performanceMonitor.deviceInfo));
        }
    };
    App.prototype.onPause = function () {
        // TODO: This application has been suspended. Save application state here.
    };
    App.prototype.onResume = function () {
        // TODO: This application has been reactivated. Restore application state here.
    };
    App.prototype.onDeviceReady = function () {
        var _this = this;
        document.addEventListener('pause', function () { _this.onPause(); }, false);
        document.addEventListener('resume', function () { _this.onResume(); }, false);
        var self = this;
        $('#devices').change(function () {
            self.performanceMonitor.connectToDevice(this.value);
        });
        this.start();
    };
    App.prototype.fillDevices = function () {
        var options = $('#devices');
        options.find('option').remove();
        //fill the drop down
        this.performanceMonitor.devices.forEach(function (device) {
            options.append($("<option />").val(device.name).text(device.name + " (" + device.quality.toString() + "% )"));
        });
    };
    App.prototype.startScan = function () {
        var _this = this;
        this.performanceMonitor.startScan(function (device) {
            _this.fillDevices();
            if (!_this.lastDeviceName || device.name == _this.lastDeviceName) {
                $('#devices').val(device.name);
                return true; //this will connect
            }
            else
                return false;
        });
    };
    App.prototype.start = function () {
        this.startScan();
    };
    return App;
})();
var app = new App();
//# sourceMappingURL=app.js.map