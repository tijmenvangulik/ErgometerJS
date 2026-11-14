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

    private _performanceMonitor : ergometer.PerformanceMonitorUsb;
    public get performanceMonitor(): ergometer.PerformanceMonitorUsb {
        return this._performanceMonitor;
    }

    /**
     * Print debug info to console and application UI.
     */
    public showInfo(info : string)
    {
        this.addText("data",info);
    }

    
    public addText(id : string, text : string) {
        var ctrl=$("#"+id);
        var txtCtrl=$("<p/>");
        txtCtrl.text(text);
        ctrl.prepend(txtCtrl);
    }
    

    public showData(data : string)
    {
        this.addText("data",data);
    }
    protected initialize() {
        this._performanceMonitor= new ergometer.PerformanceMonitorUsb();
//        this.performanceMonitor.logLevel=ergometer.LogLevel.trace; //by default it is error, for more debug info  change the level
        this.performanceMonitor.logEvent.sub(this,this.onLog);
        this.performanceMonitor.connectionStateChangedEvent.sub(this,this.onConnectionStateChanged);
        //connect to the rowing
        this.performanceMonitor.strokeStateEvent.sub(this,(oldState : ergometer.StrokeState,newState : ergometer.StrokeState)=>{
            this.showInfo("New state:"+newState.toString());
        })
        this.performanceMonitor.trainingDataEvent.sub(this,(data :ergometer.TrainingData)=>{
            this.showInfo("training data :"+JSON.stringify(data,null,"  "));
        });
        this.performanceMonitor.strokeDataEvent.sub(this,(data: ergometer.StrokeData)=>{
            this.showInfo("stroke data:"+JSON.stringify(data,null,"  "));
        });
        this.performanceMonitor.powerCurveEvent.sub(this,(data : number[])=>{
            this.showInfo("power curve data:"+JSON.stringify(data,null,"  "));
        })
        $("#StartScan").click(()=>{
            this.connectToDevice()
        });
        $("#getinfo").click(this.csafeTest.bind(this));
        if (!ergometer.PerformanceMonitorUsb.canUseUsb()) {
            $('#info').text("Your browser does not support web blue tooth or web blue tooth is not enabled.")
            $("#StartScan").hide();
        }
        $("#testWorkout").click(this.testWorkout.bind(this));

        this._tests=new CsafeTests(this.performanceMonitor,(text)=>this.showData(text),false);
        $("#authenticate").click(this.authenticate.bind(this));
        $("#testPublic").click(()=>this._tests.publicCommands());
        $("#testMonitorInfo").click(()=>this._tests.monitorInfo());
        $("#testWorkoutData").click(()=>this._tests.workoutData());
        $("#testUsersHeartRate").click(()=>this._tests.usersHeartRate());
        $("#testMerged").click(()=>this._tests.merged());
        $("#testProprietaryWorkout").click(()=>this._tests.proprietaryWorkout());
        $("#testSetDateTime").click(()=>this._tests.setDateTime());
        $("#testDisplayString").click(()=>this._tests.displayString(String($("#displayText").val())));
        $("#testMainScreen").click(()=>this._tests.mainScreen());
        $("#testLedOn").click(()=>this._tests.ledBacklight(true));
        $("#testLedOff").click(()=>this._tests.ledBacklight(false));
        $("#clearLog").click(()=>$("#data").empty());
        $("#trace").change(()=>{
            this.performanceMonitor.logLevel=$("#trace").is(":checked")?ergometer.LogLevel.trace:ergometer.LogLevel.error;
        });
    }

    //csafe command tests, shared with the web bluetooth demo (see demos/shared/csafeTests.ts)
    private _tests : CsafeTests;

    public authenticate() {
        const password=String($("#authPassword").val()||"").trim();
        this.performanceMonitor.authenticate(password)
            .then((ok)=>this.showData(`authenticate: ${ok?"success":"failed"}`))
            .catch((e)=>this.showData(`authenticate: ERROR ${e}`));
    }

    public onLog(info : string,logLevel : ergometer.LogLevel)
    {   this.showData(info);
    }

    
    public csafeTest() {
        this.performanceMonitor.newCsafeBuffer()
        .getStrokeState({
            onDataReceived: (strokeState : ergometer.StrokeState) =>{
                this.showData(`stroke state: ${strokeState}`);
            }
        })
        .getVersion({
            onDataReceived: (version : ergometer.csafe.IVersion)=> {
                this.showData(`Version hardware ${version.HardwareVersion} software:${version.FirmwareVersion}`);
            }
        })
        .setProgram({value:ergometer.Program.StandardList1})
        .send()
        .then(()=>{  //send returns a promise
            console.log("send done, you can send th next")
        }   ).catch(e=>{
            console.log("Error on top level:"+e)
        });
    }
    async testWorkout() {
        //set a distance
       
        await this.performanceMonitor.newCsafeBuffer()
        .setDistance({value:3000,unit:ergometer.Unit.distanceMeter})
        .setProgram({value:ergometer.Program.Programmed})
        .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})
        .send();

     //set a fixed time
     //20:00/4:00 splits, power goal of 100 watts
/*
     await this.performanceMonitor.newCsafeBuffer()
         .setWork({hour:0,minute:20,second:0})
         .setProgram({value:ergometer.Program.Programmed})
         .send();
     await this.performanceMonitor.newCsafeBuffer()
         .setSplitDuration({value:400,durationType:ergometer.WorkoutDurationType.distance})
         .send();
     await this.performanceMonitor.newCsafeBuffer()
         .setPower({value:100,unit:ergometer.Unit.powerWatts})
         .setProgram({value:ergometer.Program.Programmed})
         .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})
         .send();
*/

/*
     //JustRow
     await this.performanceMonitor.newCsafeBuffer()
        .setWorkoutType({value: ergometer.WorkoutType.justRowSplits})
        .setScreenState({screenType:ergometer.ScreenType.Workout,value:ergometer.ScreenValue.PrepareToRowWorkout})
        .send();
*/

      
   }
    protected onConnectionStateChanged(oldState : ergometer.MonitorConnectionState, newState : ergometer.MonitorConnectionState) {

        if (newState==ergometer.MonitorConnectionState.readyForCommunication) {
            //this.performanceMonitor.sampleRate=SampleRate.rate250ms;
            this.showData(JSON.stringify( this._performanceMonitor.device));

            //send two commands and show the results in a jquery way

            this.csafeTest();
            
        }
    }
    


    constructor() {
        this.initialize();


    }

    public connectToDevice() {
        this.performanceMonitor.requestDevics().then((devices)=>{
          if (devices.length>0) 
            this.performanceMonitor.connectToDevice(devices[0]);
        })
  
    }
    public pageLoaded() {

    }
}
