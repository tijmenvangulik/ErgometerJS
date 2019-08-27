
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
namespace ergometer.csafe {


    //----------------------------- get the stoke state ------------------------------------

    export interface ICommandStrokeState extends ICommandParamsBase {
        onDataReceived: (state: StrokeState) => void;
    }
    export interface IBuffer {
        getStrokeState(params: ICommandStrokeState): IBuffer;
    }

    commandManager.register((buffer: IBuffer, monitor: PerformanceMonitorBase) => {
        buffer.getStrokeState = function (params: ICommandStrokeState): IBuffer {
            buffer.addRawCommand({
                waitForResponse: true,
                command: csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                detailCommand: csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKESTATE,
                onDataReceived: (data: DataView) => {
                    if (params.onDataReceived) params.onDataReceived(data.getUint8(0))
                },
                onError: params.onError
            });
            return buffer;
        }
    })

    //----------------------------- get the drag factor ------------------------------------

    export interface ICommandDragFactor extends ICommandParamsBase {
        onDataReceived: (state: number) => void;
    }
    export interface IBuffer {
        getDragFactor(params: ICommandDragFactor): IBuffer;
    }

    commandManager.register((buffer: IBuffer, monitor: PerformanceMonitorBase) => {
        buffer.getDragFactor = function (params: ICommandStrokeState): IBuffer {
            buffer.addRawCommand({
                waitForResponse: true,
                command: csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                detailCommand: csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_DRAGFACTOR,
                onDataReceived: (data: DataView) => {
                    if (params.onDataReceived) params.onDataReceived(data.getUint8(0))
                },
                onError: params.onError
            });
            return buffer;
        }
    })

    //----------------------------- get the work distance ------------------------------------

    export interface ICommandWorkDistance extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    export interface IBuffer {
        getWorkDistance(params: ICommandWorkDistance): IBuffer;
    }

    commandManager.register((buffer: IBuffer, monitor: PerformanceMonitorBase) => {
        buffer.getWorkDistance = function (params: ICommandWorkDistance): IBuffer {
            buffer.addRawCommand({
                waitForResponse: true,
                command: csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                detailCommand: csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_WORKDISTANCE,
                onDataReceived: (data: DataView) => {
                    if (params.onDataReceived) {
                        var distance = (data.getUint8(0) +
                            (data.getUint8(1) << 8) +
                            (data.getUint8(2) << 16) +
                            (data.getUint8(3) << 24)) / 10;
                        var fraction = (data.getUint8(4) / 10.0);
                        var workDistance = distance + fraction;
                        params.onDataReceived(workDistance)
                    }

                },
                onError: params.onError
            });
            return buffer;
        }
    })

    //----------------------------- get the work time ------------------------------------

    export interface ICommandWorkTime extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    export interface IBuffer {
        getWorkTime(params: ICommandWorkTime): IBuffer;
    }

    commandManager.register((buffer: IBuffer, monitor: PerformanceMonitorBase) => {
        buffer.getWorkTime = function (params: ICommandWorkDistance): IBuffer {
            buffer.addRawCommand({
                waitForResponse: true,
                command: csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                detailCommand: csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_WORKTIME,
                onDataReceived: (data: DataView) => {
                    if (params.onDataReceived) {
                        var timeInSeconds =
                            ((data.getUint8(0) +
                                (data.getUint8(1) << 8) +
                                (data.getUint8(2) << 16) +
                                (data.getUint8(3) << 24))) / 100;
                        var fraction = data.getUint8(4) / 100;
                        var workTimeMs = (timeInSeconds + fraction) * 1000;
                        params.onDataReceived(workTimeMs);
                    }

                },
                onError: params.onError
            });
            return buffer;
        }
    })

    //----------------------------- get power curve ------------------------------------

    export interface ICommandPowerCurve {
        onDataReceived: (curve: number[]) => void;
        onError?: ErrorHandler;
    }
    export interface IBuffer {
        getPowerCurve(params: ICommandPowerCurve): IBuffer;
    }

