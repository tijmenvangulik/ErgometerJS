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

 //to fix the problem that the base is not yet declared (not a problem during the actual build)
/// <reference path="monitorBase.ts"/>

namespace ergometer {
    
    
    import IRawCommand = ergometer.csafe.IRawCommand;
    
    
    export interface SendBufferQueued {
        commandArray: number[],
        resolve : ()=>void, 
        reject : (e)=>void,
        rawCommandBuffer: IRawCommand[]
    }
    export interface ParsedCSafeCommand {
        command: number;
        detailCommand : number;
        data : Uint8Array;
    }
    export const enum FrameState {initial,statusByte,parseCommand,parseCommandLength,
        parseDetailCommand,parseDetailCommandLength,parseCommandData}

    

    export interface PowerCurveEvent extends pubSub.ISubscription {
        (data : number[]) : void;
    }
    export class WaitResponseBuffer implements  ergometer.csafe.IResponseBuffer {
        
        //variables for parsing the csafe buffer
        //needs to be in the buffer because the parsing can be split
        //over multiple messages
        public command =0;
        public commandDataIndex =0;
        public commandData : Uint8Array;
        public frameState = FrameState.initial;
        public nextDataLength = 0;
        public detailCommand =0;
        public statusByte = 0;
        public monitorStatus : ergometer.csafe.SlaveState = 0;
        public prevFrameState : ergometer.csafe.PrevFrameState =0;
        public calcCheck=0;
        
        private _monitor : PerformanceMonitorBase;

        //commands where we are waiting for
        private _commands : csafe.IRawCommand[] = [];

        public _resolve : ()=>void;// only for internal use
        /** @internal */
        public _reject : (e : any)=>void;// only for internal use 

        public _responseState: number;
        private _timeOutHandle: number;
        stuffByteActive: boolean = false;
        endCommand: number;

        public get commands() : csafe.IRawCommand[]   {
            return this._commands
        }
        removeRemainingCommands() {
            this._commands.forEach(command=>{
                if (this._monitor.logLevel>=LogLevel.error)
                   this._monitor.handleError(`command removed without result command=${command.command} detial= ${command.detailCommand}`);
                if (command.onError) command.onError("command removed without result");

            });
            this._commands=[];
        }
        private timeOut() {
            this.removeRemainingCommands();
            this.remove();
            if (this._reject)
               this._reject("Time out buffer");
            if (this._monitor.logLevel>=LogLevel.error)
                  this._monitor.handleError("buffer time out");
        }
        constructor (monitor : PerformanceMonitorBase,
              resolve : ()=>void, reject : (e)=>void,
              commands : csafe.IRawCommand[],
              timeOut : number) {          
            this._monitor = monitor;
            this._resolve=resolve;
            this._reject=reject;
            this._timeOutHandle= setTimeout(this.timeOut.bind(this),timeOut);
            commands.forEach((command : IRawCommand)=> {
                
                if (command.waitForResponse)
                    this._commands.push(command);
            });
        }
        
        public remove() {
            if (this._timeOutHandle) {
                clearTimeout(this._timeOutHandle);
                this._timeOutHandle=null;
            }
            this._monitor.removeResponseBuffer(this);  
        }
        public processedBuffer() {
            this.removeRemainingCommands();
            this.remove();
            if (this._resolve)
               this._resolve();
            
        }
        public removedWithError(e : any) {
            this._commands.forEach((command : IRawCommand)=>{
                if (command.onError) command.onError(e);
            });
            if (this._reject)
               this._reject(e);
        }
        public receivedCSaveCommand(parsed : ParsedCSafeCommand) {
            if (this._monitor.logLevel==LogLevel.trace)
              this._monitor.traceInfo("received command:"+JSON.stringify(parsed));
            //check on all the commands which where send and
            for(let i=0;i<this._commands.length;i++){
                let command=this._commands[i];
                if (command.command==parsed.command &&
                    ( command.detailCommand==parsed.detailCommand ||
                      (!command.detailCommand && !parsed.detailCommand) )
                    )  {
                    if (command.onDataReceived) {
                        var dataView= new DataView(parsed.data.buffer);
                        this._monitor.traceInfo("call received");
                        command.responseBuffer=this;
                        command.onDataReceived(dataView);
                    }
                    
                    this._commands.splice(i,1);//remove the item from the send list
                    break;
                }

            }
        }
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
    export class PerformanceMonitorBase extends MonitorBase {
 
