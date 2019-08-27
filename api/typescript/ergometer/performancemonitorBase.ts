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
namespace ergometer {
    
    
    import IRawCommand = ergometer.csafe.IRawCommand;
    
    export interface ErrorHandler {
        (e : any) : void;
    }
    export enum LogLevel {error,info,debug,trace}

    export interface LogEvent extends pubSub.ISubscription {
        (text : string,logLevel : LogLevel) : void;
    }
    class CSaveParseState {
        command =0;
        commandDataIndex =0;
        commandData : Uint8Array;
        frameState = FrameState.initial;
        nextDataLength = 0;
        detailCommand =0;
        skippByte = 0;
        calcCheck=0;
    }
    export interface ParsedCSafeCommand {
        command: number;
        detailCommand : number;
        data : Uint8Array;
    }
    const enum FrameState {initial,skippByte,parseCommand,parseCommandLength,
        parseDetailCommand,parseDetailCommandLength,parseCommandData}

    export enum MonitorConnectionState {inactive,deviceReady,scanning,connecting,connected,servicesFound,readyForCommunication}

    export interface ConnectionStateChangedEvent extends pubSub.ISubscription {
        (oldState : MonitorConnectionState,newState : MonitorConnectionState) : void;
    }

    export interface PowerCurveEvent extends pubSub.ISubscription {
        (data : number[]) : void;
    }
    type EmptyResolveFunc = ()=>void;
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
    export class PerformanceMonitorBase {
        
        private _logEvent= new pubSub.Event<LogEvent>();
        private _logLevel : LogLevel = LogLevel.error;
        private _csafeBuffer : csafe.IBuffer = null;
        private _waitResponseCommands : csafe.IRawCommand[] = [];
        protected _connectionState : MonitorConnectionState = MonitorConnectionState.inactive;
        protected _powerCurve : number[];
        
        protected _splitCommandsWhenToBig : boolean;

        protected _checkFrameEnding : boolean;

        //events
        private _connectionStateChangedEvent = new pubSub.Event<ConnectionStateChangedEvent>();      
        private _powerCurveEvent: pubSub.Event<PowerCurveEvent>;

        private _checksumCheckEnabled =false;

        public constructor() {
            
            this.initialize();
            
        }
        protected initialize() {
            
            this._powerCurveEvent = new pubSub.Event<PowerCurveEvent>();
            this._powerCurveEvent.registerChangedEvent(this.enableDisableNotification.bind(this));
            this._splitCommandsWhenToBig=false;
            this._checkFrameEnding=false;
        }

        protected enableDisableNotification() {

        }
        /**
         * returns error and other log information. Some errors can only be received using the logEvent
         * @returns {pubSub.Event<LogEvent>}
         */
        public get logEvent(): pubSub.Event<LogEvent> {
            return this._logEvent;
        }
        get powerCurveEvent():pubSub.Event<ergometer.PowerCurveEvent> {
            return this._powerCurveEvent;
        }
  
        
        get powerCurve():number[] {
            return this._powerCurve;
        }


        /**
         * Print debug info to console and application UI.
         * @param info
         */
        public traceInfo(info : string) {
            if (this.logLevel>=LogLevel.trace)
                this.logEvent.pub(info,LogLevel.trace);
        }

        /**
         *
         * @param info
         */
        public debugInfo(info : string) {
            if (this.logLevel>=LogLevel.debug)
                this.logEvent.pub(info,LogLevel.debug);
        }

        /**
         *
         * @param info
         */
        public showInfo(info : string) {
            if (this.logLevel>=LogLevel.info)
                this.logEvent.pub(info,LogLevel.info);
        }

        /**
         * call the global error hander and call the optional error handler if given
         * @param error
         */
        public handleError(error:string,errorFn? : ErrorHandler) {
            if (this.logLevel>=LogLevel.error)
                this.logEvent.pub(error,LogLevel.error);
            if (errorFn) errorFn(error);
        }
        

        /**
         * Get an error function which adds the errorDescription to the error ,cals the global and an optional local funcion
         * @param errorDescription
         * @param errorFn
         */
        public getErrorHandlerFunc(errorDescription : string, errorFn? :ErrorHandler) :ErrorHandler {

            return (e) => {
                this.handleError(errorDescription+':'+e.toString(),errorFn);
            }

        }

