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
var App = /** @class */ (function () {
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
var Demo = /** @class */ (function () {
    function Demo() {
        this.initialize();
    }
    Object.defineProperty(Demo.prototype, "performanceMonitor", {
        get: function () {
            return this._performanceMonitor;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Print debug info to console and application UI.
     */
    Demo.prototype.addText = function (id, text) {
        var ctrl = $("#" + id);
        var txtCtrl = $("<p/>");
        txtCtrl.text(text);
        ctrl.prepend(txtCtrl);
    };
    Demo.prototype.showInfo = function (info) {
        this.addText("data", info);
    };
    Demo.prototype.showError = function (error) {
        this.addText("data", error);
    };
    Demo.prototype.showData = function (data) {
        this.addText("data", data);
    };
    Demo.prototype.initialize = function () {
        var _this = this;
        this._performanceMonitor = new ergometer.PerformanceMonitorUsb();
        this.performanceMonitor.logEvent.sub(this, this.onLog);
        //this.performanceMonitor.logLevel=ergometer.LogLevel.trace;
        var self = this;
        $('#connect').click(function () {
            var index = parseInt($('#devices').val());
            if (function (index) { return 0 && self._foundDevices && self._foundDevices.length > 0; })
                self.performanceMonitor.connectToDevice(self._foundDevices[index])
                    .then(_this.connected.bind(self))
                    .catch(self.showError.bind(_this));
        });
        $('#disconnect').click(function () {
            _this.performanceMonitor.disconnect();
        });
        $('#getinfo').click(function () {
            _this.getInfo();
        });
        this.performanceMonitor.connectionStateChangedEvent.sub(this, function (oldState, newState) {
            _this.showInfo("new connection state=" + newState.toString());
            //when disconnected
            if (oldState > newState && newState <= ergometer.MonitorConnectionState.deviceReady) {
                _this.fillDevices(); // try to find the device again
            }
        });
        this.performanceMonitor.strokeStateEvent.sub(this, function (oldState, newState) {
            _this.showInfo("New state:" + newState.toString());
        });
        this.performanceMonitor.trainingDataEvent.sub(this, function (data) {
            _this.showInfo("training data :" + JSON.stringify(data, null, "  "));
        });
        this.performanceMonitor.strokeDataEvent.sub(this, function (data) {
            _this.showInfo("stroke data:" + JSON.stringify(data, null, "  "));
        });
        this.performanceMonitor.powerCurveEvent.sub(this, function (data) {
            _this.showInfo("stroke data:" + JSON.stringify(data, null, "  "));
        });
    };
    Demo.prototype.connected = function () {
        this.getInfo();
    };
    Demo.prototype.getInfo = function () {
        var _this = this;
        //send an csafe command to get some info
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
    };
    Demo.prototype.onLog = function (info, logLevel) {
        this.showData(info);
    };
    Demo.prototype.pageLoaded = function () {
        this.start();
    };
    Demo.prototype.fillDevices = function () {
        //if (this.performanceMonitor.connectionState<=ergometer.MonitorConnectionState.readyForCommunication) {
        var _this = this;
        //}
        //fill the drop down
        this.performanceMonitor.requestDevics().then(function (devices) {
            //if nothing found, try again later
            if (!devices || devices.length == 0) {
                setTimeout(function () { _this.fillDevices(); }, 1000);
            }
            else {
                var options = $('#devices');
                options.find('option').remove();
                _this._foundDevices = devices;
                var i = 0;
                devices.forEach(function (device) {
                    options.append($("<option />").val(i.toString()).text(device.productName));
                    i++;
                });
            }
        }).catch(this.showError.bind(this));
    };
    Demo.prototype.start = function () {
        this.fillDevices();
    };
    return Demo;
}());
//# sourceMappingURL=app.js.map