        private _waitResonseBuffers : WaitResponseBuffer[] = [];
        
        
        protected _powerCurve : number[];
        
        protected _splitCommandsWhenToBig : boolean;

        protected _receivePartialBuffers : boolean;

        //events
           
        private _powerCurveEvent: pubSub.Event<PowerCurveEvent>;

        private _checksumCheckEnabled =false;
        protected _commandTimeout: number;
        
        public sortCommands : boolean = false;
        private _sendBufferQueue: SendBufferQueued[]=[];

        protected initialize() {
            
            this._powerCurveEvent = new pubSub.Event<PowerCurveEvent>();
            this._powerCurveEvent.registerChangedEvent(this.enableDisableNotification.bind(this));
            this._splitCommandsWhenToBig=false;
            this._receivePartialBuffers=false;
            this._commandTimeout=1000;
        }
        removeResponseBuffer(buffer: WaitResponseBuffer) {
            var i= this._waitResonseBuffers.indexOf(buffer);
            if (i>=0)  this._waitResonseBuffers.splice(i,1);
        }
        protected enableDisableNotification() : Promise<void> {
            return Promise.resolve()
        }
        /**
         * returns error and other log information. Some errors can only be received using the logEvent
         * @returns {pubSub.Event<LogEvent>}
         */
        
        get powerCurveEvent():pubSub.Event<ergometer.PowerCurveEvent> {
            return this._powerCurveEvent;
        }
  
        
        get powerCurve():number[] {
            return this._powerCurve;
        }

        protected clearAllBuffers() {
            this.clearWaitResponseBuffers();
            this._sendBufferQueue=[];
        }
        protected beforeConnected() {
            this.clearAllBuffers();
        }

        
        /* ***************************************************************************************
         *                               csafe
         *****************************************************************************************  */
        
