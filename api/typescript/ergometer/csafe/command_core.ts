/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 * this is the core, you do not have to change this code.
 *
 */
namespace ergometer.csafe {
    export const enum SlaveState {

        ERROR =0,
        READY =1,
        IDLE = 2,
        HAVEID =3,
        INUSE = 5,
        PAUZED = 6,
        FINISHED= 7,
        MANUAL = 8,
        OFFLINE = 9
                                   //CTRL_CMD_SHORT_MIN
    }
    export const enum PrevFrameState  {
       OK,
       REJECT,
       BAD,
       NOT_READY

    }
    export interface ICommandParamsBase {
        onError? : ErrorHandler;
        onDataReceived? : (data : any)=>void;
    }
    export interface IRawCommand {
        waitForResponse : boolean;
        command : number;
        detailCommand? : number;
        data? : number[];  //you can skipp the length for this property, this is auto calculated
        onDataReceived? : (data : DataView)=>void;
        onError?: ErrorHandler;
        /** called with the status byte of the response frame when the frame ended without a reply for this command.
         * The PM answers some commands (like get status) with only the status byte of the frame. */
        onFrameStatus? : (statusByte : number)=>void;

        responseBuffer? : IResponseBuffer;

    }
    export interface IBuffer {
        rawCommands : IRawCommand[];
        addRawCommand(info : IRawCommand);
        send(success? : ()=>void,error? : ErrorHandler) : Promise<void>;

    }
    export interface IResponseBuffer {
        monitorStatus : ergometer.csafe.SlaveState;
        prevFrameState : ergometer.csafe.PrevFrameState;
        commands : csafe.IRawCommand[];
    }
    export interface ICommand {
        (buffer : IBuffer,monitor : PerformanceMonitorBase) :void
    }
    export class CommandManagager {
        private _commands : ICommand[] = [];
        public register(createCommand : ICommand) {
            this._commands.push(createCommand)
        }
        public apply(buffer : IBuffer,monitor : PerformanceMonitorBase) {
            this._commands.forEach((command : ICommand) => {
                command(buffer,monitor);
            });
        }

    }
    export var commandManager = new CommandManagager();

    //----------------  standard value wrapper for shorter syntax----------

    export interface ICommandSetStandardValue extends ICommandParamsBase {
        value : number; //program or pre stored work out
    }

