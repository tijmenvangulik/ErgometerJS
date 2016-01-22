/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
module ergometer.csafe {

/*  ************************************************************
 *
 *             get the version info
 *
 ************************************************************ */

    export interface IVersion {
        ManufacturerId : number;
        CID : number;
        Model  : number;
        HardwareVersion : number;
        FirmwareVersion : number;
    }
    export interface ICommandGetVersion  {
        received : (version :IVersion )=>void;
        onError? : ErrorHandler;
    }
    export interface IBuffer {
        getVersion(params : ICommandGetVersion) : IBuffer;

    }

    commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitor) =>{
        buffer.getVersion= function (params : ICommandGetVersion) : IBuffer {
            buffer.addRawCommand({
                waitForResponse:true,
                command : defs.SHORT_STATUS_CMDS.GETVERSION_CMD,
                onDataReceived : (data : DataView)=>{
                    if (params.received) params.received ({
                        ManufacturerId: data.getUint8(0),
                        CID : data.getUint8(1),
                        Model: data.getUint8(2),
                        HardwareVersion: data.getUint16(3,true),
                        FirmwareVersion: data.getUint16(5,true)
                    })

                },
                onError:params.onError
            });
            return buffer;
        }
    })

}