         protected clearWaitResponseBuffers() {
            var list=this._waitResonseBuffers;
            list.forEach(b=>b.remove());
            this._waitResonseBuffers=[];
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
        public sendCSafeBuffer(csafeBuffer : ergometer.csafe.IBuffer) : Promise<void>{
             
            return new Promise((resolve,reject)=>{
                //prepare the array to be send
                var rawCommandBuffer = csafeBuffer.rawCommands;
                var commandArray : number[] = [];
                var prevCommand=-1;
                var prevCommandIndex=-1;
                if (this.sortCommands)
                   rawCommandBuffer.sort((first,next)=>{return first.command-next.command;});
               
                rawCommandBuffer.forEach((command : IRawCommand)=>{
                    var commandMerged=false;
                    
                    var commandIndex=commandArray.length;
                    if (command.command>= csafe.defs.CTRL_CMD_SHORT_MIN)  {
                        commandArray.push(command.command);
                        //it is an short command
                        if (command.detailCommand|| command.data) {
                            throw "short commands can not contain data or a detail command"
                        }
                    }
                    else {
                        if (command.detailCommand) {
                            if (prevCommand===command.command) {
                                //add it to the last command if it is the same command
                                //this is more efficent
                                var dataLength=1;
                                if (command.data  && command.data.length>0)
                                    dataLength+=command.data.length;
                                commandArray[prevCommandIndex+1]+=dataLength;
                                commandMerged=true;
                            }
                            else {
                                commandArray.push(command.command);
                                var dataLength=1;
                                if (command.data  && command.data.length>0)
                                    dataLength+=command.data.length+1;
                                commandArray.push(dataLength);
                            }
                             //length for the short command
                            //the detail command
                            commandArray.push(command.detailCommand);
                        }
                        else commandArray.push(command.command);
                        //the data
                        if (command.data && command.data.length>0) {
                            commandArray.push(command.data.length);
                            commandArray=commandArray.concat(command.data);
                        }
                    }
                    if (!commandMerged) {
                        prevCommand=command.command;
                        prevCommandIndex=commandIndex;
                    }
                    
                });

                this._sendBufferQueue.push({
                    commandArray: commandArray,
                    resolve: resolve,
                    reject: reject,
                    rawCommandBuffer: rawCommandBuffer
                });
                this.checkSendBuffer();
                //send all the csafe commands in one go
                
            })
            
        }

        protected checkSendBufferAtEnd() {
            if (this._sendBufferQueue.length>0)
              setTimeout(this.checkSendBuffer.bind(this),0);
        }
        protected checkSendBuffer() {
            //make sure that only one buffer is send/received at a time
            //when something to send and all received then send the next
            if (this._waitResonseBuffers.length==0 && this._sendBufferQueue.length>0) {
                //directly add a wait buffer so no others can send commands
                
                //extract the send data 
                var sendData : SendBufferQueued=this._sendBufferQueue.shift();
                this.sendBufferFromQueue(sendData);
            }
            
        }
        protected sendBufferFromQueue(sendData : SendBufferQueued) {
            var resolve=()=>{
                if (sendData.resolve) sendData.resolve();
                this.checkSendBufferAtEnd();
              }
              var reject=(err)=>{ 
                if (sendData.reject) sendData.reject(err);
                this.checkSendBufferAtEnd();
              }

            var waitBuffer=new WaitResponseBuffer(this,resolve,reject,sendData.rawCommandBuffer,this._commandTimeout);
            this._waitResonseBuffers.push(waitBuffer);                
            //then send the data
                         
            this.sendCsafeCommands(sendData.commandArray)
            .catch((e)=>{ 
                //When it could not be send remove it
                this.removeResponseBuffer(waitBuffer); 
                //send the error to all items
                waitBuffer.removedWithError(e);
                this.checkSendBufferAtEnd();
            });
        }
        protected sendCsafeCommands(byteArray : number[]) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                //is there anything to send?
                if (byteArray && byteArray.length>0 ) {
                    //calc the checksum of the data to be send
                    var checksum =0;
                    for (let i=0;i<byteArray.length;i++) checksum=checksum ^ byteArray[i];

                    var newArray=[];
                    for (let i=0;i<byteArray.length;i++) {
                        var value=byteArray[i];
                        if (value>=0xF0 && value<=0xF3) {
                            newArray.push(0xF3);
                            newArray.push(value-0xF0);
                            if (this.logLevel==LogLevel.trace)
                              this.traceInfo("stuffed to byte:"+value);
                        }
                        else newArray.push(value);
                    }
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
                            if (this.logLevel==LogLevel.trace)
                              this.traceInfo("send csafe: "+utils.typedArrayToHexString(buffer));
                            
                            this.driver_write(dataView).then(
                                ()=>{
                                    this.traceInfo("csafe command send");
                                    if (sendBytesIndex>=bytesToSend.length) {
                                        //resolve when all data is send
                                       resolve();
                                    }
    
                                })
                            .catch( (e)=> { 
                                sendBytesIndex=bytesToSend.length;//stop the loop
                                reject(e);
                            });
                        }
                    }
                      //send in packages of max 20 bytes (ble.PACKET_SIZE)
                    

                }
                else resolve();
            })
        }

        protected moveToNextBuffer() : WaitResponseBuffer{
            var result : WaitResponseBuffer=null;
            if (this.logLevel==LogLevel.trace)
              this.traceInfo("next buffer: count="+this._waitResonseBuffers.length);
            if (this._waitResonseBuffers.length>0) {
                var waitBuffer=this._waitResonseBuffers[0];
                //if the first then do not wait any more                               
                waitBuffer.processedBuffer();
                
            }
            if (this._waitResonseBuffers.length>0) {
                result=this._waitResonseBuffers[0];;
            }
            return result;
        }
        //because of the none blocking nature, the receive
        //function tries to match the send command with the received command
        //if they are not in the same order this routine tries to match them
        public handeReceivedDriverData(dataView : DataView) {
            
            //skipp empty 0 ble blocks
            if (this._waitResonseBuffers.length>0 && (dataView.byteLength!=1 || dataView.getUint8(0)!=0)  ) {
                var waitBuffer=this._waitResonseBuffers[0];
                
                if (this.logLevel==LogLevel.trace)
                   this.traceInfo("continious receive csafe: "+utils.typedArrayToHexString(dataView.buffer));
                var i=0;
                
                var moveToNextBuffer=false;
                
                while (i<dataView.byteLength && !moveToNextBuffer) {
                    var currentByte= dataView.getUint8(i);
                    
                    if (waitBuffer.stuffByteActive && currentByte<=3) {
                        currentByte=0xF0+currentByte;//unstuff
                        if (this.logLevel==LogLevel.trace)
                          this.traceInfo("unstuffed to byte:"+currentByte);
                          waitBuffer.stuffByteActive=false;
                    }
                    else { 
                        waitBuffer.stuffByteActive= (currentByte==0xF3);
                        if (waitBuffer.stuffByteActive && this.logLevel==LogLevel.trace)
                          this.traceInfo("start stuff byte"); 
                    }
                    //when stuffbyte is active then move to the next
                    if (!waitBuffer.stuffByteActive) {
                        if (waitBuffer.frameState!=FrameState.initial) {
                            waitBuffer.calcCheck=waitBuffer.calcCheck ^ currentByte; //xor for a simple crc check
                        }
                        if (this.logLevel==LogLevel.trace)
                            this.traceInfo(`parse: ${i}: ${utils.toHexString(currentByte,1)} state: ${waitBuffer.frameState} checksum:${utils.toHexString(waitBuffer.calcCheck,1)} `);
    
                    
                            
                        
                        switch(waitBuffer.frameState) {
                            case FrameState.initial : {
                                //expect a start frame
                                if (currentByte!=csafe.defs.FRAME_START_BYTE) {
                                    moveToNextBuffer=true ;
                                    if (this.logLevel==LogLevel.trace)
                                        this.traceInfo("stop byte "+utils.toHexString(currentByte,1))
                                }
                                else waitBuffer.frameState=FrameState.statusByte;
                                waitBuffer.calcCheck=0;
    
                                break;
                            }
                            case FrameState.statusByte :
                            {   
                                waitBuffer.frameState= FrameState.parseCommand;
                                waitBuffer.statusByte=currentByte
                                waitBuffer.monitorStatus=currentByte & csafe.defs.SLAVESTATE_MSK;
                                waitBuffer.prevFrameState= ((currentByte & csafe.defs.PREVFRAMESTATUS_MSK) >>4);  
                                if (this.logLevel==LogLevel.trace)
                                        this.traceInfo(`monitor status: ${waitBuffer.monitorStatus},prev frame state: ${waitBuffer.prevFrameState}`);
                                waitBuffer._responseState=currentByte;
                                break;
                            }
    
                            case FrameState.parseCommand : {
                                waitBuffer.command=currentByte;
                                waitBuffer.frameState= FrameState.parseCommandLength;    
                                //the real command follows so skip this 
                                break;
                            }
                            case FrameState.parseCommandLength : {
                                //first work arround strange results where the status byte is the same
                                //as the the command and the frame directly ends, What is the meaning of
                                //this? some kind of status??
                                if (waitBuffer.statusByte==waitBuffer.command && currentByte==csafe.defs.FRAME_END_BYTE) {
                                    waitBuffer.command=0; //do not check checksum
                                    
                                    moveToNextBuffer=true;
                                }
                                else if (i==dataView.byteLength-1 && currentByte==csafe.defs.FRAME_END_BYTE ) {
                                    var checksum=waitBuffer.command;
                                    //remove the last 2 bytes from the checksum which was added too much
                                    waitBuffer.calcCheck=waitBuffer.calcCheck ^ currentByte;
                                    waitBuffer.calcCheck=waitBuffer.calcCheck ^ waitBuffer.command;
                                    //check the calculated with the message checksum
                                    
                                    if (this._checksumCheckEnabled && checksum!=waitBuffer.calcCheck) 
                                      this.handleError(`Wrong checksum ${utils.toHexString(checksum,1)} expected ${utils.toHexString(waitBuffer.calcCheck,1) } `);
                                    waitBuffer.command=0; //do not check checksum
                                    moveToNextBuffer=true;
     
                                }
                                else if (i<dataView.byteLength) {
                                    waitBuffer.endCommand=i+currentByte;
                                    waitBuffer.nextDataLength= currentByte;
                                    if (waitBuffer.command>= csafe.defs.CTRL_CMD_SHORT_MIN) {
                                        waitBuffer.frameState= FrameState.parseCommandData;
                                    }
                                    else waitBuffer.frameState= FrameState.parseDetailCommand;
    
                                }
                                break;
                            }
                            case FrameState.parseDetailCommand : {
                                waitBuffer.detailCommand=  currentByte;
                                waitBuffer.frameState= FrameState.parseDetailCommandLength;
    
                                break;
                            }
                            case FrameState.parseDetailCommandLength : {
                                waitBuffer.nextDataLength=currentByte;
                                waitBuffer.frameState= FrameState.parseCommandData;
                                break;
                            }
                            case FrameState.parseCommandData : {
                                if (!waitBuffer.commandData) {
                                    waitBuffer.commandDataIndex=0;
                                    waitBuffer.commandData = new Uint8Array(waitBuffer.nextDataLength);
                                }
                                waitBuffer.commandData[waitBuffer.commandDataIndex]=currentByte;
                                waitBuffer.nextDataLength--;
                                waitBuffer.commandDataIndex++;
                                if (waitBuffer.nextDataLength==0) {
                                    if (waitBuffer.command< csafe.defs.CTRL_CMD_SHORT_MIN 
                                        && i<waitBuffer.endCommand)
                                        waitBuffer.frameState= FrameState.parseDetailCommand;
                                    else waitBuffer.frameState= FrameState.parseCommand;
                                    try {
                                        waitBuffer.receivedCSaveCommand({
                                            command:waitBuffer.command,
                                            detailCommand:waitBuffer.detailCommand,
                                            data:waitBuffer.commandData});
                                    }
                                    catch (e) {
                                        this.handleError(e); //never let the receive crash the main loop
                                    }
    
                                    waitBuffer.commandData=null;
                                    waitBuffer.detailCommand=0;
                                   
                                }
                                break;
                            }
    
                        }
                        
                    }
                    i++;
                }
                
                if (this._receivePartialBuffers ) {
                    //when something went wrong, the bluetooth block is endend but the frame not
                    //this is for blue tooth
                    if (moveToNextBuffer)
                      waitBuffer=this.moveToNextBuffer();
                    else if ( dataView.byteLength!=this.getPacketSize() && waitBuffer && waitBuffer.frameState!=FrameState.initial) {
                        waitBuffer=this.moveToNextBuffer();
                        this.handleError("wrong csafe frame ending.");
                    }
                    
                }
                else {
                    //for usb all should be processd, 
                    //so allways move to the next buffer at the end of parsing
                    
                    waitBuffer=this.moveToNextBuffer();
                }

            }
        }
        protected getPacketSize() : number {
            throw "getPacketSize not implemented"
        }

        public newCsafeBuffer() : ergometer.csafe.IBuffer {
            //init the buffer when needed
            var csafeBuffer = <any> {
                rawCommands: []
            }
            
            csafeBuffer.send= (sucess? : ()=>void,error? : ErrorHandler) => {
                return this.sendCSafeBuffer(csafeBuffer)
                  .then(sucess)
                  .catch(e=>{
                      this.handleError(e);
                      if (error) error(e);
                      return Promise.reject(e);
                    });
            }
            csafeBuffer.addRawCommand=(info:csafe.IRawCommand):csafe.IBuffer=> {
                csafeBuffer.rawCommands.push(info);
                return csafeBuffer;
            }   
              
            csafe.commandManager.apply(csafeBuffer, this);
            
            return csafeBuffer;
        }

    }

}