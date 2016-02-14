/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
module ergometer.csafe {

    //----------------------------- get the version info ------------------------------------

    export interface IVersion {
        ManufacturerId : number;
        CID : number;
        Model  : number;
        HardwareVersion : number;
        FirmwareVersion : number;
    }
    export interface ICommandGetVersion  extends ICommandParamsBase {
        received : (version :IVersion )=>void;
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

    //----------------------------- set horizontal distance ------------------------------------

    export interface IDistance {
        value : number
        unit: Unit;
    }

    export interface ICommandGetDistance  extends ICommandParamsBase {
        received : (version :IDistance )=>void;
    }
    export interface IBuffer {
        getDistance(params : ICommandParamsBase) : IBuffer;
    }

    registerStandardShortGet<ICommandGetDistance,IDistance>("getDistance",
        csafe.defs.SHORT_DATA_CMDS.GETHORIZONTAL_CMD,
        (data : DataView)=>{return {value: data.getUint16(0,true),unit:data.getUint8(2)};});

}