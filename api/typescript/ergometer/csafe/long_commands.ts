
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
module ergometer.csafe {

    /*  ************************************************************
     *
     *             get the stoke state
     *
     ************************************************************ */


    export interface ICommandStrokeState  {
        received : (state : StrokeState )=>void;
        onError? : ErrorHandler;
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
                    if (params.received) params.received(data.getUint8(0))
                },
                onError:params.onError
            });
            return buffer;
        }
    })

    /*  ************************************************************
     *
     *             power curve
     *
     ************************************************************ */

    export interface ICommandPowerCurve  {
        received : (curve : number[] )=>void;
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
                    if (params.received)  {

                        var bytesReturned = data.getUint8(0); //first byte
                        monitor.traceInfo(`received power curve count ${bytesReturned}`);
                        if (bytesReturned>0) {
                            for (var i = 1; i < bytesReturned+1; i += 2) {
                                var value=data.getUint16(i,true); //in ltile endian format

                                receivePowerCurvePart.push(value);
                            }
                            monitor.traceInfo("received part :"+JSON.stringify(receivePowerCurvePart));

                            //try to get another one till it is empty and there is nothing more
                            buffer.clear().getPowerCurve({received:params.received}).send();
                        }
                        else {
                            if (receivePowerCurvePart.length>0) {
                                currentPowerCurve=receivePowerCurvePart;
                                receivePowerCurvePart=[];
                                monitor.traceInfo("Curve:"+JSON.stringify(currentPowerCurve));
                                if (params.received && currentPowerCurve.length>0)
                                    params.received(currentPowerCurve);
                            }
                        }
                    }
                }
            });
            return buffer;
        }
    })

    /*  ************************************************************
     *
     *             set program
     *
     ************************************************************ */


    export interface ICommandSetProgam  {
        program : number; //program or pre stored work out
        onError? : ErrorHandler;
    }
    export interface IBuffer {
        setProgram(params : ICommandSetProgam) : IBuffer;
    }

    commandManager.register( (buffer : IBuffer,monitor : PerformanceMonitor) =>{
        buffer.setProgram= function (params : ICommandSetProgam) : IBuffer {
            buffer.addRawCommand({
                waitForResponse:false,
                command : csafe.defs.LONG_DATA_CMDS.SETPROGRAM_CMD,
                data: [params.program,0],
                onError:params.onError
            });
            return buffer;
        }
    })

}