    commandManager.register((buffer: IBuffer, monitor: PerformanceMonitorBase) => {
        var receivePowerCurvePart: number[] = [];
        var currentPowerCurve: number[] = [];
        buffer.getPowerCurve = function (params: ICommandPowerCurve): IBuffer {

            buffer.addRawCommand({
                waitForResponse: true,
                command: csafe.defs.LONG_CFG_CMDS.SETUSERCFG1_CMD,
                detailCommand: csafe.defs.PM_LONG_PULL_DATA_CMDS.PM_GET_FORCEPLOTDATA,
                data: [20],
                onError: params.onError,
                onDataReceived: (data: DataView) => {
                    if (params.onDataReceived) {

                        var bytesReturned = data.getUint8(0); //first byte
                        monitor.traceInfo(`received power curve count ${bytesReturned}`);
                        if (bytesReturned > 0) {
                            for (var i = 1; i < bytesReturned + 1; i += 2) {
                                var value = data.getUint16(i, true); //in ltile endian format

                                receivePowerCurvePart.push(value);
                            }
                            monitor.traceInfo("received part :" + JSON.stringify(receivePowerCurvePart));

                            //try to get another one till it is empty and there is nothing more
                            buffer.clear().getPowerCurve({ onDataReceived: params.onDataReceived }).send();
                        }
                        else {
                            if (receivePowerCurvePart.length > 0) {
                                currentPowerCurve = receivePowerCurvePart;
                                receivePowerCurvePart = [];
                                monitor.traceInfo("Curve:" + JSON.stringify(currentPowerCurve));
                                if (params.onDataReceived && currentPowerCurve.length > 0)
                                    params.onDataReceived(currentPowerCurve);
                            }
                        }
                    }
                }
            });
            return buffer;
        }
    });
    //----------------------------- get workout type ------------------------------------

    export interface ICommandGetWorkoutType extends ICommandParamsBase {
        onDataReceived: (value: WorkoutType) => void;
    }
    export interface IBuffer {
        getWorkoutType(params: ICommandParamsBase): IBuffer;
    }

    registerStandardLongGet<ICommandGetWorkoutType, WorkoutType>("getWorkoutType",
        csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_WORKOUTTYPE,
        data=>data.getUint8(0));

//----------------------------- get workout state ------------------------------------

export interface ICommandGetWorkoutState extends ICommandParamsBase {
    onDataReceived: (value: WorkoutState) => void;
}
export interface IBuffer {
    getWorkoutState(params: ICommandParamsBase): IBuffer;
}

registerStandardLongGet<ICommandGetWorkoutState, WorkoutState>("getWorkoutState",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_WORKOUTSTATE,
    data=>data.getUint8(0));

//----------------------------- get workout interval count ------------------------------------

    export interface ICommandGetWorkoutIntervalCount extends ICommandParamsBase {
        onDataReceived: (value: number) => void;
    }
    export interface IBuffer {
        getWorkoutIntervalCount(params: ICommandParamsBase): IBuffer;
    }

    registerStandardLongGet<ICommandGetWorkoutIntervalCount, number>("getWorkoutIntervalCount",
        csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_WORKOUTINTERVALCOUNT,
        data=>data.getUint8(0));    

//----------------------------- get workout interval type ------------------------------------

    export interface ICommandGetWorkoutIntervalType extends ICommandParamsBase {
        onDataReceived: (value: IntervalType) => void;
    }
    export interface IBuffer {
        getWorkoutIntervalType(params: ICommandParamsBase): IBuffer;
    }

    registerStandardLongGet<ICommandGetWorkoutIntervalType, IntervalType>("getWorkoutIntervalType",
        csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_INTERVALTYPE,
        data=>data.getUint8(0));   
         
//----------------------------- get workout rest time  ------------------------------------

export interface ICommandGetWorkoutIntervalRestTime extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    getWorkoutIntervalRestTime(params: ICommandParamsBase): IBuffer;
}

registerStandardLongGet<ICommandGetWorkoutIntervalCount, number>("getWorkoutIntervalRestTime",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_RESTTIME,
    data=>data.getUint16(0,true));    

    //----------------------------- get workout work  ------------------------------------