                /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @returns {LogLevel}
         */
        get logLevel():LogLevel {
            return this._logLevel;
        }


        /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @param value
         */
        set logLevel(value:LogLevel) {
            this._logLevel = value;
        }
        public disconnect() {

        }
        /**
         * read the current connection state
         * @returns {MonitorConnectionState}
         */
        public get connectionState():MonitorConnectionState {
            return this._connectionState;
        }

        protected connected() {

        }
        /**
         *
         * @param value
         */
        protected changeConnectionState(value : MonitorConnectionState) {
            if (this._connectionState!=value) {
                var oldValue=this._connectionState;
                this._connectionState=value;
                this.connectionStateChangedEvent.pub(oldValue,value);
                if (value==MonitorConnectionState.connected)
                  this.connected()
            }
        }

         /**
         * event which is called when the connection state is changed. For example this way you
         * can check if the device is disconnected.
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<ConnectionStateChangedEvent>}
         */
        public get connectionStateChangedEvent(): pubSub.Event<ConnectionStateChangedEvent> {
            return this._connectionStateChangedEvent;
        }

        /* ***************************************************************************************
         *                               csafe
         *****************************************************************************************  */

         protected removeOldSendCommands() {
            for (var i=this._waitResponseCommands.length-1;i>=0;i--) {
                var command : IRawCommand = this._waitResponseCommands[i];
                var currentTime= utils.getTime();
                //more than 20 seconds in the buffer
                if (currentTime-command._timestamp>20000 ) {
                    if (command.onError) {
                        command.onError("Nothing returned in 20 seconds");
                        this.handleError(`Nothing returned in 20 seconds from command ${command.command} ${command.detailCommand}`);
                    }
                    this._waitResponseCommands.splice(i,1);
                }
            }
        }

        protected driver_write( data:ArrayBufferView) :Promise<void> {
            return Promise.reject("not implemented");
        }

