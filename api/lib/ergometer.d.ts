/**
 *
 * Created by tijmen on 01-06-15.
 *
 * License:
 *
 * Copyright 2016 Tijmen van Gulik (tijmen@vangulik.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
declare namespace ergometer.pubSub {
    interface ISubscription {
        (...args: any[]): void;
    }
    interface ISubscriptionItem {
        object: any;
        func: ISubscription;
    }
    interface IDictionary {
        [name: string]: ISubscriptionItem[];
    }
    class PubSub {
        private registry;
        pub(name: string, ...args: any[]): void;
        pubASync(name: string, ...args: any[]): void;
        sub(applyObject: any, name: string, fn: ISubscription): void;
        unsub(name: string, fn: ISubscription): void;
        subscribeCount(name: string): number;
    }
    interface ISubscriptionChanged {
        (sender: any, count: number): void;
    }
    class Event<T extends ISubscription> {
        protected _subscribed: ISubscriptionItem[];
        protected _subScriptionChangedEvent: ISubscriptionChanged;
        protected doChangedEvent(): void;
        protected findSubscription(event: T): ISubscriptionItem;
        sub(applyObject: any, event: T): void;
        unsub(event: T): void;
        protected doPub(args: any[]): void;
        pub: T;
        pubAsync: T;
        count: number;
        registerChangedEvent(func: ISubscriptionChanged): void;
    }
}
/**
 * Created by tijmen on 01-02-16.
 */
declare module ergometer.ble {
    interface IDevice {
        address: string;
        name: string;
        rssi: number;
        _internalDevice: any;
    }
    interface IFoundFunc {
        (device: IDevice): void;
    }
    interface IDriver {
        startScan(foundFn?: IFoundFunc): Promise<void>;
        stopScan(): any;
        connect(device: IDevice, disconnectFn: () => void): Promise<void>;
        disconnect(): any;
        writeCharacteristic(serviceUIID: string, characteristicUUID: string, data: ArrayBufferView): Promise<void>;
        readCharacteristic(serviceUIID: string, characteristicUUID: string): Promise<ArrayBuffer>;
        enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<any>;
        disableNotification(serviceUIID: string, characteristicUUID: string): Promise<any>;
    }
}
/**
 * Created by tijmen on 01-02-16.
 */
declare module ergometer.ble {
    class DriverBleat implements IDriver {
        private _device;
        private _initialized;
        private getCharacteristic(serviceUid, characteristicUid);
        connect(device: IDevice, disconnectFn: () => void): Promise<void>;
        disconnect(): Promise<void>;
        init(): Promise<any>;
        startScan(foundFn?: IFoundFunc): Promise<void>;
        stopScan(): Promise<void>;
        writeCharacteristic(serviceUIID: string, characteristicUUID: string, data: ArrayBufferView): Promise<void>;
        readCharacteristic(serviceUIID: string, characteristicUUID: string): Promise<ArrayBuffer>;
        enableNotification(serviceUIID: string, characteristicUUID: string, receive: (data: ArrayBuffer) => void): Promise<any>;
        disableNotification(serviceUIID: string, characteristicUUID: string): Promise<any>;
    }
}
/**
 * Created by tijmen on 28-12-15.
 */
declare module ergometer {
    const enum RowingSampleRate {
        rate1sec = 0,
        rate500ms = 1,
        rate250ms = 2,
        rate100ms = 3,
    }
    const enum ErgmachineType {
        staticD = 0,
        staticC = 1,
        staticA = 2,
        staticB = 3,
        staticE = 5,
        staticDynamic = 8,
        slidesA = 16,
        slidesB = 17,
        slidesC = 18,
        slidesD = 19,
        slidesE = 20,
        slidesDynamic = 32,
        staticDyno = 64,
        staticSki = 128,
        num = 129,
    }
    const enum WorkoutType {
        justrowNoAplits = 0,
        justrowAplits = 1,
        fixeddistNoAplits = 2,
        fixeddistAplits = 3,
        fixedtimeNoAplits = 4,
        fixedtimeAplits = 5,
        fixedtimeInterval = 6,
        fixeddistInterval = 7,
        variableInterval = 8,
        variableUndefinedRestInterval = 9,
        fixedCalorie = 10,
        fixedWattMinutes = 11,
        num = 12,
    }
    const enum IntervalType {
        time = 0,
        dist = 1,
        rest = 2,
        timertUndefined = 3,
        distanceRestUndefined = 4,
        restUndefined = 5,
        cal = 6,
        calRestUndefined = 7,
        wattMinute = 8,
        wattMinuteRestUndefined = 9,
        none = 255,
    }
    const enum WorkoutState {
        waitToBegin = 0,
        workoutRow = 1,
        countDownPause = 2,
        intervalRest = 3,
        intervalWorktime = 4,
        intervalWorkDistance = 5,
        intervalRestEndToWorkTime = 6,
        intervalRestEndToWorkDistance = 7,
        intervalWorktimeTorest = 8,
        intervalWorkDistanceToEest = 9,
        workoutEnd = 10,
        terminate = 11,
        workoutLogged = 12,
        rearm = 13,
    }
    const enum RowingState {
        inactive = 0,
        active = 1,
    }
    const enum StrokeState {
        waitingForWheelToReachMinSpeedState = 0,
        waitingForWheelToAccelerateState = 1,
        drivingState = 2,
        dwellingAfterDriveState = 3,
        recoveryState = 4,
    }
    const enum WorkoutDurationType {
        timeDuration = 0,
        caloriesDuration = 64,
        distanceDuration = 128,
        wattsDuration = 192,
    }
    const enum SampleRate {
        rate1sec = 0,
        rate500ms = 1,
        rate250ms = 2,
        rate100ms = 3,
    }
    interface RowingGeneralStatus {
        elapsedTime: number;
        distance: number;
        workoutType: WorkoutType;
        intervalType: IntervalType;
        workoutState: WorkoutState;
        rowingState: RowingState;
        strokeState: StrokeState;
        totalWorkDistance: number;
        workoutDuration: number;
        workoutDurationType: WorkoutDurationType;
        dragFactor: number;
    }
    interface RowingAdditionalStatus1 {
        elapsedTime: number;
        speed: number;
        strokeRate: number;
        heartRate: number;
        currentPace: number;
        averagePace: number;
        restDistance: number;
        restTime: number;
        averagePower: number;
    }
    interface RowingAdditionalStatus2 {
        elapsedTime: number;
        intervalCount: number;
        averagePower: number;
        totalCalories: number;
        splitAveragePace: number;
        splitAveragePower: number;
        splitAverageCalories: number;
        lastSplitTime: number;
        lastSplitDistance: number;
    }
    interface RowingStrokeData {
        elapsedTime: number;
        distance: number;
        driveLength: number;
        driveTime: number;
        strokeRecoveryTime: number;
        strokeDistance: number;
        peakDriveForce: number;
        averageDriveForce: number;
        workPerStroke: number;
        strokeCount: number;
    }
    interface RowingAdditionalStrokeData {
        elapsedTime: number;
        strokePower: number;
        strokeCalories: number;
        strokeCount: number;
        projectedWorkTime: number;
        projectedWorkDistance: number;
        workPerStroke: number;
    }
    interface RowingSplitIntervalData {
        elapsedTime: number;
        distance: number;
        intervalTime: number;
        intervalDistance: number;
        intervalRestTime: number;
        intervalRestDistance: number;
        intervalType: IntervalType;
        intervalNumber: number;
    }
    interface RowingAdditionalSplitIntervalData {
        elapsedTime: number;
        intervalAverageStrokeRate: number;
        intervalWorkHeartrate: number;
        intervalRestHeartrate: number;
        intervalAveragePace: number;
        intervalTotalCalories: number;
        intervalAverageCalories: number;
        intervalSpeed: number;
        intervalPower: number;
        splitAverageDragFactor: number;
        intervalNumber: number;
    }
    interface WorkoutSummaryData {
        logEntryDate: number;
        logEntryTime: number;
        elapsedTime: number;
        distance: number;
        averageStrokeRate: number;
        endingHeartrate: number;
        averageHeartrate: number;
        minHeartrate: number;
        maxHeartrate: number;
        dragFactorAverage: number;
        recoveryHeartRate: number;
        workoutType: WorkoutType;
        averagePace: number;
    }
    interface AdditionalWorkoutSummaryData {
        logEntryDate: number;
        logEntryTime: number;
        intervalType: IntervalType;
        intervalSize: number;
        intervalCount: number;
        totalCalories: number;
        watts: number;
        totalRestDistance: number;
        intervalRestTime: number;
        averageCalories: number;
    }
    interface AdditionalWorkoutSummaryData2 {
        logEntryDate: number;
        logEntryTime: number;
        averagePace: number;
        gameIdentifier: number;
        gameScore: number;
        ergMachineType: ErgmachineType;
    }
    interface HeartRateBeltInformation {
        manufacturerId: number;
        deviceType: number;
        beltId: number;
    }
}
/**
 * Created by tijmen on 16-01-16.
 *
 * translation of concept 2 csafe.h to typescript version  9/16/08 10:51a
 */