export interface ICommandGetWork extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    getWork(params: ICommandParamsBase): IBuffer;
}

registerStandardLongGet<ICommandGetWork, number>("getWork",
    csafe.defs.SHORT_DATA_CMDS.GETTWORK_CMD,
    data=>{
        var result=data.getUint8(0)*60*60+
           data.getUint8(1)*60+
           data.getUint8(2);
        return result*1000;
    });   


//----------------------------- set program ------------------------------------
    export interface ICommandProgramParams extends ICommandParamsBase {
        value: Program
    }
    export interface IBuffer {
        setProgram(params: ICommandProgramParams): IBuffer;
    }

    registerStandardSet<ICommandProgramParams>("setProgram",
        csafe.defs.LONG_DATA_CMDS.SETPROGRAM_CMD,
        (params) => { return [utils.getByte(params.value, 0), 0]; });

    //----------------------------- set time ------------------------------------

    export interface ICommandTimeParams extends ICommandParamsBase {
        hour: number;
        minute: number;
        second: number;
    }
    export interface IBuffer {
        setTime(params: ICommandTimeParams): IBuffer;
    }

    registerStandardSet<ICommandTimeParams>("setTime",
        csafe.defs.LONG_CFG_CMDS.SETTIME_CMD,
        (params) => { return [params.hour, params.minute, params.second]; });

    //----------------------------- set date ------------------------------------

    export interface ICommandDateParams extends ICommandParamsBase {
        year: number;
        month: number;
        day: number;
    }
    export interface IBuffer {
        setDate(params: ICommandDateParams): IBuffer;
    }

    registerStandardSet<ICommandDateParams>("setDate",
        csafe.defs.LONG_CFG_CMDS.SETDATE_CMD,
        (params) => { return [utils.getByte(params.year, 0), params.month, params.day]; });


    //----------------------------- set timeout ------------------------------------

    export interface IBuffer {
        setTimeout(params: ICommandSetStandardValue): IBuffer;
    }

    registerStandardSet<ICommandSetStandardValue>("setTimeout",
        csafe.defs.LONG_CFG_CMDS.SETTIMEOUT_CMD,
        (params) => { return [params.value]; });


    //----------------------------- set work ------------------------------------

    export interface IBuffer {
        setWork(params: ICommandTimeParams): IBuffer;
    }

    registerStandardSet<ICommandTimeParams>("setWork",
        csafe.defs.LONG_DATA_CMDS.SETTWORK_CMD,
        (params) => { return [params.hour, params.minute, params.second]; });

    //----------------------------- set horizontal distance ------------------------------------

    export interface ICommandDistanceParams extends ICommandSetStandardValue {
        unit: Unit;
    }

    export interface IBuffer {
        setDistance(params: ICommandDistanceParams): IBuffer;
    }

    registerStandardSet<ICommandDistanceParams>("setDistance",
        csafe.defs.LONG_DATA_CMDS.SETHORIZONTAL_CMD,
        (params) => { return [utils.getByte(params.value, 0), utils.getByte(params.value, 1), params.unit]; });


    //----------------------------- set total calories ------------------------------------
    export interface IBuffer {
        setTotalCalories(params: ICommandSetStandardValue): IBuffer;
    }

    registerStandardSet<ICommandSetStandardValue>("setTotalCalories",
        csafe.defs.LONG_DATA_CMDS.SETCALORIES_CMD,
        (params) => { return [utils.getByte(params.value, 0), utils.getByte(params.value, 1)]; });

    //----------------------------- set power ------------------------------------

    export interface ICommandPowerParams extends ICommandSetStandardValue {
        unit: Unit;
    }

    export interface IBuffer {
        setPower(params: ICommandPowerParams): IBuffer;
    }

    registerStandardSet<ICommandPowerParams>("setPower",
        csafe.defs.LONG_DATA_CMDS.SETPOWER_CMD,
        (params) => { return [utils.getByte(params.value, 0), utils.getByte(params.value, 1), params.unit]; });

}