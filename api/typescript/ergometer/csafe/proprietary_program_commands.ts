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


//----------------------------- get hardware address ------------------------------------
export interface ICommandGetHardwareAddressParams extends ICommandParamsBase {
    onDataReceived: (hwAddress: number[]) => void;
}
export interface IBuffer {
    //read the 4 byte hardware address of the PM (most significant byte first).
    //this is needed as input for the usb authentication (setAuthenticationPassword)
    getHardwareAddress(params: ICommandGetHardwareAddressParams): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetHardwareAddressParams, number[]>("getHardwareAddress",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_HW_ADDRESS,
    (data) => { return [data.getUint8(0), data.getUint8(1), data.getUint8(2), data.getUint8(3)]; });


//----------------------------- set authentication password ------------------------------------
export interface ICommandSetAuthenticationPasswordParams extends ICommandParamsBase {
    hwAddress: number[];   //4 bytes, most significant byte first, as returned by getHardwareAddress
    password: number[];    //8 bytes, most significant byte first, provided by Concept2 to qualified developers
    onDataReceived?: (result: number) => void;  //the result byte, 0 means Ok
}
export interface IBuffer {
    //Authenticate the host to the PM so the full proprietary CSAFE command set becomes
    //available over usb (and rs485). Bluetooth does not require this.
    //The 8 byte password is the authenticating information that must be obtained from Concept2.
    setAuthenticationPassword(params: ICommandSetAuthenticationPasswordParams): IBuffer;
}

registerStandardProprietarySetConfigResponse<ICommandSetAuthenticationPasswordParams, number>("setAuthenticationPassword",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_AUTHENPASSWORD,
    (params) => { return params.hwAddress.slice(0, 4).concat(params.password.slice(0, 8)); },
    (data) => { return data.getUint8(0); });

}