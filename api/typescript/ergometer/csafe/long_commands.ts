
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
module ergometer.csafe {


    //----------------------------- get the stoke state ------------------------------------

    export interface ICommandStrokeState  extends ICommandParamsBase {
        onDataReceived : (state : StrokeState )=>void;
    }
    export interface IBuffer {
        getStrokeState(params : ICommandStrokeState) : IBuffer;
    }

    commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitor) =>{
        buffer.getStrokeState= function (params : ICommandStrokeState) : IBuffer {
            buffer.addRawCommand({
                waitForResponse:true,
                command : csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                detailCommand: csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKESTATE,
                onDataReceived : (data : DataView)=>{
                    if (params.onDataReceived) params.onDataReceived(data.getUint8(0))
                },
                onError:params.onError
            });
            return buffer;
        }
    })

    //----------------------------- get power curve ------------------------------------

    export interface ICommandPowerCurve  {
        onDataReceived : (curve : number[] )=>void;
        onError? : ErrorHandler;
    }
    export interface IBuffer {
        getPowerCurve(params : ICommandPowerCurve) : IBuffer;
    }

    commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitor) =>{
        var  receivePowerCurvePart : number[] = [];
        var  currentPowerCurve : number[]= [];
        buffer.getPowerCurve= function (params : ICommandPowerCurve) : IBuffer {

            buffer.addRawCommand({
                waitForResponse: true,
                command : csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                detailCommand: csafe.defs.PM_LONG_PULL_DATA_CMDS.PM_GET_FORCEPLOTDATA,
                data: [20],
                onError:params.onError,
                onDataReceived : (data : DataView)=>{
                    if (params.onDataReceived)  {

                        var bytesReturned = data.getUint8(0); //first byte
                        monitor.traceInfo(`received power curve count ${bytesReturned}`);
                        if (bytesReturned>0) {
                            for (var i = 1; i < bytesReturned+1; i += 2) {
                                var value=data.getUint16(i,true); //in ltile endian format

                                receivePowerCurvePart.push(value);
                            }
                            monitor.traceInfo("received part :"+JSON.stringify(receivePowerCurvePart));

                            //try to get another one till it is empty and there is nothing more
                            buffer.clear().getPowerCurve({onDataReceived:params.onDataReceived}).send();
                        }
                        else {
                            if (receivePowerCurvePart.length>0) {
                                currentPowerCurve=receivePowerCurvePart;
                                receivePowerCurvePart=[];
                                monitor.traceInfo("Curve:"+JSON.stringify(currentPowerCurve));
                                if (params.onDataReceived && currentPowerCurve.length>0)
                                    params.onDataReceived(currentPowerCurve);
                            }
                        }
                    }
                }
            });
            return buffer;
        }
    });

    //set program
    export interface ICommandProgramParams extends ICommandParamsBase {
        value : Program
    }
    export interface IBuffer {
        setProgram(params : ICommandProgramParams) : IBuffer;
    }

    registerStandardSet<ICommandProgramParams>("setProgram",
        csafe.defs.LONG_DATA_CMDS.SETPROGRAM_CMD,
        (params)=>{return [utils.getByte(params.value,0),0];});

    //----------------------------- set time ------------------------------------

    export interface ICommandTimeParams extends ICommandParamsBase {
        hour : number;
        minute: number;
        second : number;
    }
    export interface IBuffer {
        setTime(params : ICommandTimeParams) : IBuffer;
    }

    registerStandardSet<ICommandTimeParams>("setTime",
        csafe.defs.LONG_CFG_CMDS.SETTIME_CMD,
        (params)=>{return [params.hour,params.minute,params.second];});

    //----------------------------- set date ------------------------------------

    export interface ICommandDateParams extends ICommandParamsBase {
        year : number;
        month: number;
        day : number;
    }
    export interface IBuffer {
        setDate(params : ICommandDateParams) : IBuffer;
    }

    registerStandardSet<ICommandDateParams>("setDate",
        csafe.defs.LONG_CFG_CMDS.SETDATE_CMD,
        (params)=>{return [utils.getByte(params.year,0),params.month,params.day];});


    //----------------------------- set timeout ------------------------------------

    export interface IBuffer {
        setTimeout(params : ICommandSetStandardValue) : IBuffer;
    }

    registerStandardSet<ICommandSetStandardValue>("setTimeout",
        csafe.defs.LONG_CFG_CMDS.SETTIMEOUT_CMD,
        (params)=>{return [params.value];});


    //----------------------------- set work ------------------------------------

    export interface IBuffer {
        setWork(params : ICommandTimeParams) : IBuffer;
    }

    registerStandardSet<ICommandTimeParams>("setWork",
        csafe.defs.LONG_DATA_CMDS.SETTWORK_CMD,
        (params)=>{return [params.hour,params.minute,params.second];});

    //----------------------------- set horizontal distance ------------------------------------

    export interface ICommandDistanceParams  extends ICommandSetStandardValue {
        unit: Unit;
    }

    export interface IBuffer {
        setDistance(params : ICommandDistanceParams) : IBuffer;
    }

    registerStandardSet<ICommandDistanceParams>("setDistance",
        csafe.defs.LONG_DATA_CMDS.SETHORIZONTAL_CMD,
        (params)=>{return [utils.getByte(params.value,0),utils.getByte(params.value,1),params.unit];});


    //----------------------------- set total calories ------------------------------------
    export interface IBuffer {
        setTotalCalories(params : ICommandSetStandardValue) : IBuffer;
    }

    registerStandardSet<ICommandSetStandardValue>("setTotalCalories",
        csafe.defs.LONG_DATA_CMDS.SETCALORIES_CMD,
        (params)=>{return [utils.getByte(params.value,0),utils.getByte(params.value,1)];});

    //----------------------------- set power ------------------------------------

    export interface ICommandPowerParams  extends ICommandSetStandardValue {
        unit: Unit;
    }

    export interface IBuffer {
        setPower(params : ICommandPowerParams) : IBuffer;
    }

    registerStandardSet<ICommandPowerParams>("setPower",
        csafe.defs.LONG_DATA_CMDS.SETPOWER_CMD,
        (params)=>{return [utils.getByte(params.value,0),utils.getByte(params.value,1),params.unit];});

}