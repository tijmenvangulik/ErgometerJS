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
class App {
    get demo() {
        return this._demo;
    }
    constructor() {
        $().ready(() => {
            this._demo = new Demo();
            this.demo.pageLoaded();
        });
    }
}
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
class Demo {
    get performanceMonitor() {
        return this._performanceMonitor;
    }
    /**
     * Print debug info to console and application UI.
     */
    addText(id, text) {
        var ctrl = $("#" + id);
        var txtCtrl = $("<p/>");
        txtCtrl.text(text);
        ctrl.prepend(txtCtrl);
    }
    showInfo(info) {
        this.addText("data", info);
    }
    showError(error) {
        this.addText("data", error);
    }
    showData(data) {
        this.addText("data", data);
    }
    initialize() {
        this._performanceMonitor = new ergometer.PerformanceMonitorUsb();
        this.performanceMonitor.logEvent.sub(this, this.onLog);
        //this.performanceMonitor.logLevel=ergometer.LogLevel.trace;
        var self = this;
        $('#connect').click(() => {
            var indexstr = $('#devices').val();
            if (indexstr) {
                var index = parseInt(indexstr);
                if (index >= 0 && self._foundDevices && self._foundDevices.length > 0)
                    self.performanceMonitor.connectToDevice(self._foundDevices[index])
                        .then(this.connected.bind(self))
                        .catch(self.showError.bind(this));
            }
            else
                this.showError("first select a pm device");
        });
        $('#disconnect').click(() => {
            this.performanceMonitor.disconnect();
        });
        $('#getinfo').click(() => {
            this.getInfo();
        });
        this.performanceMonitor.connectionStateChangedEvent.sub(this, (oldState, newState) => {
            this.showInfo("new connection state=" + newState.toString());
            //when disconnected
            if (oldState > newState && newState <= ergometer.MonitorConnectionState.deviceReady) {
                this.fillDevices(); // try to find the device again
            }
        });
        this.performanceMonitor.strokeStateEvent.sub(this, (oldState, newState) => {
            this.showInfo("New state:" + newState.toString());
        });
        this.performanceMonitor.trainingDataEvent.sub(this, (data) => {
            this.showInfo("training data :" + JSON.stringify(data, null, "  "));
        });
        this.performanceMonitor.strokeDataEvent.sub(this, (data) => {
            this.showInfo("stroke data:" + JSON.stringify(data, null, "  "));
        });
        this.performanceMonitor.powerCurveEvent.sub(this, (data) => {
            this.showInfo("stroke data:" + JSON.stringify(data, null, "  "));
        });
    }
    connected() {
        this.getInfo();
    }
    getInfo() {
        //send an csafe command to get some info
        this.performanceMonitor.newCsafeBuffer()
            .getStrokeState({
            onDataReceived: (strokeState) => {
                this.showData(`stroke state: ${strokeState}`);
            }
        })
            .getVersion({
            onDataReceived: (version) => {
                this.showData(`Version hardware ${version.HardwareVersion} software:${version.FirmwareVersion}`);
            }
        })
            .setProgram({ value: 1 /* ergometer.Program.StandardList1 */ })
            .send()
            .then(() => {
            console.log("send done, you can send th next");
        });
    }
    onLog(info, logLevel) {
        this.showData(info);
    }
    pageLoaded() {
        this.start();
    }
    constructor() {
        this.initialize();
    }
    fillDevices() {
        //if (this.performanceMonitor.connectionState<=ergometer.MonitorConnectionState.readyForCommunication) {
        //}
        //fill the drop down
        this.performanceMonitor.requestDevics().then(devices => {
            //if nothing found, try again later
            if (!devices || devices.length == 0) {
                setTimeout(() => { this.fillDevices(); }, 1000);
            }
            else {
                var options = $('#devices');
                options.find('option').remove();
                this._foundDevices = devices;
                var i = 0;
                devices.forEach((device) => {
                    options.append($("<option />").val(i.toString()).text(device.productName));
                    i++;
                });
            }
        }).catch(this.showError.bind(this));
    }
    start() {
        this.fillDevices();
    }
}
//# sourceMappingURL=app.js.map