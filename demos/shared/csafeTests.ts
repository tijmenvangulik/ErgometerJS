/**
 * Csafe command tests which are shared by the web usb debug and web bluetooth demos.
 *
 * Each command is sent in its own buffer so one failing command does not hide the others.
 *
 * Bluetooth: one csafe request must fit in one 20 byte packet (ble.PACKET_SIZE),
 * frame start, checksum, end and the wrapper bytes included. Responses may span more packets.
 * All tests below are small enough for bluetooth, except the ones marked usbOnly.
 */
type CsafeTestBuild = (buffer : ergometer.csafe.IBuffer, show : (value : any)=>void)=>ergometer.csafe.IBuffer;
type CsafeTest = [string, CsafeTestBuild];

class CsafeTests {

    constructor(private monitor : ergometer.PerformanceMonitorBase,
                private log : (text : string)=>void,
                private isBluetooth : boolean) {
        //the monitor locks again after a reconnect
        monitor.connectionStateChangedEvent.sub(this,()=>{ this.authenticated=false; });
    }

    /** true after the monitor accepted the password, reset when the connection changes */
    public authenticated=false;

    /**
     * Authenticate with the csafe buffer commands, the same way an app does it:
     * read the hardware address, then send it together with the 8 byte password.
     * The monitor answers 1 when the password is accepted (C2 Host Authentication Definition).
     * Over bluetooth the request is 19 bytes, it fits in one 20 byte packet unless byte stuffing makes it longer.
     */
    public async authenticate(passwordHex : string) {
        const password : number[]=[];
        for (let i=0;i<passwordHex.length;i+=2) password.push(parseInt(passwordHex.substr(i,2),16));
        if (password.length!=8 || password.some(isNaN)) {
            this.log("authenticate: the password must be 16 hex characters");
            return;
        }
        try {
            let hwAddress : number[]=null;
            await this.monitor.newCsafeBuffer()
                .getHardwareAddress({onDataReceived:(value : number[])=>hwAddress=value})
                .send();
            if (!hwAddress) {
                this.log("authenticate: could not read the hardware address");
                return;
            }
            let result : number=null;
            await this.monitor.newCsafeBuffer()
                .setAuthenticationPassword({hwAddress:hwAddress.slice(0,4),password:password,onDataReceived:(value : number)=>result=value})
                .send();
            this.authenticated=(result===1);
            this.log(`authenticate: ${this.authenticated?"success":"rejected by the monitor, result="+result}`);
        }
        catch (e) {
            this.log(`authenticate: ERROR ${e}`);
        }
    }

    public async run(title : string, tests : CsafeTest[]) {
        if (this.monitor.connectionState!=ergometer.MonitorConnectionState.readyForCommunication) {
            this.log(`${title}: not connected`);
            return;
        }
        this.log(`===== ${title} =====`);
        if (!this.isBluetooth && !this.authenticated)
            this.log("not authenticated: over usb most proprietary commands (0x7E/0x7F) are answered without data");
        for (const [name,build] of tests) {
            let received=false;
            const show=(value : any)=>{
                received=true;
                this.log(`${name}: ${typeof value=="object"?JSON.stringify(value):value}`);
            };
            try {
                const buffer=this.monitor.newCsafeBuffer();
                build(buffer,show);
                //report errors of the individual command
                buffer.rawCommands.forEach(c=>c.onError=(e)=>this.log(`${name}: ERROR ${e}`));
                await buffer.send();
                const waits=buffer.rawCommands.some(c=>c.waitForResponse);
                if (waits && !received) this.log(`${name}: no data received`);
                else if (!waits) this.log(`${name}: send`);
            }
            catch (e) {
                this.log(`${name}: ERROR ${e}`);
            }
        }
        this.log(`===== ${title} done =====`);
    }

