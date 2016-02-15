/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 * this is the core, you do not have to change this code.
 *
 */
module ergometer.csafe {

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
        _timestamp? : number;// only for internal use
    }
    export interface IBuffer {
        rawCommands : IRawCommand[];
        clear() : IBuffer;
        addRawCommand(info : IRawCommand);
        send(success? : ()=>void,error? : ErrorHandler) : Promise<void>;

    }

    export interface ICommand {
        (buffer : IBuffer,monitor : PerformanceMonitor) :void
    }
    export class CommandManagager {
        private _commands : ICommand[] = [];
        public register(createCommand : ICommand) {
            this._commands.push(createCommand)
        }
        public apply(buffer : IBuffer,monitor : PerformanceMonitor) {
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
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitor) =>{
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
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitor) =>{
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
        commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitor) =>{
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
}