    export function registerStandardSet<T extends ICommandParamsBase>(functionName :string , command : number, setParams : (params : T)=> number[]) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:false,
                    command : command,
                    data: setParams(params),
                    onError:params.onError
                });
                return buffer;
            }
        })
    }
    export function registerStandardSetConfig<T extends ICommandParamsBase>(functionName :string , command : number, setParams : (params : T)=> number[]) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:false,
                    command : csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD ,
                    detailCommand: command,
                    data: setParams(params),
                    onError:params.onError
                });
                return buffer;
            }
        })
    }
    export function registerStandardGetConfig<T extends ICommandParamsBase,U>(functionName :string , detailCommand : number,converter : (data : DataView)=> U) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:true,
                    command : csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                    detailCommand: detailCommand,
                    onDataReceived : (data : DataView)=>{params.onDataReceived(<U>converter(data)) }  ,
                    onError:params.onError
                });
                return buffer;
            }
        })
    }

    export function registerStandardShortGet<T extends ICommandParamsBase,U>(functionName :string , command : number,converter : (data : DataView)=> U) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:true,
                    command : command,
                    onDataReceived : (data : DataView)=>{params.onDataReceived(<U>converter(data)) }  ,
                    onError:params.onError
                });
                return buffer;
            }
        })
    }
    //

    //Proprietary Short Set Configuration Commands 
	//C2 Proprietary Long Set Configuration Commands
    export function registerStandardProprietarySetConfig<T extends ICommandParamsBase>(functionName :string , command : number, setParams : (params : T)=> number[]) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:false,
                    command : csafe.defs.LONG_PMPROPRIETARY_CMDS.SETPMCFG_CMD ,
                    detailCommand: command,
                    data: setParams(params),
                    onError:params.onError
                });
                return buffer;
            }
        })
    }
    //Proprietary Short Set Data Commands 
	//C2 Proprietary Long Set Data Commands
    export function registerStandardProprietarySetData<T extends ICommandParamsBase>(functionName :string , command : number, setParams : (params : T)=> number[]) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:false,
                    command : csafe.defs.LONG_PMPROPRIETARY_CMDS.SETPMDATA_CMD ,
                    detailCommand: command,
                    data: setParams(params),
                    onError:params.onError
                });
                return buffer;
            }
        })
    }

    //Proprietary Long Set Configuration Command which also reads the response (result) byte
    //needed for commands like the usb authentication which return a result
    export function registerStandardProprietarySetConfigResponse<T extends ICommandParamsBase,U>(functionName :string , command : number, setParams : (params : T)=> number[], converter : (data : DataView)=> U) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:true,
                    command : csafe.defs.LONG_PMPROPRIETARY_CMDS.SETPMCFG_CMD ,
                    detailCommand: command,
                    data: setParams(params),
                    onDataReceived : (data : DataView)=>{ if (params.onDataReceived) params.onDataReceived(<U>converter(data)) }  ,
                    onError:params.onError
                });
                return buffer;
            }
        })
    }

    //hoofdstuk C2 Proprietary Short Get Configuration

    //getParams is optional, only needed for the long get commands which send data (like the user number)
    export function registerStandardProprietaryGetConfig<T extends ICommandParamsBase,U>(functionName :string , detailCommand : number,converter : (data : DataView)=> U, getParams? : (params : T)=> number[]) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:true,
                    command : csafe.defs.PROPRIETARY_GET_CMDS.GETPMCFG_CMD, 
                    detailCommand: detailCommand,
                    data: getParams?getParams(params):undefined,
                    onDataReceived : (data : DataView)=>{ if (params.onDataReceived) params.onDataReceived(<U>converter(data)) }  ,
                    onError:params.onError
                });
                return buffer;
            }
        })
    }

    //C2 Proprietary Short Get Data Commands
    //getParams is optional, only needed for the long get commands which send data (like the block length)
    export function registerStandardProprietaryGetData<T extends ICommandParamsBase,U>(functionName :string , detailCommand : number,converter : (data : DataView)=> U, getParams? : (params : T)=> number[]) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:true,
                    command : csafe.defs.PROPRIETARY_GET_CMDS.GETPMDATA_CMD,
                    detailCommand: detailCommand,
                    data: getParams?getParams(params):undefined,
                    onDataReceived : (data : DataView)=>{ if (params.onDataReceived) params.onDataReceived(<U>converter(data)) }  ,
                    onError:params.onError
                });
                return buffer;
            }
        })
    }
    

    //Short command without response data, only the status byte is returned (like goReady, goIdle)
    export function registerStandardShortCommand<T extends ICommandParamsBase>(functionName :string , command : number) {
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
            buffer[functionName]= function (params? : T) : IBuffer {
                buffer.addRawCommand({
                    waitForResponse:false,
                    command : command,
                    onError:params?params.onError:undefined
                });
                return buffer;
            }
        })
    }

    //----------------  conversion helpers for the response data ----------

    /** read a fixed length ascii string, trailing zero bytes and spaces are removed */
    export function readAscii(data : DataView, offset : number, length : number) : string {
        var result="";
        var end=Math.min(offset+length,data.byteLength);
        for (var i=offset;i<end;i++) {
            var c=data.getUint8(i);
            if (c===0) break;
            result+=String.fromCharCode(c);
        }
        return result.trim();
    }
    /** convert a string to a fixed length ascii byte array, padded with zeros */
    export function asciiToBytes(value : string, length : number) : number[] {
        var result : number[] = [];
        for (var i=0;i<length;i++)
            result.push(value && i<value.length?(value.charCodeAt(i) & 0xFF):0);
        return result;
    }
    /** a 4 byte value as an array of bytes, most significant byte first */
    export function uint32ToBytesMSB(value : number) : number[] {
        return [utils.getByte(value,3),utils.getByte(value,2),utils.getByte(value,1),utils.getByte(value,0)];
    }
    /** a 2 byte value as an array of bytes, most significant byte first */
    export function uint16ToBytesMSB(value : number) : number[] {
        return [utils.getByte(value,1),utils.getByte(value,0)];
    }
}
