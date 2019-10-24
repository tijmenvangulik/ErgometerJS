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

    export function registerStandardLongGet<T extends ICommandParamsBase,U>(functionName :string , detailCommand : number,converter : (data : DataView)=> U) {
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
    
}