    public publicCommands() {
        return this.run("public commands",[
            ["getStatus", (b,show)=>b.getStatus({onDataReceived:show})],
            ["getVersion", (b,show)=>b.getVersion({onDataReceived:show})],
            ["getSerialNumber", (b,show)=>b.getSerialNumber({onDataReceived:show})],
            ["getUserId", (b,show)=>b.getUserId({onDataReceived:show})],
            ["getUnits", (b,show)=>b.getUnits({onDataReceived:show})],
            ["getOdometer", (b,show)=>b.getOdometer({onDataReceived:show})],
            ["getErrorCode", (b,show)=>b.getErrorCode({onDataReceived:show})],
            ["getProgram", (b,show)=>b.getProgram({onDataReceived:show})],
            ["getUserInfo", (b,show)=>b.getUserInfo({onDataReceived:show})],
            ["getWork", (b,show)=>b.getWork({onDataReceived:show})],
            ["getHorizontal", (b,show)=>b.getHorizontal({onDataReceived:show})],
            ["getCalories", (b,show)=>b.getCalories({onDataReceived:show})],
            ["getPace", (b,show)=>b.getPace({onDataReceived:show})],
            ["getCadence", (b,show)=>b.getCadence({onDataReceived:show})],
            ["getPower", (b,show)=>b.getPower({onDataReceived:show})],
            ["getHeartRate", (b,show)=>b.getHeartRate({onDataReceived:show})],
            ["getStatus after", (b,show)=>b.getStatus({onDataReceived:show})]
        ]);
    }

    public monitorInfo() {
        return this.run("monitor info",[
            ["getFirmwareVersion", (b,show)=>b.getFirmwareVersion({onDataReceived:show})],
            ["getHardwareVersion", (b,show)=>b.getHardwareVersion({onDataReceived:show})],
            ["getHardwareAddress", (b,show)=>b.getHardwareAddress({onDataReceived:show})],
            ["getDateTime", (b,show)=>b.getDateTime({onDataReceived:(d)=>show(d.toString())})],
            ["getBatteryLevelPercent", (b,show)=>b.getBatteryLevelPercent({onDataReceived:show})],
            ["getErgMachineType", (b,show)=>b.getErgMachineType({onDataReceived:show})],
            ["getOperationalState", (b,show)=>b.getOperationalState({onDataReceived:show})],
            ["getRowingState", (b,show)=>b.getRowingState({onDataReceived:show})],
            ["getFlywheelSpeed", (b,show)=>b.getFlywheelSpeed({onDataReceived:show})],
            ["getLanguageType", (b,show)=>b.getLanguageType({onDataReceived:show})],
            ["getDisplayType", (b,show)=>b.getDisplayType({onDataReceived:show})],
            ["getDisplayUnits", (b,show)=>b.getDisplayUnits({onDataReceived:show})],
            ["getScreenStateStatus", (b,show)=>b.getScreenStateStatus({onDataReceived:show})],
            ["getUIEvents", (b,show)=>b.getUIEvents({onDataReceived:show})],
            ["getWorkoutType", (b,show)=>b.getWorkoutType({onDataReceived:show})],
            ["getWorkoutState", (b,show)=>b.getWorkoutState({onDataReceived:show})],
            ["getWorkoutDuration", (b,show)=>b.getWorkoutDuration({onDataReceived:show})],
            ["getWorkOther", (b,show)=>b.getWorkOther({onDataReceived:show})],
            ["getTargetPaceTime", (b,show)=>b.getTargetPaceTime({onDataReceived:show})]
        ]);
    }

