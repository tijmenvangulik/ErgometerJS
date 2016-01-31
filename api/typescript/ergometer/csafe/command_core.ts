/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 * this is the core, you do not have to change this code.
 *
 */
module ergometer.csafe {

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

}