declare module ergometer.csafe.defs {
    const EXT_FRAME_START_BYTE: number;
    const FRAME_START_BYTE: number;
    const FRAME_END_BYTE: number;
    const FRAME_STUFF_BYTE: number;
    const FRAME_MAX_STUFF_OFFSET_BYTE: number;
    const FRAME_FLG_LEN: number;
    const EXT_FRAME_ADDR_LEN: number;
    const FRAME_CHKSUM_LEN: number;
    const SHORT_CMD_TYPE_MSK: number;
    const LONG_CMD_HDR_LENGTH: number;
    const LONG_CMD_BYTE_CNT_OFFSET: number;
    const RSP_HDR_LENGTH: number;
    const FRAME_STD_TYPE: number;
    const FRAME_EXT_TYPE: number;
    const DESTINATION_ADDR_HOST: number;
    const DESTINATION_ADDR_ERG_MASTER: number;
    const DESTINATION_ADDR_BROADCAST: number;
    const DESTINATION_ADDR_ERG_DEFAULT: number;
    const FRAME_MAXSIZE: number;
    const INTERFRAMEGAP_MIN: number;
    const CMDUPLIST_MAXSIZE: number;
    const MEMORY_BLOCKSIZE: number;
    const FORCEPLOT_BLOCKSIZE: number;
    const HEARTBEAT_BLOCKSIZE: number;
    const MANUFACTURE_ID: number;
    const CLASS_ID: number;
    const MODEL_NUM: number;
    const UNITS_TYPE: number;
    const SERIALNUM_DIGITS: number;
    const HMS_FORMAT_CNT: number;
    const YMD_FORMAT_CNT: number;
    const ERRORCODE_FORMAT_CNT: number;
    const CTRL_CMD_LONG_MIN: number;
    const CFG_CMD_LONG_MIN: number;
    const DATA_CMD_LONG_MIN: number;
    const AUDIO_CMD_LONG_MIN: number;
    const TEXTCFG_CMD_LONG_MIN: number;
    const TEXTSTATUS_CMD_LONG_MIN: number;
    const CAP_CMD_LONG_MIN: number;
    const PMPROPRIETARY_CMD_LONG_MIN: number;
    const CTRL_CMD_SHORT_MIN: number;
    const STATUS_CMD_SHORT_MIN: number;
    const DATA_CMD_SHORT_MIN: number;
    const AUDIO_CMD_SHORT_MIN: number;
    const TEXTCFG_CMD_SHORT_MIN: number;
    const TEXTSTATUS_CMD_SHORT_MIN: number;
    const enum SHORT_CTRL_CMDS {
        GETSTATUS_CMD = 128,
        RESET_CMD = 129,
        GOIDLE_CMD = 130,
        GOHAVEID_CMD = 131,
        GOINUSE_CMD = 133,
        GOFINISHED_CMD = 134,
        GOREADY_CMD = 135,
        BADID_CMD = 136,
        CTRL_CMD_SHORT_MAX = 137,
    }
    const enum SHORT_STATUS_CMDS {
        GETVERSION_CMD = 145,
        GETID_CMD = 146,
        GETUNITS_CMD = 147,
        GETSERIAL_CMD = 148,
        GETLIST_CMD = 152,
        GETUTILIZATION_CMD = 153,
        GETMOTORCURRENT_CMD = 154,
        GETODOMETER_CMD = 155,
        GETERRORCODE_CMD = 156,
        GETSERVICECODE_CMD = 157,
        GETUSERCFG1_CMD = 158,
        GETUSERCFG2_CMD = 159,
        STATUS_CMD_SHORT_MAX = 160,
    }
    const enum SHORT_DATA_CMDS {
        GETTWORK_CMD = 160,
        GETHORIZONTAL_CMD = 161,
        GETVERTICAL_CMD = 162,
        GETCALORIES_CMD = 163,
        GETPROGRAM_CMD = 164,
        GETSPEED_CMD = 165,
        GETPACE_CMD = 166,
        GETCADENCE_CMD = 167,
        GETGRADE_CMD = 168,
        GETGEAR_CMD = 169,
        GETUPLIST_CMD = 170,
        GETUSERINFO_CMD = 171,
        GETTORQUE_CMD = 172,
        GETHRCUR_CMD = 176,
        GETHRTZONE_CMD = 178,
        GETMETS_CMD = 179,
        GETPOWER_CMD = 180,
        GETHRAVG_CMD = 181,
        GETHRMAX_CMD = 182,
        GETUSERDATA1_CMD = 190,
        GETUSERDATA2_CMD = 191,
        DATA_CMD_SHORT_MAX = 192,
    }
    const enum SHORT_AUDIO_CMDS {
        GETAUDIOCHANNEL_CMD = 192,
        GETAUDIOVOLUME_CMD = 193,
        GETAUDIOMUTE_CMD = 194,
        AUDIO_CMD_SHORT_MAX = 195,
    }
    const enum SHORT_TEXTCFG_CMDS {
        ENDTEXT_CMD = 224,
        DISPLAYPOPUP_CMD = 225,
        TEXTCFG_CMD_SHORT_MAX = 226,
    }
    const enum SHORT_TEXTSTATUS_CMDS {
        GETPOPUPSTATUS_CMD = 229,
        TEXTSTATUS_CMD_SHORT_MAX = 230,
    }
    const enum LONG_CTRL_CMDS {
        AUTOUPLOAD_CMD = 1,
        UPLIST_CMD = 2,
        UPSTATUSSEC_CMD = 4,
        UPLISTSEC_CMD = 5,
        CTRL_CMD_LONG_MAX = 6,
    }
    const enum LONG_CFG_CMDS {
        IDDIGITS_CMD = 16,
        SETTIME_CMD = 17,
        SETDATE_CMD = 18,
        SETTIMEOUT_CMD = 19,
        SETUSERCFG1_CMD = 26,
        SETUSERCFG2_CMD = 27,
        CFG_CMD_LONG_MAX = 28,
    }
    const enum LONG_DATA_CMDS {
        SETTWORK_CMD = 32,
        SETHORIZONTAL_CMD = 33,
        SETVERTICAL_CMD = 34,
        SETCALORIES_CMD = 35,
        SETPROGRAM_CMD = 36,
        SETSPEED_CMD = 37,
        SETGRADE_CMD = 40,
        SETGEAR_CMD = 41,
        SETUSERINFO_CMD = 43,
        SETTORQUE_CMD = 44,
        SETLEVEL_CMD = 45,
        SETTARGETHR_CMD = 48,
        SETGOAL_CMD = 50,
        SETMETS_CMD = 51,
        SETPOWER_CMD = 52,
        SETHRZONE_CMD = 53,
        SETHRMAX_CMD = 54,
        DATA_CMD_LONG_MAX = 55,
    }
    const enum LONG_AUDIO_CMDS {
        SETCHANNELRANGE_CMD = 64,
        SETVOLUMERANGE_CMD = 65,
        SETAUDIOMUTE_CMD = 66,
        SETAUDIOCHANNEL_CMD = 67,
        SETAUDIOVOLUME_CMD = 68,
        AUDIO_CMD_LONG_MAX = 69,
    }
    const enum LONG_TEXTCFG_CMDS {
        STARTTEXT_CMD = 96,
        APPENDTEXT_CMD = 97,
        TEXTCFG_CMD_LONG_MAX = 98,
    }
    const enum LONG_TEXTSTATUS_CMDS {
        GETTEXTSTATUS_CMD = 101,
        TEXTSTATUS_CMD_LONG_MAX = 102,
    }
    const enum LONG_CAP_CMDS {
        GETCAPS_CMD = 112,
        GETUSERCAPS1_CMD = 126,
        GETUSERCAPS2_CMD = 127,
        CAP_CMD_LONG_MAX = 128,
    }
    const enum LONG_PMPROPRIETARY_CMDS {
        SETPMCFG_CMD = 118,
        SETPMDATA_CMD = 119,
        GETPMCFG_CMD = 126,
        GETPMDATA_CMD = 127,
        PMPROPRIETARY_CMD_LONG_MAX = 128,
    }
    const GETPMCFG_CMD_SHORT_MIN: number;
    const GETPMCFG_CMD_LONG_MIN: number;
    const SETPMCFG_CMD_SHORT_MIN: number;
    const SETPMCFG_CMD_LONG_MIN: number;
    const GETPMDATA_CMD_SHORT_MIN: number;
    const GETPMDATA_CMD_LONG_MIN: number;
    const SETPMDATA_CMD_SHORT_MIN: number;
    const SETPMDATA_CMD_LONG_MIN: number;
    const enum PM_SHORT_PULL_CFG_CMDS {
        PM_GET_FW_VERSION = 128,
        PM_GET_HW_VERSION = 129,
        PM_GET_HW_ADDRESS = 130,
        PM_GET_TICK_TIMEBASE = 131,
        PM_GET_HRM = 132,
        PM_GET_SCREENSTATESTATUS = 134,
        PM_GET_RACE_LANE_REQUEST = 135,
        PM_GET_ERG_LOGICALADDR_REQUEST = 136,
        PM_GET_WORKOUTTYPE = 137,
        PM_GET_DISPLAYTYPE = 138,
        PM_GET_DISPLAYUNITS = 139,
        PM_GET_LANGUAGETYPE = 140,
        PM_GET_WORKOUTSTATE = 141,
        PM_GET_INTERVALTYPE = 142,
        PM_GET_OPERATIONALSTATE = 143,
        PM_GET_LOGCARDSTATE = 144,
        PM_GET_LOGCARDSTATUS = 145,
        PM_GET_POWERUPSTATE = 146,
        PM_GET_ROWINGSTATE = 147,
        PM_GET_SCREENCONTENT_VERSION = 148,
        PM_GET_COMMUNICATIONSTATE = 149,
        PM_GET_RACEPARTICIPANTCOUNT = 150,
        PM_GET_BATTERYLEVELPERCENT = 151,
        PM_GET_RACEMODESTATUS = 152,
        PM_GET_INTERNALLOGPARAMS = 153,
        PM_GET_PRODUCTCONFIGURATION = 154,
        PM_GET_ERGSLAVEDISCOVERREQUESTSTATUS = 155,
        PM_GET_WIFICONFIG = 156,
        PM_GET_CPUTICKRATE = 157,
        PM_GET_LOGCARDCENSUS = 158,
        PM_GET_WORKOUTINTERVALCOUNT = 159,
        GETPMCFG_CMD_SHORT_MAX = 160,
    }
    const enum PM_SHORT_PULL_DATA_CMDS {
        PM_GET_WORKTIME = 160,
        PM_GET_PROJECTED_WORKTIME = 161,
        PM_GET_TOTAL_RESTTIME = 162,
        PM_GET_WORKDISTANCE = 163,
        PM_GET_TOTAL_WORKDISTANCE = 164,
        PM_GET_PROJECTED_WORKDISTANCE = 165,
        PM_GET_RESTDISTANCE = 166,
        PM_GET_TOTAL_RESTDISTANCE = 167,
        PM_GET_STROKE_500MPACE = 168,
        PM_GET_STROKE_POWER = 169,
        PM_GET_STROKE_CALORICBURNRATE = 170,
        PM_GET_SPLIT_AVG_500MPACE = 171,
        PM_GET_SPLIT_AVG_POWER = 172,
        PM_GET_SPLIT_AVG_CALORICBURNRATE = 173,
        PM_GET_SPLIT_AVG_CALORIES = 174,
        PM_GET_TOTAL_AVG_500MPACE = 175,
        PM_GET_TOTAL_AVG_POWER = 176,
        PM_GET_TOTAL_AVG_CALORICBURNRATE = 177,
        PM_GET_TOTAL_AVG_CALORIES = 178,
        PM_GET_STROKERATE = 179,
        PM_GET_SPLIT_AVG_STROKERATE = 180,
        PM_GET_TOTAL_AVG_STROKERATE = 181,
        PM_GET_AVG_HEARTRATE = 182,
        PM_GET_ENDING_AVG_HEARTRATE = 183,
        PM_GET_REST_AVG_HEARTRATE = 184,
        PM_GET_SPLITTIME = 185,
        PM_GET_LASTSPLITTIME = 186,
        PM_GET_SPLITDISTANCE = 187,
        PM_GET_LASTSPLITDISTANCE = 188,
        PM_GET_LASTRESTDISTANCE = 189,
        PM_GET_TARGETPACETIME = 190,
        PM_GET_STROKESTATE = 191,
        PM_GET_STROKERATESTATE = 192,
        PM_GET_DRAGFACTOR = 193,
        PM_GET_ENCODERPERIOD = 194,
        PM_GET_HEARTRATESTATE = 195,
        PM_GET_SYNCDATA = 196,
        PM_GET_SYNCDATAALL = 197,
        PM_GET_RACEDATA = 198,
        PM_GET_TICKTIME = 199,
        PM_GET_ERRORTYPE = 200,
        PM_GET_ERRORVALUE = 201,
        PM_GET_STATUSTYPE = 202,
        PM_GET_STATUSVALUE = 203,
        PM_GET_EPMSTATUS = 204,
        PM_GET_DISPLAYUPDATETIME = 205,
        PM_GET_SYNCFRACTIONALTIME = 206,
        PM_GET_RESTTIME = 207,
        GETPMDATA_CMD_SHORT_MAX = 208,
    }
    const enum PM_SHORT_PUSH_DATA_CMDS {
        PM_SET_SYNC_DISTANCE = 208,
        PM_SET_SYNC_STROKEPACE = 209,
        PM_SET_SYNC_AVG_HEARTRATE = 210,
        PM_SET_SYNC_TIME = 211,
        PM_SET_SYNC_SPLIT_DATA = 212,
        PM_SET_SYNC_ENCODER_PERIOD = 213,
        PM_SET_SYNC_VERSION_INFO = 214,
        PM_SET_SYNC_RACETICKTIME = 215,
        PM_SET_SYNC_DATAALL = 216,
        SETPMDATA_CMD_SHORT_MAX = 217,
    }
    const enum PM_SHORT_PUSH_CFG_CMDS {
        PM_SET_RESET_ALL = 224,
        PM_SET_RESET_ERGNUMBER = 225,
        SETPMCFG_CMD_SHORT_MAX = 226,
    }
    const enum PM_LONG_PUSH_CFG_CMDS {
        PM_SET_BAUDRATE = 0,
        PM_SET_WORKOUTTYPE = 1,
        PM_SET_STARTTYPE = 2,
        PM_SET_WORKOUTDURATION = 3,
        PM_SET_RESTDURATION = 4,
        PM_SET_SPLITDURATION = 5,
        PM_SET_TARGETPACETIME = 6,
        PM_SET_INTERVALIDENTIFIER = 7,
        PM_SET_OPERATIONALSTATE = 8,
        PM_SET_RACETYPE = 9,
        PM_SET_WARMUPDURATION = 10,
        PM_SET_RACELANESETUP = 11,
        PM_SET_RACELANEVERIFY = 12,
        PM_SET_RACESTARTPARAMS = 13,
        PM_SET_ERGSLAVEDISCOVERYREQUEST = 14,
        PM_SET_BOATNUMBER = 15,
        PM_SET_ERGNUMBER = 16,
        PM_SET_COMMUNICATIONSTATE = 17,
        PM_SET_CMDUPLIST = 18,
        PM_SET_SCREENSTATE = 19,
        PM_CONFIGURE_WORKOUT = 20,
        PM_SET_TARGETAVGWATTS = 21,
        PM_SET_TARGETCALSPERHR = 22,
        PM_SET_INTERVALTYPE = 23,
        PM_SET_WORKOUTINTERVALCOUNT = 24,
        PM_SET_DISPLAYUPDATERATE = 25,
        PM_SET_AUTHENPASSWORD = 26,
        PM_SET_TICKTIME = 27,
        PM_SET_TICKTIMEOFFSET = 28,
        PM_SET_RACEDATASAMPLETICKS = 29,
        PM_SET_RACEOPERATIONTYPE = 30,
        PM_SET_RACESTATUSDISPLAYTICKS = 31,
        PM_SET_RACESTATUSWARNINGTICKS = 32,
        PM_SET_RACEIDLEMODEPARAMS = 33,
        PM_SET_DATETIME = 34,
        PM_SET_LANGUAGETYPE = 35,
        PM_SET_WIFICONFIG = 36,
        PM_SET_CPUTICKRATE = 37,
        PM_SET_LOGCARDUSER = 38,
        PM_SET_SCREENERRORMODE = 39,
        PM_SET_CABLETEST = 40,
        PM_SET_USER_ID = 41,
        PM_SET_USER_PROFILE = 42,
        PM_SET_HRM = 43,
        PM_SET_SENSOR_CHANNEL = 47,
        SETPMCFG_CMD_LONG_MAX = 48,
    }
    const enum PM_LONG_PUSH_DATA_CMDS {
        PM_SET_TEAM_DISTANCE = 48,
        PM_SET_TEAM_FINISH_TIME = 49,
        PM_SET_RACEPARTICIPANT = 50,
        PM_SET_RACESTATUS = 51,
        PM_SET_LOGCARDMEMORY = 52,
        PM_SET_DISPLAYSTRING = 53,
        PM_SET_DISPLAYBITMAP = 54,
        PM_SET_LOCALRACEPARTICIPANT = 55,
        PM_SET_ANTRFMODE = 78,
        PM_SET_MEMORY = 79,
        SETPMDATA_CMD_LONG_MAX = 80,
    }
    const enum PM_LONG_PULL_CFG_CMDS {
        PM_GET_ERGNUMBER = 80,
        PM_GET_ERGNUMBERREQUEST = 81,
        PM_GET_USERIDSTRING = 82,
        PM_GET_LOCALRACEPARTICIPANT = 83,
        PM_GET_USER_ID = 84,
        PM_GET_USER_PROFILE = 85,
        GETPMCFG_CMD_LONG_MAX = 86,
    }
    const enum PM_LONG_PULL_DATA_CMDS {
        PM_GET_MEMORY = 104,
        PM_GET_LOGCARDMEMORY = 105,
        PM_GET_INTERNALLOGMEMORY = 106,
        PM_GET_FORCEPLOTDATA = 107,
        PM_GET_HEARTBEATDATA = 108,
        PM_GET_UI_EVENTS = 109,
        GETPMDATA_CMD_LONG_MAX = 110,
    }
    const PREVOK_FLG: number;
    const PREVREJECT_FLG: number;
    const PREVBAD_FLG: number;
    const PREVNOTRDY_FLG: number;
    const PREVFRAMESTATUS_MSK: number;
    const SLAVESTATE_ERR_FLG: number;
    const SLAVESTATE_RDY_FLG: number;
    const SLAVESTATE_IDLE_FLG: number;
    const SLAVESTATE_HAVEID_FLG: number;
    const SLAVESTATE_INUSE_FLG: number;
    const SLAVESTATE_PAUSE_FLG: number;
    const SLAVESTATE_FINISH_FLG: number;
    const SLAVESTATE_MANUAL_FLG: number;
    const SLAVESTATE_OFFLINE_FLG: number;
    const FRAMECNT_FLG: number;
    const SLAVESTATE_MSK: number;
    const AUTOSTATUS_FLG: number;
    const UPSTATUS_FLG: number;
    const UPLIST_FLG: number;
    const ACK_FLG: number;
    const EXTERNCONTROL_FLG: number;
    const CAPCODE_PROTOCOL: number;
    const CAPCODE_POWER: number;
    const CAPCODE_TEXT: number;
    const DISTANCE_MILE_0_0: number;
    const DISTANCE_MILE_0_1: number;
    const DISTANCE_MILE_0_2: number;
    const DISTANCE_MILE_0_3: number;
    const DISTANCE_FEET_0_0: number;
    const DISTANCE_INCH_0_0: number;
    const WEIGHT_LBS_0_0: number;
    const WEIGHT_LBS_0_1: number;
    const DISTANCE_FEET_1_0: number;
    const SPEED_MILEPERHOUR_0_0: number;
    const SPEED_MILEPERHOUR_0_1: number;
    const SPEED_MILEPERHOUR_0_2: number;
    const SPEED_FEETPERMINUTE_0_0: number;
    const DISTANCE_KM_0_0: number;
    const DISTANCE_KM_0_1: number;
    const DISTANCE_KM_0_2: number;
    const DISTANCE_METER_0_0: number;
    const DISTANCE_METER_0_1: number;
    const DISTANCE_CM_0_0: number;
    const WEIGHT_KG_0_0: number;
    const WEIGHT_KG_0_1: number;
    const SPEED_KMPERHOUR_0_0: number;
    const SPEED_KMPERHOUR_0_1: number;
    const SPEED_KMPERHOUR_0_2: number;
    const SPEED_METERPERMINUTE_0_0: number;
    const PACE_MINUTEPERMILE_0_0: number;
    const PACE_MINUTEPERKM_0_0: number;
    const PACE_SECONDSPERKM_0_0: number;
    const PACE_SECONDSPERMILE_0_0: number;
    const DISTANCE_FLOORS_0_0: number;
    const DISTANCE_FLOORS_0_1: number;
    const DISTANCE_STEPS_0_0: number;
    const DISTANCE_REVS_0_0: number;
    const DISTANCE_STRIDES_0_0: number;
    const DISTANCE_STROKES_0_0: number;
    const MISC_BEATS_0_0: number;
    const ENERGY_CALORIES_0_0: number;
    const GRADE_PERCENT_0_0: number;
    const GRADE_PERCENT_0_2: number;
    const GRADE_PERCENT_0_1: number;
    const CADENCE_FLOORSPERMINUTE_0_1: number;
    const CADENCE_FLOORSPERMINUTE_0_0: number;
    const CADENCE_STEPSPERMINUTE_0_0: number;
    const CADENCE_REVSPERMINUTE_0_0: number;
    const CADENCE_STRIDESPERMINUTE_0_0: number;
    const CADENCE_STROKESPERMINUTE_0_0: number;
    const MISC_BEATSPERMINUTE_0_0: number;
    const BURN_CALORIESPERMINUTE_0_0: number;
    const BURN_CALORIESPERHOUR_0_0: number;
    const POWER_WATTS_0_0: number;
    const ENERGY_INCHLB_0_0: number;
    const ENERGY_FOOTLB_0_0: number;
    const ENERGY_NM_0_0: number;
    const KG_TO_LBS: number;
    const LBS_TO_KG: number;
    const IDDIGITS_MIN: number;
    const IDDIGITS_MAX: number;
    const DEFAULT_IDDIGITS: number;
    const DEFAULT_ID: number;
    const MANUAL_ID: number;
    const DEFAULT_SLAVESTATE_TIMEOUT: number;
    const PAUSED_SLAVESTATE_TIMEOUT: number;
    const INUSE_SLAVESTATE_TIMEOUT: number;
    const IDLE_SLAVESTATE_TIMEOUT: number;
    const BASE_YEAR: number;
    const DEFAULT_STATUSUPDATE_INTERVAL: number;
    const DEFAULT_CMDUPLIST_INTERVAL: number;
}
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 * this is the core, you do not have to change this code.
 *
 */
