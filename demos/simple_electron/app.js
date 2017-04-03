/**
 * Demo of Concept 2 ergometer Performance Monitor for electron
 *
 * This unit contains electron specific code
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
var App = (function () {
    function App() {
        var _this = this;
        $().ready(function () {
            _this._demo = new Demo();
            _this.demo.pageLoaded();
        });
    }
    Object.defineProperty(App.prototype, "demo", {
        get: function () {
            return this._demo;
        },
        enumerable: true,
        configurable: true
    });
    return App;
}());
var app = new App();
/**
 * Demo of Concept 2 ergometer Performance Monitor
 *
 * This will will work with the PM5
 *
 * This unit contains some demo code which can both run on electron and cordova
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
var Demo = (function () {
    function Demo() {
        this._lastDeviceName = null;
        this.initialize();
    }
    Object.defineProperty(Demo.prototype, "performanceMonitor", {
        get: function () {
            return this._performanceMonitor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Demo.prototype, "lastDeviceName", {
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
    Demo.prototype.showInfo = function (info) {
        $("#info").text(info);
    };
    Demo.prototype.showData = function (data) {
        $("#data").text(data);
        console.debug(data);
    };
    Demo.prototype.initialize = function () {
        this._performanceMonitor = new ergometer.PerformanceMonitor();
        //this.performanceMonitor.multiplex=true; //needed for some older android devices which limited device capablity. This must be set before ting
        this.performanceMonitor.logLevel = ergometer.LogLevel.trace; //by default it is error, for more debug info  change the level
        this.performanceMonitor.logEvent.sub(this, this.onLog);
        this.performanceMonitor.connectionStateChangedEvent.sub(this, this.onConnectionStateChanged);
        //connect to the rowing
        //this.performanceMonitor.rowingGeneralStatusEvent.sub(this,this.onRowingGeneralStatus);
        /* this.performanceMonitor.rowingAdditionalStatus1Event.sub(this,this.onRowingAdditionalStatus1);
         this.performanceMonitor.rowingAdditionalStatus2Event.sub(this,this.onRowingAdditionalStatus2);
         this.performanceMonitor.rowingStrokeDataEvent.sub(this,this.onRowingStrokeData);
         this.performanceMonitor.rowingAdditionalStrokeDataEvent.sub(this,this.onRowingAdditionalStrokeData);
         this.performanceMonitor.rowingSplitIntervalDataEvent.sub(this,this.onRowingSplitIntervalData);
         this.performanceMonitor.rowingAdditionalSplitIntervalDataEvent.sub(this,this.onRowingAdditionalSplitIntervalData);
         this.performanceMonitor.workoutSummaryDataEvent.sub(this,this.onWorkoutSummaryData);
         this.performanceMonitor.additionalWorkoutSummaryDataEvent.sub(this,this.onAdditionalWorkoutSummaryData);
         this.performanceMonitor.heartRateBeltInformationEvent.sub(this,this.onHeartRateBeltInformation);
         this.performanceMonitor.additionalWorkoutSummaryData2Event.sub(this,this.onAdditionalWorkoutSummaryData2); */
        this.performanceMonitor.powerCurveEvent.sub(this, this.onPowerCurve);
    };
    Demo.prototype.onLog = function (info, logLevel) {
        this.showData(info);
    };
    Demo.prototype.onRowingGeneralStatus = function (data) {
        this.showData('RowingGeneralStatus:' + JSON.stringify(data));
    };
    Demo.prototype.onRowingAdditionalStatus1 = function (data) {
        this.showData('RowingAdditionalStatus1:' + JSON.stringify(data));
    };
    Demo.prototype.onRowingAdditionalStatus2 = function (data) {
        this.showData('RowingAdditionalStatus2:' + JSON.stringify(data));
    };
    Demo.prototype.onRowingStrokeData = function (data) {
        this.showData('RowingStrokeData:' + JSON.stringify(data));
    };
    Demo.prototype.onRowingAdditionalStrokeData = function (data) {
        this.showData('RowingAdditionalStrokeData:' + JSON.stringify(data));
    };
    Demo.prototype.onRowingSplitIntervalData = function (data) {
        this.showData('RowingSplitIntervalData:' + JSON.stringify(data));
    };
    Demo.prototype.onRowingAdditionalSplitIntervalData = function (data) {
        this.showData('RowingAdditionalSplitIntervalData:' + JSON.stringify(data));
    };
    //
    Demo.prototype.onWorkoutSummaryData = function (data) {
        this.showData('WorkoutSummaryData' + JSON.stringify(data));
    };
    Demo.prototype.onAdditionalWorkoutSummaryData = function (data) {
        this.showData('AdditionalWorkoutSummaryData' + JSON.stringify(data));
    };
    Demo.prototype.onAdditionalWorkoutSummaryData2 = function (data) {
        this.showData('AdditionalWorkoutSummaryData2:' + JSON.stringify(data));
    };
    Demo.prototype.onHeartRateBeltInformation = function (data) {
        this.showData('HeartRateBeltInformation:' + JSON.stringify(data));
    };
    Demo.prototype.onConnectionStateChanged = function (oldState, newState) {
        var _this = this;
        if (newState == ergometer.MonitorConnectionState.readyForCommunication) {
            //this.performanceMonitor.sampleRate=SampleRate.rate250ms;
            this.showData(JSON.stringify(this._performanceMonitor.deviceInfo));
            //send two commands and show the results in a jquery way
            this.performanceMonitor.csafeBuffer
                .clear()
                .getStrokeState({
                onDataReceived: function (strokeState) {
                    _this.showData("stroke state: " + strokeState);
                }
            })
                .getVersion({
                onDataReceived: function (version) {
                    _this.showData("Version hardware " + version.HardwareVersion + " software:" + version.FirmwareVersion);
                }
            })
                .setProgram({ value: 1 /* StandardList1 */ })
                .send()
                .then(function () {
                console.log("send done, you can send th next");
            });
        }
    };
    Demo.prototype.onPowerCurve = function (curve) {
        this.showData("Curve in gui: " + JSON.stringify(curve));
    };
    Demo.prototype.pageLoaded = function () {
        var self = this;
        $('#devices').change(function () {
            self.performanceMonitor.connectToDevice(this.value);
        });
        $('#devices').change(function () {
            self.performanceMonitor.connectToDevice(this.value);
        });
        this.start();
    };
    Demo.prototype.fillDevices = function () {
        var options = $('#devices');
        options.find('option').remove();
        //fill the drop down
        this.performanceMonitor.devices.forEach(function (device) {
            options.append($("<option />").val(device.name).text(device.name + " (" + device.quality.toString() + "% )"));
        });
    };
    Demo.prototype.setDevice = function (name) {
    };
    Demo.prototype.startScan = function () {
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
    Demo.prototype.start = function () {
        this.startScan();
    };
    return Demo;
}());
//# sourceMappingURL=app.js.map