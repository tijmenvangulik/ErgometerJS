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
    get lastDeviceName() {
        if (!this._lastDeviceName) {
            var value = localStorage.getItem("lastDeviceName");
            if (value == "undefined" || value == "null" || value == null)
                this._lastDeviceName = "";
            else
                this._lastDeviceName = value;
        }
        return this._lastDeviceName;
    }
    set lastDeviceName(value) {
        if (this._lastDeviceName != value) {
            this._lastDeviceName = value;
            localStorage.setItem("lastDeviceName", value);
        }
    }
    addText(id, text) {
        var ctrl = $("#" + id);
        var txtCtrl = $("<p/>");
        txtCtrl.text(text);
        ctrl.prepend(txtCtrl);
    }
    showData(data) {
        this.addText("data", data);
    }
    initialize() {
        this._performanceMonitor = new ergometer.PerformanceMonitorBle();
        //this.performanceMonitor.multiplex=true; //needed for some older android devices which limited device capablity. This must be set before conneting
        //this.performanceMonitor.logLevel=ergometer.LogLevel.trace; //by default it is error, for more debug info  change the level
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
        this.performanceMonitor.powerCurveEvent.sub(this, this.onPowerCurve);
        $("#StartScan").click(() => {
            this.startScan();
        });
    }
    onLog(info, logLevel) {
        this.showData(info);
    }
    onRowingGeneralStatus(data) {
        this.showData('RowingGeneralStatus:' + JSON.stringify(data));
    }
    onRowingAdditionalStatus1(data) {
        this.showData('RowingAdditionalStatus1:' + JSON.stringify(data));
    }
    onRowingAdditionalStatus2(data) {
        this.showData('RowingAdditionalStatus2:' + JSON.stringify(data));
    }
    onRowingStrokeData(data) {
        this.showData('RowingStrokeData:' + JSON.stringify(data));
    }
    onRowingAdditionalStrokeData(data) {
        this.showData('RowingAdditionalStrokeData:' + JSON.stringify(data));
    }
    onRowingSplitIntervalData(data) {
        this.showData('RowingSplitIntervalData:' + JSON.stringify(data));
    }
    onRowingAdditionalSplitIntervalData(data) {
        this.showData('RowingAdditionalSplitIntervalData:' + JSON.stringify(data));
    }
    //
    onWorkoutSummaryData(data) {
        this.showData('WorkoutSummaryData' + JSON.stringify(data));
    }
    onAdditionalWorkoutSummaryData(data) {
        this.showData('AdditionalWorkoutSummaryData' + JSON.stringify(data));
    }
    onAdditionalWorkoutSummaryData2(data) {
        this.showData('AdditionalWorkoutSummaryData2:' + JSON.stringify(data));
    }
    onHeartRateBeltInformation(data) {
        this.showData('HeartRateBeltInformation:' + JSON.stringify(data));
    }
    onConnectionStateChanged(oldState, newState) {
        if (newState == ergometer.MonitorConnectionState.readyForCommunication) {
            //this.performanceMonitor.sampleRate=SampleRate.rate250ms;
            this.showData(JSON.stringify(this._performanceMonitor.deviceInfo));
            //send two commands and show the results in a jquery way
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
    }
    onPowerCurve(curve) {
        this.showData("Curve in gui: " + JSON.stringify(curve));
    }
    pageLoaded() {
        var self = this;
        $('#devices').change(function () {
            self.performanceMonitor.connectToDevice(this.value);
        });
    }
    constructor() {
        this._lastDeviceName = null;
        this.initialize();
    }
    fillDevices() {
        var options = $('#devices');
        options.find('option').remove();
        //fill the drop down
        this.performanceMonitor.devices.forEach((device) => {
            options.append($("<option />").val(device.name).text(device.name + " (" + device.quality.toString() + "% )"));
        });
    }
    setDevice(name) {
    }
    startScan() {
        this.performanceMonitor.startScan((device) => {
            //in web blue tooth the device selection is done by the user
            //just return true to to accept the user selection
            return true;
        });
    }
}
//# sourceMappingURL=app.js.map