declare module ergometer.csafe {
    interface IRawCommand {
        waitForResponse: boolean;
        command: number;
        detailCommand?: number;
        data?: number[];
        onDataReceived?: (data: DataView) => void;
        onError?: ErrorHandler;
        _timestamp?: number;
    }
    interface IBuffer {
        rawCommands: IRawCommand[];
        clear(): IBuffer;
        addRawCommand(info: IRawCommand): any;
        send(success?: () => void, error?: ErrorHandler): Promise<void>;
    }
    interface ICommand {
        (buffer: IBuffer, monitor: PerformanceMonitor): void;
    }
    class CommandManagager {
        private _commands;
        register(createCommand: ICommand): void;
        apply(buffer: IBuffer, monitor: PerformanceMonitor): void;
    }
    var commandManager: CommandManagager;
}
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
declare module ergometer.csafe {
    interface ICommandStrokeState {
        received: (state: StrokeState) => void;
        onError?: ErrorHandler;
    }
    interface IBuffer {
        getStrokeState(params: ICommandStrokeState): IBuffer;
    }
    interface ICommandPowerCurve {
        received: (curve: number[]) => void;
        onError?: ErrorHandler;
    }
    interface IBuffer {
        getPowerCurve(params: ICommandPowerCurve): IBuffer;
    }
    interface ICommandSetProgam {
        program: number;
        onError?: ErrorHandler;
    }
    interface IBuffer {
        setProgram(params: ICommandSetProgam): IBuffer;
    }
}
/**
 * Created by tijmen on 19-01-16.
 *
 * Extensible frame work so you can add your own csafe commands to the buffer
 *
 */
