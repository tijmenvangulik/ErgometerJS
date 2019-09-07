/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
namespace ergometer.csafe {

    //----------------------------- get the version info ------------------------------------

    export interface IVersion {
        ManufacturerId : number;
        CID : number;
        Model  : number;
        HardwareVersion : number;
        FirmwareVersion : number;
    }
    export interface ICommandGetVersion  extends ICommandParamsBase {
        onDataReceived : (version :IVersion )=>void;
    }
    export interface IBuffer {
        getVersion(params : ICommandGetVersion) : IBuffer;

    }

    commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
        buffer.getVersion= function (params : ICommandGetVersion) : IBuffer {
            buffer.addRawCommand({
                waitForResponse:true,
                command : defs.SHORT_STATUS_CMDS.GETVERSION_CMD,
                onDataReceived : (data : DataView)=>{
                    if (params.onDataReceived) params.onDataReceived ({
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
        onDataReceived : (version :IDistance )=>void;
    }
    export interface IBuffer {
        getDistance(params : ICommandParamsBase) : IBuffer;
    }

    registerStandardShortGet<ICommandGetDistance,IDistance>("getDistance",
        csafe.defs.SHORT_DATA_CMDS.GETHORIZONTAL_CMD,
        (data : DataView)=>{return {value: data.getUint16(0,true),unit:data.getUint8(2)};});

    //----------------------------- get pace ------------------------------------

    
    export interface ICommandGetPace  extends ICommandParamsBase {
        onDataReceived : (value :number )=>void;
    }
    export interface IBuffer {
        getPace(params : ICommandParamsBase) : IBuffer;
    }

    registerStandardShortGet<ICommandGetDistance,number>("getPace",
        csafe.defs.SHORT_DATA_CMDS.GETPACE_CMD,
        (data : DataView)=>{return data.getUint16(0,true)});

    //----------------------------- get power ------------------------------------

    export interface ICommandGetPower  extends ICommandParamsBase {
        onDataReceived : (value :number )=>void;
    }
    export interface IBuffer {
        getPower(params : ICommandParamsBase) : IBuffer;
    }

    registerStandardShortGet<ICommandGetDistance,number>("getPower",
        csafe.defs.SHORT_DATA_CMDS.GETPOWER_CMD,
        (data : DataView)=>{return data.getUint16(0,true)});
//----------------------------- get cadence ------------------------------------

    export interface ICommandGetCadence  extends ICommandParamsBase {
        onDataReceived : (value :number )=>void;
    }
    export interface IBuffer {
        getCadence(params : ICommandParamsBase) : IBuffer;
    }

    registerStandardShortGet<ICommandGetDistance,number>("getCadence",
        csafe.defs.SHORT_DATA_CMDS.GETCADENCE_CMD,
        (data : DataView)=>{return data.getUint16(0,true)});


//----------------------------- get horizontal ------------------------------------

    export interface ICommandGetHorizontal  extends ICommandParamsBase {
        onDataReceived : (value :number )=>void;
    }
    export interface IBuffer {
        getHorizontal(params : ICommandParamsBase) : IBuffer;
    }

    registerStandardShortGet<ICommandGetHorizontal,number>("getHorizontal",
        csafe.defs.SHORT_DATA_CMDS.GETHORIZONTAL_CMD,
        (data : DataView)=>{
            var value=data.getUint16(0,true);
            return value});
    

//----------------------------- get calories ------------------------------------

    export interface ICommandGetCalories  extends ICommandParamsBase {
        onDataReceived : (value :number )=>void;
    }
    export interface IBuffer {
        getCalories(params : ICommandParamsBase) : IBuffer;
    }

    registerStandardShortGet<ICommandGetCalories,number>("getCalories",
        csafe.defs.SHORT_DATA_CMDS.GETCALORIES_CMD,
        (data : DataView)=>{
            var value=data.getUint16(0,true);
            return value});
       
//----------------------------- get heart reate ------------------------------------

export interface ICommandHeartRate  extends ICommandParamsBase {
    onDataReceived : (value :number )=>void;
}
export interface IBuffer {
    getHeartRate(params : ICommandParamsBase) : IBuffer;
}

registerStandardShortGet<ICommandHeartRate,number>("getHeartRate",
    csafe.defs.SHORT_DATA_CMDS.GETHRCUR_CMD,
    (data : DataView)=>{
        var value=data.getUint8(0);
        return value});

}