    public workoutData() {
        return this.run("workout data (row a bit first)",[
            ["getWorkTime", (b,show)=>b.getWorkTime({onDataReceived:show})],
            ["getWorkDistance", (b,show)=>b.getWorkDistance({onDataReceived:show})],
            ["getProjectedWorkTime", (b,show)=>b.getProjectedWorkTime({onDataReceived:show})],
            ["getProjectedWorkDistance", (b,show)=>b.getProjectedWorkDistance({onDataReceived:show})],
            ["getTotalWorkDistance", (b,show)=>b.getTotalWorkDistance({onDataReceived:show})],
            ["getTotalRestTime", (b,show)=>b.getTotalRestTime({onDataReceived:show})],
            ["getRestDistance", (b,show)=>b.getRestDistance({onDataReceived:show})],
            ["getTotalRestDistance", (b,show)=>b.getTotalRestDistance({onDataReceived:show})],
            ["getLastRestDistance", (b,show)=>b.getLastRestDistance({onDataReceived:show})],
            ["getStroke500mPace", (b,show)=>b.getStroke500mPace({onDataReceived:show})],
            ["getStrokePower", (b,show)=>b.getStrokePower({onDataReceived:show})],
            ["getStrokeCaloricBurnRate", (b,show)=>b.getStrokeCaloricBurnRate({onDataReceived:show})],
            ["getStrokeRate", (b,show)=>b.getStrokeRate({onDataReceived:show})],
            ["getStrokeRateState", (b,show)=>b.getStrokeRateState({onDataReceived:show})],
            ["getDragFactor", (b,show)=>b.getDragFactor({onDataReceived:show})],
            ["getSplitTime", (b,show)=>b.getSplitTime({onDataReceived:show})],
            ["getLastSplitTime", (b,show)=>b.getLastSplitTime({onDataReceived:show})],
            ["getSplitDistance", (b,show)=>b.getSplitDistance({onDataReceived:show})],
            ["getLastSplitDistance", (b,show)=>b.getLastSplitDistance({onDataReceived:show})],
            ["getSplitAvg500mPace", (b,show)=>b.getSplitAvg500mPace({onDataReceived:show})],
            ["getSplitAvgPower", (b,show)=>b.getSplitAvgPower({onDataReceived:show})],
            ["getSplitAvgCaloricBurnRate", (b,show)=>b.getSplitAvgCaloricBurnRate({onDataReceived:show})],
            ["getSplitAvgCalories", (b,show)=>b.getSplitAvgCalories({onDataReceived:show})],
            ["getSplitAvgStrokeRate", (b,show)=>b.getSplitAvgStrokeRate({onDataReceived:show})],
            ["getTotalAvg500mPace", (b,show)=>b.getTotalAvg500mPace({onDataReceived:show})],
            ["getTotalAvgPower", (b,show)=>b.getTotalAvgPower({onDataReceived:show})],
            ["getTotalAvgCaloricBurnRate", (b,show)=>b.getTotalAvgCaloricBurnRate({onDataReceived:show})],
            ["getTotalAvgCalories", (b,show)=>b.getTotalAvgCalories({onDataReceived:show})],
            ["getTotalAvgStrokeRate", (b,show)=>b.getTotalAvgStrokeRate({onDataReceived:show})]
        ]);
    }

    public usersHeartRate() {
        return this.run("users / heart rate / games",[
            ["getHeartRateMonitor", (b,show)=>b.getHeartRateMonitor({onDataReceived:show})],
            ["getExtendedHeartRateMonitor", (b,show)=>b.getExtendedHeartRateMonitor({onDataReceived:show})],
            ["getHeartRateState", (b,show)=>b.getHeartRateState({onDataReceived:show})],
            ["getAvgHeartRate", (b,show)=>b.getAvgHeartRate({onDataReceived:show})],
            ["getEndingAvgHeartRate", (b,show)=>b.getEndingAvgHeartRate({onDataReceived:show})],
            ["getRestAvgHeartRate", (b,show)=>b.getRestAvgHeartRate({onDataReceived:show})],
            ["getHeartbeatData", (b,show)=>b.getHeartbeatData({onDataReceived:show})],
            ["getUserIdString user 0", (b,show)=>b.getUserIdString({userNumber:0,onDataReceived:show})],
            ["getUserIdNumber user 0", (b,show)=>b.getUserIdNumber({userNumber:0,onDataReceived:show})],
            ["getUserProfile user 0", (b,show)=>b.getUserProfile({userNumber:0,onDataReceived:show})],
            ["getGameScore", (b,show)=>b.getGameScore({onDataReceived:show})]
        ]);
    }

