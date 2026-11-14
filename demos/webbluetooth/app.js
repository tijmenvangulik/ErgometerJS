var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CsafeTests {
    constructor(monitor, log, isBluetooth) {
        this.monitor = monitor;
        this.log = log;
        this.isBluetooth = isBluetooth;
    }
    run(title, tests) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.monitor.connectionState != ergometer.MonitorConnectionState.readyForCommunication) {
                this.log(`${title}: not connected`);
                return;
            }
            this.log(`===== ${title} =====`);
            for (const [name, build] of tests) {
                let received = false;
                const show = (value) => {
                    received = true;
                    this.log(`${name}: ${typeof value == "object" ? JSON.stringify(value) : value}`);
                };
                try {
                    const buffer = this.monitor.newCsafeBuffer();
                    build(buffer, show);
                    //report errors of the individual command
                    buffer.rawCommands.forEach(c => c.onError = (e) => this.log(`${name}: ERROR ${e}`));
                    yield buffer.send();
                    const waits = buffer.rawCommands.some(c => c.waitForResponse);
                    if (waits && !received)
                        this.log(`${name}: no data received`);
                    else if (!waits)
                        this.log(`${name}: send`);
                }
                catch (e) {
                    this.log(`${name}: ERROR ${e}`);
                }
            }
            this.log(`===== ${title} done =====`);
        });
    }
    publicCommands() {
        return this.run("public commands", [
            ["getStatus", (b, show) => b.getStatus({ onDataReceived: show })],
            ["getVersion", (b, show) => b.getVersion({ onDataReceived: show })],
            ["getSerialNumber", (b, show) => b.getSerialNumber({ onDataReceived: show })],
            ["getUserId", (b, show) => b.getUserId({ onDataReceived: show })],
            ["getUnits", (b, show) => b.getUnits({ onDataReceived: show })],
            ["getOdometer", (b, show) => b.getOdometer({ onDataReceived: show })],
            ["getErrorCode", (b, show) => b.getErrorCode({ onDataReceived: show })],
            ["getProgram", (b, show) => b.getProgram({ onDataReceived: show })],
            ["getUserInfo", (b, show) => b.getUserInfo({ onDataReceived: show })],
            ["getWork", (b, show) => b.getWork({ onDataReceived: show })],
            ["getHorizontal", (b, show) => b.getHorizontal({ onDataReceived: show })],
            ["getCalories", (b, show) => b.getCalories({ onDataReceived: show })],
            ["getPace", (b, show) => b.getPace({ onDataReceived: show })],
            ["getCadence", (b, show) => b.getCadence({ onDataReceived: show })],
            ["getPower", (b, show) => b.getPower({ onDataReceived: show })],
            ["getHeartRate", (b, show) => b.getHeartRate({ onDataReceived: show })],
            ["getStatus after", (b, show) => b.getStatus({ onDataReceived: show })]
        ]);
    }
    monitorInfo() {
        return this.run("monitor info", [
            ["getFirmwareVersion", (b, show) => b.getFirmwareVersion({ onDataReceived: show })],
            ["getHardwareVersion", (b, show) => b.getHardwareVersion({ onDataReceived: show })],
            ["getHardwareAddress", (b, show) => b.getHardwareAddress({ onDataReceived: show })],
            ["getDateTime", (b, show) => b.getDateTime({ onDataReceived: (d) => show(d.toString()) })],
            ["getBatteryLevelPercent", (b, show) => b.getBatteryLevelPercent({ onDataReceived: show })],
            ["getErgMachineType", (b, show) => b.getErgMachineType({ onDataReceived: show })],
            ["getOperationalState", (b, show) => b.getOperationalState({ onDataReceived: show })],
            ["getRowingState", (b, show) => b.getRowingState({ onDataReceived: show })],
            ["getFlywheelSpeed", (b, show) => b.getFlywheelSpeed({ onDataReceived: show })],
            ["getLanguageType", (b, show) => b.getLanguageType({ onDataReceived: show })],
            ["getDisplayType", (b, show) => b.getDisplayType({ onDataReceived: show })],
            ["getDisplayUnits", (b, show) => b.getDisplayUnits({ onDataReceived: show })],
            ["getScreenStateStatus", (b, show) => b.getScreenStateStatus({ onDataReceived: show })],
            ["getUIEvents", (b, show) => b.getUIEvents({ onDataReceived: show })],
            ["getWorkoutType", (b, show) => b.getWorkoutType({ onDataReceived: show })],
            ["getWorkoutState", (b, show) => b.getWorkoutState({ onDataReceived: show })],
            ["getWorkoutDuration", (b, show) => b.getWorkoutDuration({ onDataReceived: show })],
            ["getWorkOther", (b, show) => b.getWorkOther({ onDataReceived: show })],
            ["getTargetPaceTime", (b, show) => b.getTargetPaceTime({ onDataReceived: show })]
        ]);
    }
    workoutData() {
        return this.run("workout data (row a bit first)", [
            ["getWorkTime", (b, show) => b.getWorkTime({ onDataReceived: show })],
            ["getWorkDistance", (b, show) => b.getWorkDistance({ onDataReceived: show })],
            ["getProjectedWorkTime", (b, show) => b.getProjectedWorkTime({ onDataReceived: show })],
            ["getProjectedWorkDistance", (b, show) => b.getProjectedWorkDistance({ onDataReceived: show })],
            ["getTotalWorkDistance", (b, show) => b.getTotalWorkDistance({ onDataReceived: show })],
            ["getTotalRestTime", (b, show) => b.getTotalRestTime({ onDataReceived: show })],
            ["getRestDistance", (b, show) => b.getRestDistance({ onDataReceived: show })],
            ["getTotalRestDistance", (b, show) => b.getTotalRestDistance({ onDataReceived: show })],
            ["getLastRestDistance", (b, show) => b.getLastRestDistance({ onDataReceived: show })],
            ["getStroke500mPace", (b, show) => b.getStroke500mPace({ onDataReceived: show })],
            ["getStrokePower", (b, show) => b.getStrokePower({ onDataReceived: show })],
            ["getStrokeCaloricBurnRate", (b, show) => b.getStrokeCaloricBurnRate({ onDataReceived: show })],
            ["getStrokeRate", (b, show) => b.getStrokeRate({ onDataReceived: show })],
            ["getStrokeRateState", (b, show) => b.getStrokeRateState({ onDataReceived: show })],
            ["getDragFactor", (b, show) => b.getDragFactor({ onDataReceived: show })],
            ["getSplitTime", (b, show) => b.getSplitTime({ onDataReceived: show })],
            ["getLastSplitTime", (b, show) => b.getLastSplitTime({ onDataReceived: show })],
            ["getSplitDistance", (b, show) => b.getSplitDistance({ onDataReceived: show })],
            ["getLastSplitDistance", (b, show) => b.getLastSplitDistance({ onDataReceived: show })],
            ["getSplitAvg500mPace", (b, show) => b.getSplitAvg500mPace({ onDataReceived: show })],
            ["getSplitAvgPower", (b, show) => b.getSplitAvgPower({ onDataReceived: show })],
            ["getSplitAvgCaloricBurnRate", (b, show) => b.getSplitAvgCaloricBurnRate({ onDataReceived: show })],
            ["getSplitAvgCalories", (b, show) => b.getSplitAvgCalories({ onDataReceived: show })],
            ["getSplitAvgStrokeRate", (b, show) => b.getSplitAvgStrokeRate({ onDataReceived: show })],
            ["getTotalAvg500mPace", (b, show) => b.getTotalAvg500mPace({ onDataReceived: show })],
            ["getTotalAvgPower", (b, show) => b.getTotalAvgPower({ onDataReceived: show })],
            ["getTotalAvgCaloricBurnRate", (b, show) => b.getTotalAvgCaloricBurnRate({ onDataReceived: show })],
            ["getTotalAvgCalories", (b, show) => b.getTotalAvgCalories({ onDataReceived: show })],
            ["getTotalAvgStrokeRate", (b, show) => b.getTotalAvgStrokeRate({ onDataReceived: show })]
        ]);
    }
    usersHeartRate() {
        return this.run("users / heart rate / games", [
            ["getHeartRateMonitor", (b, show) => b.getHeartRateMonitor({ onDataReceived: show })],
            ["getExtendedHeartRateMonitor", (b, show) => b.getExtendedHeartRateMonitor({ onDataReceived: show })],
            ["getHeartRateState", (b, show) => b.getHeartRateState({ onDataReceived: show })],
            ["getAvgHeartRate", (b, show) => b.getAvgHeartRate({ onDataReceived: show })],
            ["getEndingAvgHeartRate", (b, show) => b.getEndingAvgHeartRate({ onDataReceived: show })],
            ["getRestAvgHeartRate", (b, show) => b.getRestAvgHeartRate({ onDataReceived: show })],
            ["getHeartbeatData", (b, show) => b.getHeartbeatData({ onDataReceived: show })],
            ["getUserIdString user 0", (b, show) => b.getUserIdString({ userNumber: 0, onDataReceived: show })],
            ["getUserIdNumber user 0", (b, show) => b.getUserIdNumber({ userNumber: 0, onDataReceived: show })],
            ["getUserProfile user 0", (b, show) => b.getUserProfile({ userNumber: 0, onDataReceived: show })],
            ["getGameScore", (b, show) => b.getGameScore({ onDataReceived: show })]
        ]);
    }
    /**
     * Several commands in one buffer: tests merging commands into one wrapper and the response parsing.
     * The request is 13 bytes (F1 7E 03 97 ED E8 7F 02 B0 B3 94 chk F2) so it also fits in one
     * bluetooth packet. The response is longer and is received over multiple packets.
     */
    merged() {
        return this.run("merged frame", [
            ["merged", (b, show) => b
                    .getBatteryLevelPercent({ onDataReceived: (v) => show({ battery: v }) })
                    .getErgMachineType({ onDataReceived: (v) => show({ ergMachineType: v }) })
                    .getWorkoutDuration({ onDataReceived: (v) => show({ workoutDuration: v }) })
                    .getTotalAvgPower({ onDataReceived: (v) => show({ totalAvgPower: v }) })
                    .getStrokeRate({ onDataReceived: (v) => show({ strokeRate: v }) })
                    .getSerialNumber({ onDataReceived: (v) => show({ serial: v }) })]
        ]);
    }
    /** a request which is too big for bluetooth, should give a clear error on bluetooth and work on usb */
    tooBigForBluetooth() {
        return this.run("request bigger than 20 bytes (bluetooth should report an error)", [
            ["setDisplayString 32 chars", b => b.setDisplayString({ value: "12345678901234567890123456789012" })]
        ]);
    }
    setDateTime() {
        return this.run("set date/time", [
            ["setDateTime", b => b.setDateTime({ value: new Date() })],
            ["getDateTime", (b, show) => b.getDateTime({ onDataReceived: (d) => show(d.toString()) })]
        ]);
    }
    /** bluetooth: max 13 characters so the request fits in one packet */
    displayString(text) {
        if (this.isBluetooth && text.length > 13) {
            this.log(`setDisplayString: text cut to 13 characters for bluetooth`);
            text = text.substr(0, 13);
        }
        //the spec does not say when the text is shown, the csafe 'custom' screen is the most likely place
        return this.run("display string", [
            ["setDisplayString", b => b.setDisplayString({ value: text })],
            ["setScreenState csafe custom", b => b.setScreenState({ screenType: 3 /* ergometer.ScreenType.Csave */, value: 4 /* ergometer.ScreenValueCsafe.Custom */ })],
            ["getScreenStateStatus", (b, show) => b.getScreenStateStatus({ onDataReceived: show })]
        ]);
    }
    /** leave the custom screen */
    mainScreen() {
        return this.run("main screen", [
            ["setScreenState csafe main screen", b => b.setScreenState({ screenType: 3 /* ergometer.ScreenType.Csave */, value: 3 /* ergometer.ScreenValueCsafe.GoToMainScreen */ })]
        ]);
    }
    ledBacklight(enabled) {
        return this.run("led", [
            ["setLedBacklight " + (enabled ? "on" : "off"), b => b.setLedBacklight({ enabled: enabled, intensity: enabled ? 100 : 0 })]
        ]);
    }
    /**
     * Workout configuration with proprietary commands, works on bluetooth without authentication.
     * Same order as the spec example (Fixed Distance 2000m/500m splits). The spec sends all in one
     * 29 byte frame, which is too big for one bluetooth packet, so each command is sent separately.
     */
    proprietaryWorkout() {
        return this.run("proprietary workout 2000m, 500m splits", [
            ["setWorkoutType", b => b
                    .setWorkoutType({ value: 3 /* ergometer.WorkoutType.fixedDistanceSplits */ })],
            ["setWorkoutDuration", b => b
                    .setWorkoutDuration({ durationType: 128 /* ergometer.WorkoutDurationType.distance */, value: 2000 })],
            ["setSplitDuration", b => b
                    .setSplitDuration({ durationType: 128 /* ergometer.WorkoutDurationType.distance */, value: 500 })],
            ["setConfigureWorkout", b => b.setConfigureWorkout({ programmingMode: true })],
            ["setScreenState", b => b
                    .setScreenState({ screenType: 1 /* ergometer.ScreenType.Workout */, value: 1 /* ergometer.ScreenValue.PrepareToRowWorkout */ })],
            ["getWorkoutType", (b, show) => b.getWorkoutType({ onDataReceived: show })],
            ["getWorkoutDuration", (b, show) => b.getWorkoutDuration({ onDataReceived: show })]
        ]);
    }
}
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
    showInfo(info) {
        $("#info").text(info);
    }
    showData(data) {
        $("#data").text($("#data").text() + data);
        console.debug(data);
    }
    initialize() {
        this._performanceMonitor = new ergometer.PerformanceMonitorBle();
        //this.performanceMonitor.multiplex=true; //needed for some older android devices which limited device capablity. This must be set before ting
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
        if (!ergometer.ble.hasWebBlueTooth()) {
            $('#info').text("Your browser does not support web blue tooth or web blue tooth is not enabled.");
            $("#StartScan").hide();
        }
        //csafe command tests, shared with the web usb debug demo (see demos/shared/csafeTests.ts)
        this._tests = new CsafeTests(this.performanceMonitor, (text) => this.showCsafe(text), true);
        $("#testPublic").click(() => this._tests.publicCommands());
        $("#testMonitorInfo").click(() => this._tests.monitorInfo());
        $("#testWorkoutData").click(() => this._tests.workoutData());
        $("#testUsersHeartRate").click(() => this._tests.usersHeartRate());
        $("#testMerged").click(() => this._tests.merged());
        $("#testProprietaryWorkout").click(() => this._tests.proprietaryWorkout());
        $("#testSetDateTime").click(() => this._tests.setDateTime());
        $("#testDisplayString").click(() => this._tests.displayString(String($("#displayText").val())));
        $("#testMainScreen").click(() => this._tests.mainScreen());
        $("#testLedOn").click(() => this._tests.ledBacklight(true));
        $("#testLedOff").click(() => this._tests.ledBacklight(false));
        $("#testTooBig").click(() => this._tests.tooBigForBluetooth());
        $("#clearCsafe").click(() => $("#csafe").empty());
        $("#trace").change(() => {
            this.performanceMonitor.logLevel = $("#trace").is(":checked") ? ergometer.LogLevel.trace : ergometer.LogLevel.error;
        });
    }
    /** csafe test results, newest on top */
    showCsafe(text) {
        $("#csafe").prepend($("<div/>").text(text));
        console.debug(text);
    }
    onLog(info, logLevel) {
        if (this.performanceMonitor.logLevel == ergometer.LogLevel.trace)
            this.showCsafe(info);
        else
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
    constructor() {
        this.initialize();
    }
    startScan() {
        this.performanceMonitor.startScan((device) => {
            //in web blue tooth the device selection is done by the user
            //just return true to to accept the user selection
            return true;
        });
    }
    pageLoaded() {
    }
}
/**
 * Demo of Concept 2 ergometer Performance Monitor for Cordova
 *
 * This unit contains cordova specific code
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
/// <reference path="demo.ts"/>
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
//# sourceMappingURL=app.js.map