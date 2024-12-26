namespace ergometer.csafe {

    //----------------------------- set workout type ------------------------------------
    export interface ICommandSetWorkoutTypeParams extends ICommandParamsBase {
        value: WorkoutType
    }
    export interface IBuffer {
        setWorkoutType(params: ICommandSetWorkoutTypeParams): IBuffer;
    }

    registerStandardProprietarySetConfig<ICommandSetWorkoutTypeParams>("setWorkoutType",
        csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_WORKOUTTYPE,
        (params) => { return [utils.getByte(params.value, 0)]; });


    //----------------------------- set workout duration ------------------------------------
    export interface ICommandSetWorkoutDurationParams extends ICommandParamsBase {
        durationType: WorkoutDurationType;
        value: number;//when the value is a time it is in 0.01 seconds
    }
    export interface IBuffer {
        
        //when using usb you need to authenticate first, please contact concept2 for this, this is not documented
        setWorkoutDuration(params: ICommandSetWorkoutDurationParams): IBuffer;
    }

    registerStandardProprietarySetConfig<ICommandSetWorkoutDurationParams>("setWorkoutDuration",
        csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_WORKOUTDURATION,
        (params) => { return [params.durationType,utils.getByte(params.value, 3),utils.getByte(params.value, 2),utils.getByte(params.value, 1),utils.getByte(params.value, 0)]; });


    //----------------------------- set rest duration ------------------------------------
    export interface ICommandsetRestDurationParams extends ICommandParamsBase {
        value: number;//when the value is a time it is in seconds
    }
    export interface IBuffer {
        setRestDuration(params: ICommandsetRestDurationParams): IBuffer;
    }

    registerStandardProprietarySetConfig<ICommandsetRestDurationParams>("setRestDuration",
        csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_RESTDURATION,
        (params) => { return [utils.getByte(params.value, 1),utils.getByte(params.value, 0)]; });


    //----------------------------- set split duration ------------------------------------
    export interface ICommandSetSplitDurationParams extends ICommandParamsBase {
        durationType: WorkoutDurationType;
        value: number;
    }
    export interface IBuffer {
        setSplitDuration(params: ICommandSetSplitDurationParams): IBuffer;
    }

    registerStandardProprietarySetConfig<ICommandSetSplitDurationParams>("setSplitDuration",
        csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_SPLITDURATION,
        (params) => { return [params.durationType,utils.getByte(params.value, 3),utils.getByte(params.value, 2),utils.getByte(params.value, 1),utils.getByte(params.value, 0)]; });

   //----------------------------- set target pace time ------------------------------------
   export interface ICommandSetTargetPaceTimeParams extends ICommandParamsBase {
    value: number; //in 0.01 seconds
}
export interface IBuffer {
    setTargetPaceTime(params: ICommandSetTargetPaceTimeParams): IBuffer;
}

registerStandardProprietarySetConfig<ICommandSetTargetPaceTimeParams>("setTargetPaceTime",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_TARGETPACETIME,
    (params) => { return [utils.getByte(params.value, 3),utils.getByte(params.value, 2),utils.getByte(params.value, 1),utils.getByte(params.value, 0)]; });

        // 
   //----------------------------- set Screen State ------------------------------------
    export interface ICommandSetScreenStateParams extends ICommandParamsBase {
        screenType: ScreenType,
        value: ScreenValue
    }
    export interface IBuffer {
        //works on usb and blue tooth
        setScreenState(params: ICommandSetScreenStateParams): IBuffer;
    }

    registerStandardProprietarySetConfig<ICommandSetScreenStateParams>("setScreenState",
        csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_SCREENSTATE,
        (params) => { return [utils.getByte(params.screenType, 0),utils.getByte(params.value, 0)]; });

//----------------------------- set Configure workout ------------------------------------
export interface ICommandsetConfigureWorkoutParams extends ICommandParamsBase {
    programmingMode: boolean;
}
export interface IBuffer {
    setConfigureWorkout(params: ICommandsetConfigureWorkoutParams): IBuffer;
}

registerStandardProprietarySetConfig<ICommandsetConfigureWorkoutParams>("setConfigureWorkout",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_CONFIGURE_WORKOUT ,
    (params) => { return [ params.programmingMode?1:0]; });


     //----------------------------- set target average watt ------------------------------------
     export interface ICommandsetTargetAverageWattParams extends ICommandParamsBase {
        value: number;
    }
    export interface IBuffer {
        setTargetAverageWatt(params: ICommandsetTargetAverageWattParams): IBuffer;
    }

    registerStandardProprietarySetConfig<ICommandsetTargetAverageWattParams>("setTargetAverageWatt",
        csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_TARGETAVGWATTS,
        (params) => { return [utils.getByte(params.value, 1),utils.getByte(params.value, 0)]; });

  //----------------------------- set target average watt ------------------------------------
  export interface ICommandssTargetCaloriesPerHourParams extends ICommandParamsBase {
    value: number;
}
export interface IBuffer {
    setTargetCaloriesPerHour(params: ICommandssTargetCaloriesPerHourParams): IBuffer;
}

registerStandardProprietarySetConfig<ICommandssTargetCaloriesPerHourParams>("setTargetCaloriesPerHour",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_TARGETCALSPERHR,
    (params) => { return [utils.getByte(params.value, 1),utils.getByte(params.value, 0)]; });

 //----------------------------- set interval type ------------------------------------
 export interface ICommandsIntervalTypeParams extends ICommandParamsBase {
    value: IntervalType;
}
export interface IBuffer {
    setIntervalType(params: ICommandsIntervalTypeParams): IBuffer;
}

registerStandardProprietarySetConfig<ICommandsIntervalTypeParams>("setIntervalType",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_INTERVALTYPE,
    (params) => { return [params.value]; });


//----------------------------- set workout interval count ------------------------------------
export interface ICommandsWorkoutIntervalCountParams extends ICommandParamsBase {
    value: number;
}
export interface IBuffer {
    //set the workout interval index number for a variable interval workout
    //when you program the first interval the index is 0
    setWorkoutIntervalCount(params: ICommandsWorkoutIntervalCountParams): IBuffer;
}

registerStandardProprietarySetConfig<ICommandsWorkoutIntervalCountParams>("setWorkoutIntervalCount",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_WORKOUTINTERVALCOUNT,
    (params) => { return [params.value]; });

}