        /**
         *  send everyt thing which is put into the csave buffer
         *
         * @param success
         * @param error
         * @returns {Promise<void>|Promise} use promis instead of success and error function
         */
        public sendCSafeBuffer() : Promise<void>{
            this.removeOldSendCommands();
            //prepare the array to be send
            var rawCommandBuffer = this.csafeBuffer.rawCommands;
            var commandArray : number[] = [];
            rawCommandBuffer.forEach((command : IRawCommand)=>{

                commandArray.push(command.command);
                if (command.command>= csafe.defs.CTRL_CMD_SHORT_MIN)  {
                    //it is an short command
                    if (command.detailCommand|| command.data) {
                        throw "short commands can not contain data or a detail command"
                    }
                }
                else {
                    if (command.detailCommand) {
                        var dataLength=1;
                        if (command.data  && command.data.length>0)
                            dataLength=dataLength+command.data.length+1;
                        commandArray.push(dataLength); //length for the short command
                        //the detail command
                        commandArray.push(command.detailCommand);
                    }
                    //the data
                    if (command.data && command.data.length>0) {
                        commandArray.push(command.data.length);
                        commandArray=commandArray.concat(command.data);
                    }
                }

            });
            this.csafeBuffer.clear();
            //send all the csafe commands in one go
            return this.sendCsafeCommands(commandArray)
               .then(()=>{
                rawCommandBuffer.forEach((command : IRawCommand)=> {
                    command._timestamp = new Date().getTime();
                    if (command.waitForResponse)
                        this._waitResponseCommands.push(command);
                })
                },(e)=>{
                        rawCommandBuffer.forEach((command : IRawCommand)=>{
                        if (command.onError) command.onError(e);
                        })
                    }
               );
        }

        
        protected sendCsafeCommands(byteArray : number[]) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                //is there anything to send?
                if (byteArray && byteArray.length>0 ) {
                    //calc the checksum of the data to be send
                    var checksum =0;
                    for (let i=0;i<byteArray.length;i++) checksum=checksum ^ byteArray[i];
                    //prepare all the data to be send in one array
                    //begin with a start byte ad end with a checksum and an end byte
                    var bytesToSend : number[] =
                        ([csafe.defs.FRAME_START_BYTE].concat(byteArray)).concat([checksum,csafe.defs.FRAME_END_BYTE]);
                    if (this._splitCommandsWhenToBig && bytesToSend.length>this.getPacketSize())
                      reject(`Csafe commands with length ${bytesToSend.length} does not fit into buffer with size ${this.getPacketSize()} `)
                    else {
                        var sendBytesIndex=0;
                        //continue while not all bytes are send
                        while (sendBytesIndex<bytesToSend.length) {
                            //prepare a buffer with the data which can be send in one packet
                            var bufferLength = Math.min(this.getPacketSize(),bytesToSend.length-sendBytesIndex);
                            var buffer = new ArrayBuffer(bufferLength); //start and end and
                            var dataView = new DataView(buffer);
    
                            var bufferIndex = 0;
                            while (bufferIndex<bufferLength) {
                                dataView.setUint8(bufferIndex, bytesToSend[sendBytesIndex]);
                                sendBytesIndex++;
                                bufferIndex++;
                            }
                            this.traceInfo("send csafe: "+utils.typedArrayToHexString(buffer));
                            this.driver_write(dataView).then(
                                ()=>{
                                    this.traceInfo("csafe command send");
                                    if (sendBytesIndex>=bytesToSend.length) {
                                        //resolve when all data is received
                                       resolve();
                                    }
    
                                })
                            .catch( (e)=> { 
                                sendBytesIndex=bytesToSend.length;//stop the loop
                                reject(e);});;
                        }
                    }
                      //send in packages of max 20 bytes (ble.PACKET_SIZE)
                    

                }
                else resolve();
            })
        }


        protected receivedCSaveCommand(parsed : ParsedCSafeCommand) {

            //check on all the commands which where send and
            for(let i=0;i<this._waitResponseCommands.length;i++){
                let command=this._waitResponseCommands[i];
                if (command.command==parsed.command &&
                    ( command.detailCommand==parsed.detailCommand ||
                      (!command.detailCommand && !parsed.detailCommand) )
                   )  {
                    if (command.onDataReceived) {
                        var dataView= new DataView(parsed.data.buffer);
                        command.onDataReceived(dataView);
                    }
                    this._waitResponseCommands.splice(i,1);//remove the item from the send list
                    
                       
                    break;
                }

            }
        }
        
        private _csafeState =new CSaveParseState();
        protected resetStartCsafe() {
            this._csafeState.frameState=FrameState.initial;//only needed for usb
        }
        //because of the none blocking nature, the receive
        //function tries to match the send command with the received command
        //if they are not in the same order this routine tries to match them
        public handeReceivedDriverData(dataView : DataView) {
            //skipp empty 0 ble blocks
            if (dataView.byteLength!=1 || dataView.getUint8(0)!=0  ) {
                if ( this._csafeState.frameState == FrameState.initial)  {
                    this._csafeState.commandData = null;
                    this._csafeState.commandDataIndex=0;
                    this._csafeState.frameState = FrameState.initial;
                    this._csafeState.nextDataLength = 0;
                    this._csafeState.detailCommand =0;
                    this._csafeState.calcCheck=0;
                }
                this.traceInfo("continious receive csafe: "+utils.typedArrayToHexString(dataView.buffer));
                var i=0;
                var stop=false;

                while (i<dataView.byteLength &&!stop) {
                    var currentByte= dataView.getUint8(i);
                    if (this._csafeState.frameState!=FrameState.initial) {
                        this._csafeState.calcCheck=this._csafeState.calcCheck ^ currentByte; //xor for a simple crc check
                    }

                    switch(this._csafeState.frameState) {
                        case FrameState.initial : {
                            //expect a start frame
                            if (currentByte!=csafe.defs.FRAME_START_BYTE) {
                                stop=true ;
                                if (this.logLevel==LogLevel.trace)
                                    this.traceInfo("stop byte "+utils.toHexString(currentByte,1))
                            }
                            else this._csafeState.frameState=FrameState.skippByte;
                            this._csafeState.calcCheck=0;

                            break;
                        }
                        case FrameState.skippByte :
                        {   //skipp this one
                            this._csafeState.frameState= FrameState.parseCommand;
                            this._csafeState.skippByte=currentByte;
                            break;
                        }

                        case FrameState.parseCommand : {


                            this._csafeState.command=currentByte;
                            this._csafeState.frameState= FrameState.parseCommandLength;

                            break;
                        }
                        case FrameState.parseCommandLength : {
                            //first work arround strange results where the skipp byte is the same
                            //as the the command and the frame directly ends, What is the meaning of
                            //this? some kind of status??
                            if (this._csafeState.skippByte==this._csafeState.command && currentByte==csafe.defs.FRAME_END_BYTE) {
                                this._csafeState.command=0; //do not check checksum
                                this._csafeState.frameState=FrameState.initial; //start again from te beginning
                            }
                            else if (i==dataView.byteLength-1 && currentByte==csafe.defs.FRAME_END_BYTE ) {
                                var checksum=this._csafeState.command;
                                //remove the last 2 bytes from the checksum which was added too much
                                this._csafeState.calcCheck=this._csafeState.calcCheck ^ currentByte;
                                this._csafeState.calcCheck=this._csafeState.calcCheck ^ this._csafeState.command;
                                //check the calculated with the message checksum
                                
                                if (this._checksumCheckEnabled && checksum!=this._csafeState.calcCheck) 
                                  this.handleError(`Wrong checksum ${utils.toHexString(checksum,1)} expected ${utils.toHexString(this._csafeState.calcCheck,1) } `);
                                this._csafeState.command=0; //do not check checksum
                                this._csafeState.frameState=FrameState.initial; //start again from te beginning
                            }
                            else if (i<dataView.byteLength) {
                                this._csafeState.nextDataLength= currentByte;
                                if (this._csafeState.command>= csafe.defs.CTRL_CMD_SHORT_MIN) {
                                    this._csafeState.frameState= FrameState.parseCommandData;
                                }
                                else this._csafeState.frameState= FrameState.parseDetailCommand;

                            }
                            break;
                        }
                        case FrameState.parseDetailCommand : {
                            this._csafeState.detailCommand=  currentByte;
                            this._csafeState.frameState= FrameState.parseDetailCommandLength;

                            break;
                        }
                        case FrameState.parseDetailCommandLength : {
                            this._csafeState.nextDataLength=currentByte;
                            this._csafeState.frameState= FrameState.parseCommandData;
                            break;
                        }
                        case FrameState.parseCommandData : {
                            if (!this._csafeState.commandData) {
                                this._csafeState.commandDataIndex=0;
                                this._csafeState.commandData = new Uint8Array(this._csafeState.nextDataLength);
                            }
                            this._csafeState.commandData[this._csafeState.commandDataIndex]=currentByte;
                            this._csafeState.nextDataLength--;
                            this._csafeState.commandDataIndex++;
                            if (this._csafeState.nextDataLength==0) {
                                this._csafeState.frameState= FrameState.parseCommand;
                                try {
                                    this.receivedCSaveCommand({
                                        command:this._csafeState.command,
                                        detailCommand:this._csafeState.detailCommand,
                                        data:this._csafeState.commandData});
                                }
                                catch (e) {
                                    this.handleError(e); //never let the receive crash the main loop
                                }

                                this._csafeState.commandData=null;
                                this._csafeState.detailCommand=0;
                               
                            }
                            break;
                        }

                    }
                    if (this.logLevel==LogLevel.trace)
                        this.traceInfo(`parse: ${i}: ${utils.toHexString(currentByte,1)} state: ${this._csafeState.frameState} checksum:${utils.toHexString(this._csafeState.calcCheck,1)} `);
                    i++;
                }
                //when something went wrong, the bluetooth block is endend but the frame not
                if (this._checkFrameEnding && dataView.byteLength!=this.getPacketSize() && this._csafeState.frameState!=FrameState.initial) {
                    this._csafeState.frameState=FrameState.initial;
                    this.handleError("wrong csafe frame ending.");
                }

            }
        }
        protected getPacketSize() : number {
            throw "getPacketSize not implemented"
        }

        get csafeBuffer():ergometer.csafe.IBuffer {
            //init the buffer when needed
            if (!this._csafeBuffer) {
                this._csafeBuffer = <any> {
                    commands: [],
                    clear: ():csafe.IBuffer=> {
                        this.csafeBuffer.rawCommands = [];
                        return this.csafeBuffer;
                    },
                    send: (sucess? : ()=>void,error? : ErrorHandler) : Promise<void> => {
                        return this.sendCSafeBuffer().then(sucess,error);
                    },
                    addRawCommand: (info:csafe.IRawCommand):csafe.IBuffer=> {
                        this.csafeBuffer.rawCommands.push(info);
                        return this.csafeBuffer;
                    }

                };
                csafe.commandManager.apply(this.csafeBuffer, this);
            }
            return this._csafeBuffer;
        }

    }

}