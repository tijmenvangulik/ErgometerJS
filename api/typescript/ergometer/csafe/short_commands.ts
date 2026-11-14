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


    //----------------------------- get status ------------------------------------

    export interface ICommandGetStatus  extends ICommandParamsBase {
        onDataReceived : (state : SlaveState)=>void;
    }
    export interface IBuffer {
        /** the public csafe state of the monitor (ready, idle, in use, finished ...) */
        getStatus(params : ICommandGetStatus) : IBuffer;
    }

    //the PM does not echo the get status command, it only returns the status byte of the frame
    commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitorBase) =>{
        buffer.getStatus= function (params : ICommandGetStatus) : IBuffer {
            buffer.addRawCommand({
                waitForResponse:true,
                command : csafe.defs.SHORT_CTRL_CMDS.GETSTATUS_CMD,
                onDataReceived : (data : DataView)=>{
                    if (params.onDataReceived) params.onDataReceived(data.byteLength>0?data.getUint8(0) & csafe.defs.SLAVESTATE_MSK:0) },
                onFrameStatus : (statusByte : number)=>{
                    if (params.onDataReceived) params.onDataReceived(statusByte & csafe.defs.SLAVESTATE_MSK) },
                onError:params.onError
            });
            return buffer;
        }
    });

    //----------------------------- public state machine commands ------------------------------------
    //these commands have no response data, only the status byte is returned

    export interface IBuffer {
        /** reset the public csafe state machine */
        reset(params? : ICommandParamsBase) : IBuffer;
        goIdle(params? : ICommandParamsBase) : IBuffer;
        goHaveId(params? : ICommandParamsBase) : IBuffer;
        goInUse(params? : ICommandParamsBase) : IBuffer;
        goFinished(params? : ICommandParamsBase) : IBuffer;
        goReady(params? : ICommandParamsBase) : IBuffer;
        badId(params? : ICommandParamsBase) : IBuffer;
    }

    registerStandardShortCommand("reset",csafe.defs.SHORT_CTRL_CMDS.RESET_CMD);
    registerStandardShortCommand("goIdle",csafe.defs.SHORT_CTRL_CMDS.GOIDLE_CMD);
    registerStandardShortCommand("goHaveId",csafe.defs.SHORT_CTRL_CMDS.GOHAVEID_CMD);
    registerStandardShortCommand("goInUse",csafe.defs.SHORT_CTRL_CMDS.GOINUSE_CMD);
    registerStandardShortCommand("goFinished",csafe.defs.SHORT_CTRL_CMDS.GOFINISHED_CMD);
    registerStandardShortCommand("goReady",csafe.defs.SHORT_CTRL_CMDS.GOREADY_CMD);
    registerStandardShortCommand("badId",csafe.defs.SHORT_CTRL_CMDS.BADID_CMD);

    //----------------------------- get user id ------------------------------------

    export interface ICommandGetUserId  extends ICommandParamsBase {
        onDataReceived : (value : string)=>void;
    }
    export interface IBuffer {
        /** the user id as ascii digits (number of digits depends on the id digits configuration) */
        getUserId(params : ICommandGetUserId) : IBuffer;
    }

    registerStandardShortGet<ICommandGetUserId,string>("getUserId",
        csafe.defs.SHORT_STATUS_CMDS.GETID_CMD,
        (data : DataView)=>{return readAscii(data,0,data.byteLength)});

    //----------------------------- get units ------------------------------------

    export interface ICommandGetUnits  extends ICommandParamsBase {
        onDataReceived : (value : Unit)=>void;
    }
    export interface IBuffer {
        getUnits(params : ICommandGetUnits) : IBuffer;
    }

    registerStandardShortGet<ICommandGetUnits,Unit>("getUnits",
        csafe.defs.SHORT_STATUS_CMDS.GETUNITS_CMD,
        (data : DataView)=>{return data.getUint8(0)});

    //----------------------------- get serial number ------------------------------------

    export interface ICommandGetSerialNumber  extends ICommandParamsBase {
        onDataReceived : (value : string)=>void;
    }
    export interface IBuffer {
        /** the 9 digit serial number of the monitor */
        getSerialNumber(params : ICommandGetSerialNumber) : IBuffer;
    }

    registerStandardShortGet<ICommandGetSerialNumber,string>("getSerialNumber",
        csafe.defs.SHORT_STATUS_CMDS.GETSERIAL_CMD,
        (data : DataView)=>{return readAscii(data,0,9)});

    //----------------------------- get odometer ------------------------------------

    export interface ICommandGetOdometer  extends ICommandParamsBase {
        onDataReceived : (value : IDistance)=>void;
    }
    export interface IBuffer {
        /** the total distance the machine has done during its life time */
        getOdometer(params : ICommandGetOdometer) : IBuffer;
    }

    registerStandardShortGet<ICommandGetOdometer,IDistance>("getOdometer",
        csafe.defs.SHORT_STATUS_CMDS.GETODOMETER_CMD,
        (data : DataView)=>{return {value: data.getUint32(0,true),unit:data.getUint8(4)}});

    //----------------------------- get error code ------------------------------------

    export interface ICommandGetErrorCode  extends ICommandParamsBase {
        onDataReceived : (value : number)=>void;
    }
    export interface IBuffer {
        getErrorCode(params : ICommandGetErrorCode) : IBuffer;
    }

    registerStandardShortGet<ICommandGetErrorCode,number>("getErrorCode",
        csafe.defs.SHORT_STATUS_CMDS.GETERRORCODE_CMD,
        (data : DataView)=>{return utils.getUint24(data,0)});

    //----------------------------- get program ------------------------------------

    export interface ICommandGetProgram  extends ICommandParamsBase {
        onDataReceived : (value : Program)=>void;
    }
    export interface IBuffer {
        /** the programmed or pre-stored workout number */
        getProgram(params : ICommandGetProgram) : IBuffer;
    }

    registerStandardShortGet<ICommandGetProgram,Program>("getProgram",
        csafe.defs.SHORT_DATA_CMDS.GETPROGRAM_CMD,
        (data : DataView)=>{return data.getUint8(0)});

    //----------------------------- get user info ------------------------------------

    export interface IUserInfo {
        weight : number;
        weightUnit : Unit;
        age : number;
        gender : number;
    }
    export interface ICommandGetUserInfo  extends ICommandParamsBase {
        onDataReceived : (value : IUserInfo)=>void;
    }
    export interface IBuffer {
        getUserInfo(params : ICommandGetUserInfo) : IBuffer;
    }

    registerStandardShortGet<ICommandGetUserInfo,IUserInfo>("getUserInfo",
        csafe.defs.SHORT_DATA_CMDS.GETUSERINFO_CMD,
        (data : DataView)=>{return {
            weight: data.getUint16(0,true),
            weightUnit: data.getUint8(2),
            age: data.getUint8(3),
            gender: data.getUint8(4)
        }});

}
