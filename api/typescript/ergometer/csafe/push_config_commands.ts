/**
 * Created by tijmen on 06-02-16.
 */

namespace ergometer.csafe {

    //----------------------------- workout type ------------------------------------

    export interface ICommandSetWorkOutType extends ICommandParamsBase {
        value : WorkoutType; //program or pre stored work out
    }
    export interface IBuffer {
        setWorkoutType(params : ICommandSetWorkOutType) : IBuffer;
    }

    registerStandardSetConfig<ICommandSetWorkOutType>("setWorkoutType",
        csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_WORKOUTTYPE,
        (params)=>{return [params.value];});
}


