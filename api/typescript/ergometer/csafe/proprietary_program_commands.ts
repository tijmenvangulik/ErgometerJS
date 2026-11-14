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
        /** ScreenValue for screen type Workout, ScreenValueCsafe for screen type Csave */
        value: ScreenValue | ScreenValueCsafe
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


//=============================================================================================
// C2 proprietary get configuration commands (GETPMCFG wrapper)
// Values are returned in the raw PM units, the same units as used by the set commands.
//=============================================================================================

//----------------------------- getFirmwareVersion ------------------------------------
export interface ICommandGetFirmwareVersion extends ICommandParamsBase {
    onDataReceived: (value: string) => void;
}
export interface IBuffer {
    /** the firmware version of the monitor as text */
    getFirmwareVersion(params: ICommandGetFirmwareVersion): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetFirmwareVersion, string>("getFirmwareVersion",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_FW_VERSION,
    (data) => { return readAscii(data, 0, 16); });

//----------------------------- getHardwareVersion ------------------------------------
export interface ICommandGetHardwareVersion extends ICommandParamsBase {
    onDataReceived: (value: string) => void;
}
export interface IBuffer {
    /** the hardware version of the monitor as text */
    getHardwareVersion(params: ICommandGetHardwareVersion): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetHardwareVersion, string>("getHardwareVersion",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_HW_VERSION,
    (data) => { return readAscii(data, 0, 16); });

//----------------------------- getDateTime ------------------------------------
export interface ICommandGetDateTime extends ICommandParamsBase {
    onDataReceived: (value: Date) => void;
}
export interface IBuffer {
    /** the date and time of the clock of the monitor (local time) */
    getDateTime(params: ICommandGetDateTime): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetDateTime, Date>("getDateTime",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_DATETIME,
    (data) => {
        //the pm uses a 12 hour clock: hours 1-12 and a meridiem byte (0 AM, 1 PM)
        var hours = data.getUint8(0) % 12 + (data.getUint8(2) ? 12 : 0);
        return new Date(data.getUint16(5, false), data.getUint8(3) - 1, data.getUint8(4), hours, data.getUint8(1));
    });

//----------------------------- getScreenStateStatus ------------------------------------
export interface IScreenStateStatus {
    screenType: ScreenType;
    screenValue: ScreenValue;
    status: number;   //0 inactive, 1 pending, 2 in progress
}
export interface ICommandGetScreenStateStatus extends ICommandParamsBase {
    onDataReceived: (value: IScreenStateStatus) => void;
}
export interface IBuffer {
    /** the state of the last screen state command (setScreenState) */
    getScreenStateStatus(params: ICommandGetScreenStateStatus): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetScreenStateStatus, IScreenStateStatus>("getScreenStateStatus",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_SCREENSTATESTATUS,
    (data) => { return { screenType: data.getUint8(0), screenValue: data.getUint8(1), status: data.getUint8(2) }; });

//----------------------------- getHeartRateMonitor ------------------------------------
export interface IHeartRateMonitorInfo {
    status: number;          //0 inactive, 1 discovery, 2 paired
    manufacturerId: number;
    deviceType: number;
    deviceNumber: number;
}
export interface ICommandGetHeartRateMonitor extends ICommandParamsBase {
    onDataReceived: (value: IHeartRateMonitorInfo) => void;
}
export interface IBuffer {
    /** the ant heart rate monitor which is paired with the monitor (2 byte device number) */
    getHeartRateMonitor(params: ICommandGetHeartRateMonitor): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetHeartRateMonitor, IHeartRateMonitorInfo>("getHeartRateMonitor",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_HRM,
    (data) => { return { status: data.getUint8(0), manufacturerId: data.getUint8(1), deviceType: data.getUint8(2), deviceNumber: data.getUint16(3, false) }; });

//----------------------------- getDisplayType ------------------------------------
export interface ICommandGetDisplayType extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the display type (standard, force velocity, pace boat, per stroke, simple, target) */
    getDisplayType(params: ICommandGetDisplayType): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetDisplayType, number>("getDisplayType",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_DISPLAYTYPE,
    (data) => { return data.getUint8(0); });

//----------------------------- getDisplayUnits ------------------------------------
export interface ICommandGetDisplayUnits extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the display units (time/meters, pace, watts, caloric burn rate, calories) */
    getDisplayUnits(params: ICommandGetDisplayUnits): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetDisplayUnits, number>("getDisplayUnits",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_DISPLAYUNITS,
    (data) => { return data.getUint8(0); });

//----------------------------- getLanguageType ------------------------------------
export interface ICommandGetLanguageType extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the language of the monitor */
    getLanguageType(params: ICommandGetLanguageType): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetLanguageType, number>("getLanguageType",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_LANGUAGETYPE,
    (data) => { return data.getUint8(0); });

//----------------------------- getOperationalState ------------------------------------
export interface ICommandGetOperationalState extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the operational state of the monitor (reset, ready, workout, warmup, race, power off ...) */
    getOperationalState(params: ICommandGetOperationalState): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetOperationalState, number>("getOperationalState",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_OPERATIONALSTATE,
    (data) => { return data.getUint8(0); });

//----------------------------- getRowingState ------------------------------------
export interface ICommandGetRowingState extends ICommandParamsBase {
    onDataReceived: (value: RowingState) => void;
}
export interface IBuffer {
    /** is the user rowing (active) or not (inactive) */
    getRowingState(params: ICommandGetRowingState): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetRowingState, RowingState>("getRowingState",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_ROWINGSTATE,
    (data) => { return data.getUint8(0); });

//----------------------------- getBatteryLevelPercent ------------------------------------
export interface ICommandGetBatteryLevelPercent extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the battery level in percent */
    getBatteryLevelPercent(params: ICommandGetBatteryLevelPercent): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetBatteryLevelPercent, number>("getBatteryLevelPercent",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_BATTERYLEVELPERCENT,
    (data) => { return data.getUint8(0); });

//----------------------------- getWorkoutDuration ------------------------------------
export interface IWorkoutDuration {
    durationType: WorkoutDurationType;
    value: number;  //time in 0.01 seconds, distance in meters (same units as setWorkoutDuration)
}
export interface ICommandGetWorkoutDuration extends ICommandParamsBase {
    onDataReceived: (value: IWorkoutDuration) => void;
}
export interface IBuffer {
    /** the programmed workout duration, the counterpart of setWorkoutDuration */
    getWorkoutDuration(params: ICommandGetWorkoutDuration): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetWorkoutDuration, IWorkoutDuration>("getWorkoutDuration",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_WORKOUTDURATION,
    (data) => { return { durationType: data.getUint8(0), value: data.getUint32(1, false) }; });

//----------------------------- getWorkOther ------------------------------------
export interface ICommandGetWorkOther extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the work other value (calories or watt minutes for those workout types) */
    getWorkOther(params: ICommandGetWorkOther): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetWorkOther, number>("getWorkOther",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_WORKOTHER,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getExtendedHeartRateMonitor ------------------------------------
export interface ICommandGetExtendedHeartRateMonitor extends ICommandParamsBase {
    onDataReceived: (value: IHeartRateMonitorInfo) => void;
}
export interface IBuffer {
    /** the heart rate monitor which is paired with the monitor (4 byte device number, ant and bluetooth) */
    getExtendedHeartRateMonitor(params: ICommandGetExtendedHeartRateMonitor): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetExtendedHeartRateMonitor, IHeartRateMonitorInfo>("getExtendedHeartRateMonitor",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_EXTENDED_HRM,
    (data) => { return { status: data.getUint8(0), manufacturerId: data.getUint8(1), deviceType: data.getUint8(2), deviceNumber: data.getUint32(3, false) }; });

//----------------------------- getFlywheelSpeed ------------------------------------
export interface ICommandGetFlywheelSpeed extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the flywheel speed in rpm */
    getFlywheelSpeed(params: ICommandGetFlywheelSpeed): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetFlywheelSpeed, number>("getFlywheelSpeed",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_FLYWHEELSPEED,
    (data) => { return data.getUint16(0, false); });

//----------------------------- getErgMachineType ------------------------------------
export interface ICommandGetErgMachineType extends ICommandParamsBase {
    onDataReceived: (value: ErgmachineType) => void;
}
export interface IBuffer {
    /** the type of the machine (rower model, ski erg, bike erg ...) */
    getErgMachineType(params: ICommandGetErgMachineType): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetErgMachineType, ErgmachineType>("getErgMachineType",
    csafe.defs.PM_SHORT_PULL_CFG_CMDS.PM_GET_ERGMACHINETYPE,
    (data) => { return data.getUint8(0); });

//=============================================================================================
// C2 proprietary get data commands (GETPMDATA wrapper)
// All values are returned in raw PM units, most significant byte first.
// Times are in 0.01 seconds and distances in meters (checked on a PM5: split distance 52 at 52.8 m rowed).
//=============================================================================================

//----------------------------- getProjectedWorkTime ------------------------------------
export interface ICommandGetProjectedWorkTime extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** projected work time in 0.01 seconds */
    getProjectedWorkTime(params: ICommandGetProjectedWorkTime): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetProjectedWorkTime, number>("getProjectedWorkTime",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_PROJECTED_WORKTIME,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getTotalRestTime ------------------------------------
export interface ICommandGetTotalRestTime extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** total rest time in 0.01 seconds */
    getTotalRestTime(params: ICommandGetTotalRestTime): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetTotalRestTime, number>("getTotalRestTime",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_TOTAL_RESTTIME,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getTotalWorkDistance ------------------------------------
export interface ICommandGetTotalWorkDistance extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** total work distance in meters */
    getTotalWorkDistance(params: ICommandGetTotalWorkDistance): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetTotalWorkDistance, number>("getTotalWorkDistance",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_TOTAL_WORKDISTANCE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getProjectedWorkDistance ------------------------------------
export interface ICommandGetProjectedWorkDistance extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** projected work distance in meters */
    getProjectedWorkDistance(params: ICommandGetProjectedWorkDistance): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetProjectedWorkDistance, number>("getProjectedWorkDistance",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_PROJECTED_WORKDISTANCE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getTotalRestDistance ------------------------------------
export interface ICommandGetTotalRestDistance extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** total rest distance in meters */
    getTotalRestDistance(params: ICommandGetTotalRestDistance): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetTotalRestDistance, number>("getTotalRestDistance",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_TOTAL_RESTDISTANCE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getStroke500mPace ------------------------------------
export interface ICommandGetStroke500mPace extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** pace per 500m of the last stroke in 0.01 seconds */
    getStroke500mPace(params: ICommandGetStroke500mPace): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetStroke500mPace, number>("getStroke500mPace",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKE_500MPACE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getStrokePower ------------------------------------
export interface ICommandGetStrokePower extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** power of the last stroke in watts */
    getStrokePower(params: ICommandGetStrokePower): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetStrokePower, number>("getStrokePower",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKE_POWER,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getStrokeCaloricBurnRate ------------------------------------
export interface ICommandGetStrokeCaloricBurnRate extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** caloric burn rate of the last stroke in calories per hour */
    getStrokeCaloricBurnRate(params: ICommandGetStrokeCaloricBurnRate): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetStrokeCaloricBurnRate, number>("getStrokeCaloricBurnRate",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKE_CALORICBURNRATE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getSplitAvg500mPace ------------------------------------
export interface ICommandGetSplitAvg500mPace extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average pace per 500m of the current split in 0.01 seconds */
    getSplitAvg500mPace(params: ICommandGetSplitAvg500mPace): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetSplitAvg500mPace, number>("getSplitAvg500mPace",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_SPLIT_AVG_500MPACE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getSplitAvgPower ------------------------------------
export interface ICommandGetSplitAvgPower extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average power of the current split in watts */
    getSplitAvgPower(params: ICommandGetSplitAvgPower): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetSplitAvgPower, number>("getSplitAvgPower",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_SPLIT_AVG_POWER,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getSplitAvgCaloricBurnRate ------------------------------------
export interface ICommandGetSplitAvgCaloricBurnRate extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average caloric burn rate of the current split in calories per hour */
    getSplitAvgCaloricBurnRate(params: ICommandGetSplitAvgCaloricBurnRate): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetSplitAvgCaloricBurnRate, number>("getSplitAvgCaloricBurnRate",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_SPLIT_AVG_CALORICBURNRATE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getSplitAvgCalories ------------------------------------
export interface ICommandGetSplitAvgCalories extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average calories of the current split */
    getSplitAvgCalories(params: ICommandGetSplitAvgCalories): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetSplitAvgCalories, number>("getSplitAvgCalories",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_SPLIT_AVG_CALORIES,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getTotalAvg500mPace ------------------------------------
export interface ICommandGetTotalAvg500mPace extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average pace per 500m of the workout in 0.01 seconds */
    getTotalAvg500mPace(params: ICommandGetTotalAvg500mPace): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetTotalAvg500mPace, number>("getTotalAvg500mPace",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_TOTAL_AVG_500MPACE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getTotalAvgPower ------------------------------------
export interface ICommandGetTotalAvgPower extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average power of the workout in watts */
    getTotalAvgPower(params: ICommandGetTotalAvgPower): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetTotalAvgPower, number>("getTotalAvgPower",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_TOTAL_AVG_POWER,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getTotalAvgCaloricBurnRate ------------------------------------
export interface ICommandGetTotalAvgCaloricBurnRate extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average caloric burn rate of the workout in calories per hour */
    getTotalAvgCaloricBurnRate(params: ICommandGetTotalAvgCaloricBurnRate): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetTotalAvgCaloricBurnRate, number>("getTotalAvgCaloricBurnRate",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_TOTAL_AVG_CALORICBURNRATE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getTotalAvgCalories ------------------------------------
export interface ICommandGetTotalAvgCalories extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average calories of the workout */
    getTotalAvgCalories(params: ICommandGetTotalAvgCalories): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetTotalAvgCalories, number>("getTotalAvgCalories",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_TOTAL_AVG_CALORIES,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getSplitTime ------------------------------------
export interface ICommandGetSplitTime extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** elapsed time of the current split in 0.01 seconds */
    getSplitTime(params: ICommandGetSplitTime): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetSplitTime, number>("getSplitTime",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_SPLITTIME,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getLastSplitTime ------------------------------------
export interface ICommandGetLastSplitTime extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** elapsed time of the last split in 0.01 seconds */
    getLastSplitTime(params: ICommandGetLastSplitTime): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetLastSplitTime, number>("getLastSplitTime",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_LASTSPLITTIME,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getSplitDistance ------------------------------------
export interface ICommandGetSplitDistance extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** work distance of the current split in meters */
    getSplitDistance(params: ICommandGetSplitDistance): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetSplitDistance, number>("getSplitDistance",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_SPLITDISTANCE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getLastSplitDistance ------------------------------------
export interface ICommandGetLastSplitDistance extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** work distance of the last split in meters */
    getLastSplitDistance(params: ICommandGetLastSplitDistance): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetLastSplitDistance, number>("getLastSplitDistance",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_LASTSPLITDISTANCE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getLastRestDistance ------------------------------------
export interface ICommandGetLastRestDistance extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** distance of the last rest interval in meters */
    getLastRestDistance(params: ICommandGetLastRestDistance): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetLastRestDistance, number>("getLastRestDistance",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_LASTRESTDISTANCE,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getTargetPaceTime ------------------------------------
export interface ICommandGetTargetPaceTime extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** target pace time in 0.01 seconds, the counterpart of setTargetPaceTime */
    getTargetPaceTime(params: ICommandGetTargetPaceTime): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetTargetPaceTime, number>("getTargetPaceTime",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_TARGETPACETIME,
    (data) => { return data.getUint32(0, false); });

//----------------------------- getRestDistance ------------------------------------
export interface ICommandGetRestDistance extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** rest distance in meters */
    getRestDistance(params: ICommandGetRestDistance): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetRestDistance, number>("getRestDistance",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_RESTDISTANCE,
    (data) => { return data.getUint16(0, false); });

//----------------------------- getStrokeRate ------------------------------------
export interface ICommandGetStrokeRate extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** stroke rate in strokes per minute */
    getStrokeRate(params: ICommandGetStrokeRate): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetStrokeRate, number>("getStrokeRate",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKERATE,
    (data) => { return data.getUint8(0); });

//----------------------------- getSplitAvgStrokeRate ------------------------------------
export interface ICommandGetSplitAvgStrokeRate extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average stroke rate of the current split/interval */
    getSplitAvgStrokeRate(params: ICommandGetSplitAvgStrokeRate): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetSplitAvgStrokeRate, number>("getSplitAvgStrokeRate",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_SPLIT_AVG_STROKERATE,
    (data) => { return data.getUint8(0); });

//----------------------------- getTotalAvgStrokeRate ------------------------------------
export interface ICommandGetTotalAvgStrokeRate extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average stroke rate of the workout */
    getTotalAvgStrokeRate(params: ICommandGetTotalAvgStrokeRate): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetTotalAvgStrokeRate, number>("getTotalAvgStrokeRate",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_TOTAL_AVG_STROKERATE,
    (data) => { return data.getUint8(0); });

//----------------------------- getAvgHeartRate ------------------------------------
export interface ICommandGetAvgHeartRate extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average heart rate in beats per minute */
    getAvgHeartRate(params: ICommandGetAvgHeartRate): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetAvgHeartRate, number>("getAvgHeartRate",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_AVG_HEARTRATE,
    (data) => { return data.getUint8(0); });

//----------------------------- getEndingAvgHeartRate ------------------------------------
export interface ICommandGetEndingAvgHeartRate extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average heart rate of the current split/interval */
    getEndingAvgHeartRate(params: ICommandGetEndingAvgHeartRate): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetEndingAvgHeartRate, number>("getEndingAvgHeartRate",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_ENDING_AVG_HEARTRATE,
    (data) => { return data.getUint8(0); });

//----------------------------- getRestAvgHeartRate ------------------------------------
export interface ICommandGetRestAvgHeartRate extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** average heart rate of the rest interval */
    getRestAvgHeartRate(params: ICommandGetRestAvgHeartRate): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetRestAvgHeartRate, number>("getRestAvgHeartRate",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_REST_AVG_HEARTRATE,
    (data) => { return data.getUint8(0); });

//----------------------------- getStrokeRateState ------------------------------------
export interface ICommandGetStrokeRateState extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the stroke rate state */
    getStrokeRateState(params: ICommandGetStrokeRateState): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetStrokeRateState, number>("getStrokeRateState",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_STROKERATESTATE,
    (data) => { return data.getUint8(0); });

//----------------------------- getHeartRateState ------------------------------------
export interface ICommandGetHeartRateState extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the heart rate state */
    getHeartRateState(params: ICommandGetHeartRateState): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetHeartRateState, number>("getHeartRateState",
    csafe.defs.PM_SHORT_PULL_DATA_CMDS.PM_GET_HEARTRATESTATE,
    (data) => { return data.getUint8(0); });

//=============================================================================================
// C2 proprietary long get commands which send a parameter
//=============================================================================================

//----------------------------- getUserIdString ------------------------------------
export interface ICommandGetUserIdString extends ICommandParamsBase {
    userNumber: number;
    onDataReceived: (value: string) => void;
}
export interface IBuffer {
    /** the user id string of a log card / internal user */
    getUserIdString(params: ICommandGetUserIdString): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetUserIdString, string>("getUserIdString",
    csafe.defs.PM_LONG_PULL_CFG_CMDS.PM_GET_USERIDSTRING,
    (data) => { return readAscii(data, 0, 10); },
    (params) => { return [params.userNumber]; });

//----------------------------- getUserIdNumber ------------------------------------
export interface IUserIdNumber {
    userNumber: number;
    userId: number;
}
export interface ICommandGetUserIdNumber extends ICommandParamsBase {
    userNumber: number;
    onDataReceived: (value: IUserIdNumber) => void;
}
export interface IBuffer {
    /** the numeric user id of a user, the counterpart of setUserIdNumber */
    getUserIdNumber(params: ICommandGetUserIdNumber): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetUserIdNumber, IUserIdNumber>("getUserIdNumber",
    csafe.defs.PM_LONG_PULL_CFG_CMDS.PM_GET_USER_ID,
    (data) => { return { userNumber: data.getUint8(0), userId: data.getUint32(1, false) }; },
    (params) => { return [params.userNumber]; });

//----------------------------- getUserProfile ------------------------------------
export interface IUserProfile {
    userNumber: number;
    weight: number;
    dobDay: number;
    dobMonth: number;
    dobYear: number;
    gender: number;
}
export interface ICommandGetUserProfile extends ICommandParamsBase {
    userNumber: number;
    onDataReceived: (value: IUserProfile) => void;
}
export interface IBuffer {
    /** the profile (weight, date of birth, gender) of a user */
    getUserProfile(params: ICommandGetUserProfile): IBuffer;
}

registerStandardProprietaryGetConfig<ICommandGetUserProfile, IUserProfile>("getUserProfile",
    csafe.defs.PM_LONG_PULL_CFG_CMDS.PM_GET_USER_PROFILE,
    (data) => {
        return {
            userNumber: data.getUint8(0),
            weight: data.getUint16(1, false),
            dobDay: data.getUint8(3),
            dobMonth: data.getUint8(4),
            dobYear: data.getUint16(5, false),
            gender: data.getUint8(7)
        };
    },
    (params) => { return [params.userNumber]; });

//----------------------------- getHeartbeatData ------------------------------------
export interface ICommandGetHeartbeatData extends ICommandParamsBase {
    blockLength?: number;  //number of bytes to read, max and default 32 (16 values)
    onDataReceived: (value: number[]) => void;
}
export interface IBuffer {
    /** the heart beat samples recorded since the last read (16 bit values) */
    getHeartbeatData(params: ICommandGetHeartbeatData): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetHeartbeatData, number[]>("getHeartbeatData",
    csafe.defs.PM_LONG_PULL_DATA_CMDS.PM_GET_HEARTBEATDATA,
    (data) => {
        //byte 0 is the number of valid bytes, followed by the samples, least significant byte first
        var bytesRead = Math.min(data.getUint8(0), data.byteLength - 1);
        var result: number[] = [];
        for (var i = 1; i + 1 <= bytesRead; i += 2)
            result.push(data.getUint16(i, true));
        return result;
    },
    (params) => { return [Math.min(params.blockLength || 32, 32)]; });

//----------------------------- getUIEvents ------------------------------------
export interface ICommandGetUIEvents extends ICommandParamsBase {
    onDataReceived: (value: number) => void;
}
export interface IBuffer {
    /** the user interface events (button presses) of the monitor as a 16 bit value */
    getUIEvents(params: ICommandGetUIEvents): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetUIEvents, number>("getUIEvents",
    csafe.defs.PM_LONG_PULL_DATA_CMDS.PM_GET_UI_EVENTS,
    (data) => { return data.getUint16(0, false); },
    (params) => { return [0]; });

//----------------------------- getGameScore ------------------------------------
export interface IGameScore {
    gameId: number;
    score: number;   //fish/darts 1 point, target 0.1%
}
export interface ICommandGetGameScore extends ICommandParamsBase {
    onDataReceived: (value: IGameScore) => void;
}
export interface IBuffer {
    getGameScore(params: ICommandGetGameScore): IBuffer;
}

registerStandardProprietaryGetData<ICommandGetGameScore, IGameScore>("getGameScore",
    csafe.defs.PM_LONG_PULL_DATA_CMDS.PM_GET_GAME_SCORE,
    (data) => { return { gameId: data.getUint8(0), score: data.getUint16(1, false) }; },
    (params) => { return [0]; });

//=============================================================================================
// C2 proprietary set configuration commands (SETPMCFG wrapper)
//=============================================================================================

//----------------------------- setDateTime ------------------------------------
export interface ICommandSetDateTimeParams extends ICommandParamsBase {
    value: Date;  //local time
}
export interface IBuffer {
    /** set the clock of the monitor */
    setDateTime(params: ICommandSetDateTimeParams): IBuffer;
}

registerStandardProprietarySetConfig<ICommandSetDateTimeParams>("setDateTime",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_DATETIME,
    (params) => {
        var d = params.value;
        var hours = d.getHours() % 12;
        if (hours === 0) hours = 12; //the pm uses a 12 hour clock 1-12
        return [hours, d.getMinutes(), d.getHours() >= 12 ? 1 : 0, d.getMonth() + 1, d.getDate()]
            .concat(uint16ToBytesMSB(d.getFullYear()));
    });

//----------------------------- setLanguageType ------------------------------------
export interface IBuffer {
    setLanguageType(params: ICommandSetStandardValue): IBuffer;
}

registerStandardProprietarySetConfig<ICommandSetStandardValue>("setLanguageType",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_LANGUAGETYPE,
    (params) => { return [params.value]; });

//----------------------------- setScreenErrorMode ------------------------------------
export interface ICommandSetScreenErrorModeParams extends ICommandParamsBase {
    enabled: boolean;
}
export interface IBuffer {
    /** enable or disable the display of error screens on the monitor */
    setScreenErrorMode(params: ICommandSetScreenErrorModeParams): IBuffer;
}

registerStandardProprietarySetConfig<ICommandSetScreenErrorModeParams>("setScreenErrorMode",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_SCREENERRORMODE,
    (params) => { return [params.enabled ? 1 : 0]; });

//----------------------------- setUserIdNumber ------------------------------------
export interface ICommandSetUserIdNumberParams extends ICommandParamsBase {
    userNumber: number;
    userId: number;
}
export interface IBuffer {
    setUserIdNumber(params: ICommandSetUserIdNumberParams): IBuffer;
}

registerStandardProprietarySetConfig<ICommandSetUserIdNumberParams>("setUserIdNumber",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_USER_ID,
    (params) => { return [params.userNumber].concat(uint32ToBytesMSB(params.userId)); });

//----------------------------- setUserProfile ------------------------------------
export interface ICommandSetUserProfileParams extends ICommandParamsBase {
    userNumber: number;
    weight: number;
    dobDay: number;
    dobMonth: number;
    dobYear: number;
    gender: number;
}
export interface IBuffer {
    setUserProfile(params: ICommandSetUserProfileParams): IBuffer;
}

registerStandardProprietarySetConfig<ICommandSetUserProfileParams>("setUserProfile",
    csafe.defs.PM_LONG_PUSH_CFG_CMDS.PM_SET_USER_PROFILE,
    (params) => {
        return [params.userNumber]
            .concat(uint16ToBytesMSB(params.weight))
            .concat([params.dobDay, params.dobMonth])
            .concat(uint16ToBytesMSB(params.dobYear))
            .concat([params.gender]);
    });

//=============================================================================================
// C2 proprietary set data commands (SETPMDATA wrapper)
//=============================================================================================

//----------------------------- setDisplayString ------------------------------------
export interface ICommandSetDisplayStringParams extends ICommandParamsBase {
    value: string;  //max 32 characters, over bluetooth max 13 (a request must fit in one 20 byte packet)
}
export interface IBuffer {
    /** show a text on the display of the monitor (max 32 characters, bluetooth max 13)
     * experimental: the PM5 accepts the command but does not show the text yet, also not after
     * setScreenState({screenType:ScreenType.Csave, value:ScreenValueCsafe.Custom}) */
    setDisplayString(params: ICommandSetDisplayStringParams): IBuffer;
}

registerStandardProprietarySetData<ICommandSetDisplayStringParams>("setDisplayString",
    csafe.defs.PM_LONG_PUSH_DATA_CMDS.PM_SET_DISPLAYSTRING,
    (params) => { var text = (params.value || "").substr(0, 32); return asciiToBytes(text, text.length); });

//----------------------------- setGameParams ------------------------------------
export interface ICommandSetGameParams extends ICommandParamsBase {
    gameType: number;
    workoutDuration: number;    //0.01 seconds
    splitDuration: number;      //0.01 seconds
    targetPaceTime: number;     //0.01 seconds
    targetAvgWatts: number;
    targetCaloriesPerHour: number;
    targetStrokeRate: number;
}
export interface IBuffer {
    /** usb only: the request is 29 bytes, too big for one 20 byte bluetooth packet */
    setGameParams(params: ICommandSetGameParams): IBuffer;
}

registerStandardProprietarySetData<ICommandSetGameParams>("setGameParams",
    csafe.defs.PM_LONG_PUSH_DATA_CMDS.PM_SET_GAMEPARAMS,
    (params) => {
        return [params.gameType]
            .concat(uint32ToBytesMSB(params.workoutDuration))
            .concat(uint32ToBytesMSB(params.splitDuration))
            .concat(uint32ToBytesMSB(params.targetPaceTime))
            .concat(uint32ToBytesMSB(params.targetAvgWatts))
            .concat(uint32ToBytesMSB(params.targetCaloriesPerHour))
            .concat([params.targetStrokeRate]);
    });

//----------------------------- setExtendedHeartRateMonitor ------------------------------------
export interface ICommandSetExtendedHeartRateMonitorParams extends ICommandParamsBase {
    manufacturerId: number;
    deviceType: number;
    deviceNumber: number;   //4 byte belt id
}
export interface IBuffer {
    /** pair a heart rate belt with the monitor */
    setExtendedHeartRateMonitor(params: ICommandSetExtendedHeartRateMonitorParams): IBuffer;
}

registerStandardProprietarySetData<ICommandSetExtendedHeartRateMonitorParams>("setExtendedHeartRateMonitor",
    csafe.defs.PM_LONG_PUSH_DATA_CMDS.PM_SET_EXTENDED_HRM,
    (params) => { return [params.manufacturerId, params.deviceType].concat(uint32ToBytesMSB(params.deviceNumber)); });

//----------------------------- setLedBacklight ------------------------------------
export interface ICommandSetLedBacklightParams extends ICommandParamsBase {
    enabled: boolean;
    intensity: number;  //0 - 100 %
}
export interface IBuffer {
    setLedBacklight(params: ICommandSetLedBacklightParams): IBuffer;
}

registerStandardProprietarySetData<ICommandSetLedBacklightParams>("setLedBacklight",
    csafe.defs.PM_LONG_PUSH_DATA_CMDS.PM_SET_LEDBACKLIGHT,
    (params) => { return [params.enabled ? 1 : 0, Math.max(0, Math.min(100, Math.round(params.intensity)))]; });

}