declare module ergometer.csafe {
    interface IVersion {
        ManufacturerId: number;
        CID: number;
        Model: number;
        HardwareVersion: number;
        FirmwareVersion: number;
    }
    interface ICommandGetVersion {
        received: (version: IVersion) => void;
        onError?: ErrorHandler;
    }
    interface IBuffer {
        getVersion(params: ICommandGetVersion): IBuffer;
    }
}
/**
 * Concept 2 ergometer Performance Monitor api for Cordova
 *
 * This will will work with the PM5
 *
 * Created by tijmen on 01-06-15.
 * License:
 *
 * Copyright 2016 Tijmen van Gulik (tijmen@vangulik.org)
 * Copyright 2016 Tijmen van Gulik (tijmen@vangulik.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
declare module ergometer {
    interface RowingGeneralStatusEvent extends pubSub.ISubscription {
        (data: RowingGeneralStatus): void;
    }
    interface RowingAdditionalStatus1Event extends pubSub.ISubscription {
        (data: RowingAdditionalStatus1): void;
    }
    interface RowingAdditionalStatus2Event extends pubSub.ISubscription {
        (data: RowingAdditionalStatus2): void;
    }
    interface RowingStrokeDataEvent extends pubSub.ISubscription {
        (data: RowingStrokeData): void;
    }
    interface RowingAdditionalStrokeDataEvent extends pubSub.ISubscription {
        (data: RowingAdditionalStrokeData): void;
    }
    interface RowingSplitIntervalDataEvent extends pubSub.ISubscription {
        (data: RowingSplitIntervalData): void;
    }
    interface RowingAdditionalSplitIntervalDataEvent extends pubSub.ISubscription {
        (data: RowingAdditionalSplitIntervalData): void;
    }
    interface WorkoutSummaryDataEvent extends pubSub.ISubscription {
        (data: WorkoutSummaryData): void;
    }
    interface AdditionalWorkoutSummaryDataEvent extends pubSub.ISubscription {
        (data: AdditionalWorkoutSummaryData): void;
    }
    interface AdditionalWorkoutSummaryData2Event extends pubSub.ISubscription {
        (data: AdditionalWorkoutSummaryData2): void;
    }
    interface HeartRateBeltInformationEvent extends pubSub.ISubscription {
        (data: HeartRateBeltInformation): void;
    }
    interface PowerCurveEvent extends pubSub.ISubscription {
        (data: number[]): void;
    }
    enum MonitorConnectionState {
        inactive = 0,
        deviceReady = 1,
        scanning = 2,
        connecting = 3,
        connected = 4,
        servicesFound = 5,
        readyForCommunication = 6,
    }
    enum LogLevel {
        error = 0,
        info = 1,
        debug = 2,
        trace = 3,
    }
    interface LogEvent extends pubSub.ISubscription {
        (text: string, logLevel: LogLevel): void;
    }
    interface ConnectionStateChangedEvent extends pubSub.ISubscription {
        (oldState: MonitorConnectionState, newState: MonitorConnectionState): void;
    }
    interface ErrorHandler {
        (e: any): void;
    }
    interface DeviceInfo {
        connected: boolean;
        name: string;
        address: string;
        quality: number;
        serial?: string;
        hardwareRevision?: string;
        firmwareRevision?: string;
        manufacturer?: string;
    }
    interface ParsedCSafeCommand {
        command: number;
        detailCommand: number;
        data: Uint8Array;
    }
    /**
     *
     * Usage:
     *
     * Create this class to acess the performance data
     *   var performanceMonitor= new ergometer.PerformanceMonitor();
     *
     * after this connect to the events to get data
     *   performanceMonitor.rowingGeneralStatusEvent.sub(this,this.onRowingGeneralStatus);
     * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
     * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
     * the documentation in the properties You must set the multi plex property before connecting
     *   performanceMonitor.multiplex=true;
     *
     * to start the connection first start scanning for a device,
     * you should call when the cordova deviceready event is called (or later)
     *   performanceMonitor.startScan((device : ergometer.DeviceInfo) : boolean => {
     *      //return true when you want to connect to the device
     *       return device.name=='My device name';
     *   });
     *  to connect at at a later time
     *    performanceMonitor.connectToDevice('my device name');
     *  the devices which where found during the scan are collected in
     *    performanceMonitor.devices
     *  when you connect to a device the scan is stopped, when you want to stop the scan earlier you need to call
     *    performanceMonitor.stopScan
     *
     */
    class PerformanceMonitor {
        private _driver;
        private _connectionState;
        private _logEvent;
        private _connectionStateChangedEvent;
        private _rowingGeneralStatusEvent;
        private _rowingAdditionalStatus1Event;
        private _rowingAdditionalStatus2Event;
        private _rowingStrokeDataEvent;
        private _rowingAdditionalStrokeDataEvent;
        private _rowingSplitIntervalDataEvent;
        private _rowingAdditionalSplitIntervalDataEvent;
        private _workoutSummaryDataEvent;
        private _additionalWorkoutSummaryDataEvent;
        private _additionalWorkoutSummaryData2Event;
        private _heartRateBeltInformationEvent;
        private _powerCurveEvent;
        private _deviceInfo;
        private _rowingGeneralStatus;
        private _rowingAdditionalStatus1;
        private _rowingAdditionalStatus2;
        private _rowingStrokeData;
        private _rowingAdditionalStrokeData;
        private _rowingSplitIntervalData;
        private _rowingAdditionalSplitIntervalData;
        private _workoutSummaryData;
        private _additionalWorkoutSummaryData;
        private _additionalWorkoutSummaryData2;
        private _heartRateBeltInformation;
        private _powerCurve;
        private _devices;
        private _multiplex;
        private _multiplexSubscribeCount;
        private _sampleRate;
        private _autoReConnect;
        private _logLevel;
        private _csafeBuffer;
        private _waitResponseCommands;
        private _generalStatusEventAttachedByPowerCurve;
        protected driver: ergometer.ble.IDriver;
        /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @returns {LogLevel}
         */
        /**
         * By default it the logEvent will return errors if you want more debug change the log level
         * @param value
         */
        logLevel: LogLevel;
        /**
         * when the connection is lost re-connect
         * @returns {boolean}
         */
        /**
         *
         * when the connection is lost re-connect
         * @param value
         */
        autoReConnect: boolean;
        /**
         * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
         * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
         * the documentation in the properties You must set the multi plex property before connecting
         *
         * @returns {boolean}
         */
        /**
         * On some android phones you can connect to a limited number of events. Use the multiplex property to overcome
         * this problem. When the multi plex mode is switched on the data send to the device can be a a bit different, see
         * the documentation in the properties You must set the multi plex property before connecting
         * @param value
         */
        multiplex: boolean;
        /**
         * an array of of performance monitor devices which where found during the scan.
         * the array is sorted by connection quality (best on top)
         *
         * @returns {DeviceInfo[]}
         */
        devices: ergometer.DeviceInfo[];
        /**
         * The values of the last rowingGeneralStatus event
         *
         * @returns {RowingGeneralStatus}
         */
        rowingGeneralStatus: RowingGeneralStatus;
        /**
         * The values of the last rowingAdditionalStatus1 event
         * @returns {RowingAdditionalStatus1}
         */
        rowingAdditionalStatus1: RowingAdditionalStatus1;
        /**
         * The values of the last RowingAdditionalStatus2 event
         * @returns {RowingAdditionalStatus2}
         */
        rowingAdditionalStatus2: RowingAdditionalStatus2;
        /**
         *  The values of the last rowingStrokeData event
         * @returns {RowingStrokeData}
         */
        rowingStrokeData: RowingStrokeData;
        /**
         * The values of the last rowingAdditionalStrokeData event
         * @returns {RowingAdditionalStrokeData}
         */
        rowingAdditionalStrokeData: RowingAdditionalStrokeData;
        /**
         * The values of the last rowingSplitIntervalData event
         * @returns {RowingSplitIntervalData}
         */
        rowingSplitIntervalData: RowingSplitIntervalData;
        /**
         * The values of the last rowingAdditionalSplitIntervalData event
         * @returns {RowingAdditionalSplitIntervalData}
         */
        rowingAdditionalSplitIntervalData: RowingAdditionalSplitIntervalData;
        /**
         * The values of the last workoutSummaryData event
         * @returns {WorkoutSummaryData}
         */
        workoutSummaryData: WorkoutSummaryData;
        /**
         * The values of the last additionalWorkoutSummaryData event
         * @returns {AdditionalWorkoutSummaryData}
         */
        additionalWorkoutSummaryData: AdditionalWorkoutSummaryData;
        /**
         * The values of the last AdditionalWorkoutSummaryData2 event
         * @returns {AdditionalWorkoutSummaryData2}
         */
        additionalWorkoutSummaryData2: AdditionalWorkoutSummaryData2;
        /**
         * The values of the last heartRateBeltInformation event
         * @returns {HeartRateBeltInformation}
         */
        heartRateBeltInformation: HeartRateBeltInformation;
        /**
         * read rowingGeneralStatus data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingGeneralStatusEvent>}
         */
        rowingGeneralStatusEvent: pubSub.Event<RowingGeneralStatusEvent>;
        /**
         * read rowingGeneralStatus1 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus1Event>}
         */
        rowingAdditionalStatus1Event: pubSub.Event<RowingAdditionalStatus1Event>;
        /**
         * read rowingAdditionalStatus2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStatus2Event>}
         */
        rowingAdditionalStatus2Event: pubSub.Event<RowingAdditionalStatus2Event>;
        /**
         * read rowingStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingStrokeDataEvent>}
         */
        rowingStrokeDataEvent: pubSub.Event<RowingStrokeDataEvent>;
        /**
         * read rowingAdditionalStrokeData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalStrokeDataEvent>}
         */
        rowingAdditionalStrokeDataEvent: pubSub.Event<RowingAdditionalStrokeDataEvent>;
        /**
         * read rowingSplitIntervalDat data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingSplitIntervalDataEvent>}
         */
        rowingSplitIntervalDataEvent: pubSub.Event<RowingSplitIntervalDataEvent>;
        /**
         * read rowingAdditionalSplitIntervalData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<RowingAdditionalSplitIntervalDataEvent>}
         */
        rowingAdditionalSplitIntervalDataEvent: pubSub.Event<RowingAdditionalSplitIntervalDataEvent>;
        /**
         * read workoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<WorkoutSummaryDataEvent>}
         */
        workoutSummaryDataEvent: pubSub.Event<WorkoutSummaryDataEvent>;
        /**
         * read additionalWorkoutSummaryData data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryDataEvent>}
         */
        additionalWorkoutSummaryDataEvent: pubSub.Event<AdditionalWorkoutSummaryDataEvent>;
        /**
         * read additionalWorkoutSummaryData2 data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<AdditionalWorkoutSummaryData2Event>}
         */
        additionalWorkoutSummaryData2Event: pubSub.Event<AdditionalWorkoutSummaryData2Event>;
        /**
         * read heartRateBeltInformation data
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<HeartRateBeltInformationEvent>}
         */
        heartRateBeltInformationEvent: pubSub.Event<HeartRateBeltInformationEvent>;
        powerCurveEvent: pubSub.Event<ergometer.PowerCurveEvent>;
        /**
         * event which is called when the connection state is changed. For example this way you
         * can check if the device is disconnected.
         * connect to the using .sub(this,myFunction)
         * @returns {pubSub.Event<ConnectionStateChangedEvent>}
         */
        connectionStateChangedEvent: pubSub.Event<ConnectionStateChangedEvent>;
        /**
         * returns error and other log information. Some errors can only be received using the logEvent
         * @returns {pubSub.Event<LogEvent>}
         */
        logEvent: pubSub.Event<LogEvent>;
        powerCurve: number[];
        /**
         * Get device information of the connected device.
         * @returns {DeviceInfo}
         */
        deviceInfo: ergometer.DeviceInfo;
        /**
         * read the performance montitor sample rate. By default this is 500 ms
         * @returns {number}
         */
        /**
         * Change the performance monitor sample rate.
         * @param value
         */
        sampleRate: SampleRate;
        /**
         * disconnect the current connected device
         */
        protected disconnect(): void;
        /**
         * read the current connection state
         * @returns {MonitorConnectionState}
         */
        connectionState: MonitorConnectionState;
        /**
         *
         * @param value
         */
        protected changeConnectionState(value: MonitorConnectionState): void;
        /**
         * To work with this class you will need to create it.
         */
        constructor();
        /**
         *
         */
        protected enableMultiplexNotification(): void;
        /**
         *
         */
        protected disableMultiPlexNotification(): void;
        /**
         *
         */
        protected enableDisableNotification(): void;
        protected onPowerCurveRowingGeneralStatus(data: ergometer.RowingGeneralStatus): void;
        /**
         *
         */
        protected initialize(): void;
        /**
         * When low level initialization complete, this function is called.
         */
        /**
         * Print debug info to console and application UI.
         * @param info
         */
        traceInfo(info: string): void;
        /**
         *
         * @param info
         */
        debugInfo(info: string): void;
        /**
         *
         * @param info
         */
        showInfo(info: string): void;
        /**
         * call the global error hander and call the optional error handler if given
         * @param error
         */
        handleError(error: string, errorFn?: ErrorHandler): void;
        /**
         * Get an error function which adds the errorDescription to the error ,cals the global and an optional local funcion
         * @param errorDescription
         * @param errorFn
         */
        getErrorHandlerFunc(errorDescription: string, errorFn?: ErrorHandler): ErrorHandler;
        /**
         *
         * @param device
         */
        protected removeDevice(device: DeviceInfo): void;
        /**
         *
         * @param device
         */
        protected addDevice(device: DeviceInfo): void;
        /**
         *
         * @param name
         * @returns {DeviceInfo}
         */
        protected findDevice(name: string): DeviceInfo;
        /**
         *
         */
        protected stopScan(): void;
        /**
         * Scan for device use the deviceFound to connect .
         * @param deviceFound
         */
        startScan(deviceFound: (device: DeviceInfo) => boolean, errorFn?: ErrorHandler): Promise<void>;
        /**
         * connect to a specific device. This should be a PM5 device which is found by the startScan. You can
         * only call this function after startScan is called. Connection to a device will stop the scan.
         * @param deviceName
         */
        connectToDevice(deviceName: string): Promise<void>;
        /**
         * the promise is never fail
         * @param serviceUUID
         * @param UUID
         * @param readValue
         */
        protected readStringCharacteristic(serviceUUID: string, UUID: string): Promise<string>;
        /**
         * the promise will never fail
         * @param done
         */
        protected readSampleRate(): Promise<void>;
        /**
         *
         * @param done
         */
        protected readPheripheralInfo(): Promise<void>;
        /**
         *
         * @param data
         */
        protected handleRowingGeneralStatus(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingAdditionalStatus1(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingAdditionalStatus2(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingStrokeData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingAdditionalStrokeData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingSplitIntervalData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleRowingAdditionalSplitIntervalData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleWorkoutSummaryData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleAdditionalWorkoutSummaryData(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleAdditionalWorkoutSummaryData2(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleHeartRateBeltInformation(data: DataView): void;
        /**
         *
         * @param data
         */
        protected handleDataCallbackMulti(data: ArrayBuffer): void;
        /**
         *
         * @param data
         * @param func
         */
        protected handleDataCallback(data: ArrayBuffer, func: (data: DataView) => void): void;
        protected removeOldSendCommands(): void;
        /**
         *  send everyt thing which is put into the csave buffer
         *
         * @param success
         * @param error
         * @returns {Promise<any>|Promise} use promis instead of success and error function
         */
        sendCSafeBuffer(): Promise<void>;
        protected sendCsafeCommands(byteArray: number[]): Promise<void>;
        receivedCSaveCommand(parsed: ParsedCSafeCommand): void;
        handleCSafeNotifications(): void;
        csafeBuffer: ergometer.csafe.IBuffer;
    }
}