    /**
     * Several commands in one buffer: tests merging commands into one wrapper and the response parsing.
     * The request is 13 bytes (F1 7E 03 97 ED E8 7F 02 B0 B3 94 chk F2) so it also fits in one
     * bluetooth packet. The response is longer and is received over multiple packets.
     */
    public merged() {
        return this.run("merged frame",[
            ["merged", (b,show)=>b
                .getBatteryLevelPercent({onDataReceived:(v)=>show({battery:v})})
                .getErgMachineType({onDataReceived:(v)=>show({ergMachineType:v})})
                .getWorkoutDuration({onDataReceived:(v)=>show({workoutDuration:v})})
                .getTotalAvgPower({onDataReceived:(v)=>show({totalAvgPower:v})})
                .getStrokeRate({onDataReceived:(v)=>show({strokeRate:v})})
                .getSerialNumber({onDataReceived:(v)=>show({serial:v})})]
        ]);
    }

    /** a request which is too big for bluetooth, should give a clear error on bluetooth and work on usb */
    public tooBigForBluetooth() {
        return this.run("request bigger than 20 bytes (bluetooth should report an error)",[
            ["setDisplayString 32 chars", b=>b.setDisplayString({value:"12345678901234567890123456789012"})]
        ]);
    }

    public setDateTime() {
        return this.run("set date/time",[
            ["setDateTime", b=>b.setDateTime({value:new Date()})],
            ["getDateTime", (b,show)=>b.getDateTime({onDataReceived:(d)=>show(d.toString())})]
        ]);
    }

    /** bluetooth: max 13 characters so the request fits in one packet */
    public displayString(text : string) {
        if (this.isBluetooth && text.length>13) {
            this.log(`setDisplayString: text cut to 13 characters for bluetooth`);
            text=text.substr(0,13);
        }
        //the spec does not say when the text is shown, the csafe 'custom' screen is the most likely place
        return this.run("display string",[
            ["setDisplayString", b=>b.setDisplayString({value:text})],
            ["setScreenState csafe custom", b=>b.setScreenState({screenType:ergometer.ScreenType.Csave,value:ergometer.ScreenValueCsafe.Custom})],
            ["getScreenStateStatus", (b,show)=>b.getScreenStateStatus({onDataReceived:show})]
        ]);
    }

    /** leave the custom screen */
    public mainScreen() {
        return this.run("main screen",[
            ["setScreenState csafe main screen", b=>b.setScreenState({screenType:ergometer.ScreenType.Csave,value:ergometer.ScreenValueCsafe.GoToMainScreen})]
        ]);
    }

    public ledBacklight(enabled : boolean) {
        return this.run("led",[
            ["setLedBacklight "+(enabled?"on":"off"), b=>b.setLedBacklight({enabled:enabled,intensity:enabled?100:0})]
        ]);
    }

    /**
     * Workout configuration with proprietary commands, works on bluetooth without authentication.
     * Same order as the spec example (Fixed Distance 2000m/500m splits). The spec sends all in one
     * 29 byte frame, which is too big for one bluetooth packet, so each command is sent separately.
     */
    public proprietaryWorkout() {
        return this.run("proprietary workout 2000m, 500m splits",[
            ["setWorkoutType", b=>b
                .setWorkoutType({value:ergometer.WorkoutType.fixedDistanceSplits})],
            ["setWorkoutDuration", b=>b
                .setWorkoutDuration({durationType:ergometer.WorkoutDurationType.distance,value:2000})],
            ["setSplitDuration", b=>b
                .setSplitDuration({durationType:ergometer.WorkoutDurationType.distance,value:500})],
            ["setConfigureWorkout", b=>b.setConfigureWorkout({programmingMode:true})],
            ["setScreenState", b=>b
                .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})],
            ["getWorkoutType", (b,show)=>b.getWorkoutType({onDataReceived:show})],
            ["getWorkoutDuration", (b,show)=>b.getWorkoutDuration({onDataReceived:show})]
        ]);
    }
}
