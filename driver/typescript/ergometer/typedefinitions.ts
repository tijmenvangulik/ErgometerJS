/**
 * Created by tijmen on 28-12-15.
 */
module ergometer {

    export const enum RowingSampleRate
    {
        rate1sec,
        rate500ms,
        rate250ms,
        rate100ms
    }

    export const enum ErgmachineType {
        staticD,
        staticC,
        staticA,
        staticB,
        staticE = 5,
        staticDynamic = 8,
        slidesA = 16,
        slidesB,
        slidesC,
        slidesD,
        slidesE,
        slidesDynamic = 32,
        staticDyno = 64,
        staticSki = 128,
        num
    }

    //Workout Type
    export const enum WorkoutType {
        justrowNoAplits,
        justrowAplits,
        fixeddistNoAplits,
        fixeddistAplits,
        fixedtimeNoAplits,
        fixedtimeAplits,
        fixedtimeInterval,
        fixeddistInterval,
        variableInterval,
        variableUndefinedRestInterval,
        fixedCalorie,
        fixedWattMinutes,
        num
    }
    //Interval Type
    export const enum IntervalType {
        time,
        dist,
        rest,
        timertUndefined,
        distanceRestUndefined,
        restUndefined,
        cal,
        calRestUndefined,
        wattMinute,
        wattMinuteRestUndefined,
        none = 255
    }

    // Workout State
    export const enum WorkoutState
    {
        waitToBegin,
        workoutRow,
        countDownPause,
        intervalRest,
        intervalWorktime,
        intervalWorkDistance,
        intervalRestEndToWorkTime,
        intervalRestEndToWorkDistance,
        intervalWorktimeTorest,
        intervalWorkDistanceToEest,
        workoutEnd,
        terminate,
        workoutLogged,
        rearm
    }
    //    Rowing State
    export const enum RowingState
    {   inactive,
    active
    }
    //Stroke State
    export const enum StrokeState {
        waitingForWheelToReachMinSpeedState,
        waitingForWheelToAccelerateState,
        drivingState,
        dwellingAfterDriveState,
        recoveryState
    }
    //Workout Duration Type
    export const enum WorkoutDurationType {
        timeDuration = 0,
        caloriesDuration = 0x40,
        distanceDuration = 0x80,
        wattsDuration = 0xc0
    }
    export const enum SampleRate {
        rate1sec,
        rate500ms, //default
        rate250ms,
        rate100ms
    }
    export interface RowingGeneralStatus {
        elapsedTime : number;  //mili seconds
        distance : number;  //meters
        workoutType : WorkoutType;
        intervalType : IntervalType;
        workoutState: WorkoutState;
        rowingState: RowingState;
        strokeState: StrokeState;
        totalWorkDistance: number;
        workoutDuration: number; //depends on the workoutDurationType, when time it is in mili seconds
        workoutDurationType : WorkoutDurationType;
        dragFactor : number;
    }
    export interface RowingAdditionalStatus1 {
        elapsedTime : number;  //mili seconds
        speed : number; // m/s (checked the value but it can not be right, is the doc wrong? )
        strokeRate : number;
        heartRate : number; //bpm
        currentPace : number;  //500m pace
        averagePace : number;  //500m pace
        restDistance : number;
        restTime : number; //ms
        averagePower : number; //null when not multi plexed
    }
    export interface RowingAdditionalStatus2 {
        elapsedTime : number;  //mili seconds
        intervalCount : number;
        averagePower : number; //null when multiplexed
        totalCalories : number;
        splitAveragePace : number; //ms
        splitAveragePower: number;
        splitAverageCalories : number;
        lastSplitTime : number;
        lastSplitDistance : number;
    }
    export interface RowingStrokeData {
        elapsedTime : number;  //mili seconds
        distance : number;  //meters
        driveLength : number; //meters
        driveTime : number;
        strokeRecoveryTime : number;
        strokeDistance : number;
        peakDriveForce : number;
        averageDriveForce : number;
        workPerStroke : number; //null for multi plexed
        strokeCount : number;
    }
    export interface RowingAdditionalStrokeData {
        elapsedTime : number;  //mili seconds
        strokePower : number;  //watts
        strokeCalories : number; //cal/hr
        strokeCount : number;
        projectedWorkTime : number; //ms
        projectedWorkDistance : number; //meter
        workPerStroke : number;
    }
    export interface RowingSplitIntervalData {
        elapsedTime : number;  //mili seconds
        distance : number;  //meters
        intervalTime : number;
        intervalDistance : number;
        intervalRestTime : number;
        intervalRestDistance : number; //meter
        intervalType : IntervalType;
        intervalNumber : number;
    }
    export interface RowingAdditionalSplitIntervalData {
        elapsedTime : number;  //mili seconds
        intervalAverageStrokeRate : number;
        intervalWorkHeartrate : number;
        intervalRestHeartrate : number;
        intervalAveragePace : number;
        intervalTotalCalories : number;
        intervalAverageCalories:number;
        intervalSpeed : number;
        intervalPower : number;
        splitAverageDragFactor : number;
        intervalNumber : number;
    }
    export interface WorkoutSummaryData {
        logEntryDate : number;
        logEntryTime : number;
        elapsedTime : number;
        distance : number;
        averageStrokeRate : number;
        endingHeartrate : number;
        averageHeartrate : number;
        minHeartrate : number;
        maxHeartrate : number;
        dragFactorAverage : number;
        recoveryHeartRate : number;
        workoutType  : WorkoutType;
        averagePace : number; //null when multiplexed
    }
    export interface AdditionalWorkoutSummaryData {
        logEntryDate : number;
        logEntryTime : number;
        intervalType : IntervalType; //null when multiplexed
        intervalSize: number; //meters or seconds
        intervalCount: number;
        totalCalories: number;
        watts : number;
        totalRestDistance : number;
        intervalRestTime : number;
        averageCalories : number;
    }

    //only available when multiplex is true
    export interface AdditionalWorkoutSummaryData2 {
        logEntryDate : number;
        logEntryTime : number;
        averagePace : number;
        gameIdentifier : number;
        gameScore: number;
        ergMachineType: ErgmachineType;
    }
    export interface HeartRateBeltInformation {
        manufacturerId : number;
        deviceType: number;
        beltId : number;
    }
}
/** @internal */
module ergometer.ble {

/** @internal */
    export const  PMDEVICE =                             "CE060000-43E5-11E4-916C-0800200C9A66";

// Service UUIDs
    export const  PMDEVICE_INFOS_ERVICE =                  "CE060010-43E5-11E4-916C-0800200C9A66";
    export const  PMCONTROL_SERVICE =                     "CE060020-43E5-11E4-916C-0800200C9A66";
    export const  PMROWIN_GSERVICE =                      "CE060030-43E5-11E4-916C-0800200C9A66";

// Characteristic UUIDs for PM device info service
    export const  MODELNUMBER_CHARACTERISIC =             "CE060011-43E5-11E4-916C-0800200C9A66";
    export const  SERIALNUMBER_CHARACTERISTIC =           "CE060012-43E5-11E4-916C-0800200C9A66";
    export const  HWREVISION_CHARACTERISIC =              "CE060013-43E5-11E4-916C-0800200C9A66";
    export const  FWREVISION_CHARACTERISIC =              "CE060014-43E5-11E4-916C-0800200C9A66";
    export const  MANUFNAME_CHARACTERISIC =               "CE060015-43E5-11E4-916C-0800200C9A66";
    export const  MACHINETYPE_CHARACTERISIC =             "CE060016-43E5-11E4-916C-0800200C9A66";

// Characteristic UUIDs for PM control service
    export const  TRANSMIT_TO_PM_CHARACTERISIC =            "CE060021-43E5-11E4-916C-0800200C9A66";
    export const  RECEIVE_FROM_PM_CHARACTERISIC =           "CE060022-43E5-11E4-916C-0800200C9A66";

// Characteristic UUIDs for rowing service
    export const  ROWING_STATUS_CHARACTERISIC =            "CE060031-43E5-11E4-916C-0800200C9A66";
    export const  EXTRA_STATUS1_CHARACTERISIC =            "CE060032-43E5-11E4-916C-0800200C9A66";
    export const  EXTRA_STATUS2_CHARACTERISIC =            "CE060033-43E5-11E4-916C-0800200C9A66";
    export const  ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC ="CE060034-43E5-11E4-916C-0800200C9A66";
    export const  STROKE_DATA_CHARACTERISIC =              "CE060035-43E5-11E4-916C-0800200C9A66";
    export const  EXTRA_STROKE_DATA_CHARACTERISIC =         "CE060036-43E5-11E4-916C-0800200C9A66";
    export const  SPLIT_INTERVAL_DATA_CHARACTERISIC =       "CE060037-43E5-11E4-916C-0800200C9A66";
    export const  EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC =  "CE060038-43E5-11E4-916C-0800200C9A66";
    export const  ROWING_SUMMARY_CHARACTERISIC =           "CE060039-43E5-11E4-916C-0800200C9A66";
    export const  EXTRA_ROWING_SUMMARY_CHARACTERISIC =      "CE06003A-43E5-11E4-916C-0800200C9A66";
    export const  HEART_RATE_BELT_INFO_CHARACTERISIC =       "CE06003B-43E5-11E4-916C-0800200C9A66";
    export const  MULTIPLEXED_INFO_CHARACTERISIC =         "CE060080-43E5-11E4-916C-0800200C9A66";

    export const  NOTIFICATION_DESCRIPTOR =               "00002902-0000-1000-8000-00805f9b34fb";


// C2 Rowing Service - General Status Characteristic
// BLE payload definitions
    export const enum PM_Rowing_Status_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        DISTANCE_LO,
        DISTANCE_MID,
        DISTANCE_HI,
        WORKOUT_TYPE,
        INTERVAL_TYPE,
        WORKOUT_STATE,
        ROWING_STATE,
        STROKE_STATE,
        TOTAL_WORK_DISTANCE_LO,
        TOTAL_WORK_DISTANCE_MID,
        TOTAL_WORK_DISTANCE_HI,
        WORKOUT_DURATION_LO,
        WORKOUT_DURATION_MID,
        WORKOUT_DURATION_HI,
        WORKOUT_DURATION_TYPE,
        DRAG_FACTOR,
        BLE_PAYLOAD_SIZE
    }


// C2 Rowing Service - Additional Status 1 Characteristic
// BLE payload definitions
    export const enum PM_Extra_Status1_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        SPEED_LO,
        SPEED_HI,
        STROKE_RATE,
        HEARTRATE,
        CURRENT_PACE_LO,
        CURRENT_PACE_HI,
        AVG_PACE_LO,
        AVG_PACE_HI,
        REST_DISTANCE_LO,
        REST_DISTANCE_HI,
        REST_TIME_LO,
        REST_TIME_MID,
        REST_TIME_HI,
        BLE_PAYLOAD_SIZE
    }

    export const enum PM_Mux_Extra_Status1_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        SPEED_LO,
        SPEED_HI,
        STROKE_RATE,
        HEARTRATE,
        CURRENT_PACE_LO,
        CURRENT_PACE_HI,
        AVG_PACE_LO,
        AVG_PACE_HI,
        REST_DISTANCE_LO,
        REST_DISTANCE_HI,
        REST_TIME_LO,
        REST_TIME_MID,
        REST_TIME_HI,
        AVG_POWER_LO,
        AVG_POWER_HI,
        BLE_PAYLOAD_SIZE
    }

// C2 Rowing Service - Additional Status 2 Characteristic
// BLE payload definitions
    export const enum  PM_Extra_Status2_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        INTERVAL_COUNT,
        AVG_POWER_LO,
        AVG_POWER_HI,
        TOTAL_CALORIES_LO,
        TOTAL_CALORIES_HI,
        SPLIT_INTERVAL_AVG_PACE_LO,
        SPLIT_INTERVAL_AVG_PACE_HI,
        SPLIT_INTERVAL_AVG_POWER_LO,
        SPLIT_INTERVAL_AVG_POWER_HI,
        SPLIT_INTERVAL_AVG_CALORIES_LO,
        SPLIT_INTERVAL_AVG_CALORIES_HI,
        LAST_SPLIT_TIME_LO,
        LAST_SPLIT_TIME_MID,
        LAST_SPLIT_TIME_HI,
        LAST_SPLIT_DISTANCE_LO,
        LAST_SPLIT_DISTANCE_MID,
        LAST_SPLIT_DISTANCE_HI,
        BLE_PAYLOAD_SIZE
    }

    export const enum PM_Mux_Extra_Status2_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        INTERVAL_COUNT,
        TOTAL_CALORIES_LO,
        TOTAL_CALORIES_HI,
        SPLIT_INTERVAL_AVG_PACE_LO,
        SPLIT_INTERVAL_AVG_PACE_HI,
        SPLIT_INTERVAL_AVG_POWER_LO,
        SPLIT_INTERVAL_AVG_POWER_HI,
        SPLIT_INTERVAL_AVG_CALORIES_LO,
        SPLIT_INTERVAL_AVG_CALORIES_HI,
        LAST_SPLIT_TIME_LO,
        LAST_SPLIT_TIME_MID,
        LAST_SPLIT_TIME_HI,
        LAST_SPLIT_DISTANCE_LO,
        LAST_SPLIT_DISTANCE_MID,
        LAST_SPLIT_DISTANCE_HI,
        BLE_PAYLOAD_SIZE
    }


// C2 Rowing Service - Stroke Data Characteristic
// BLE payload definitions
    export const enum PM_Stroke_Data_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        DISTANCE_LO,
        DISTANCE_MID,
        DISTANCE_HI,
        DRIVE_LENGTH,
        DRIVE_TIME,
        STROKE_RECOVERY_TIME_LO,
        STROKE_RECOVERY_TIME_HI,
        STROKE_DISTANCE_LO,
        STROKE_DISTANCE_HI,
        PEAK_DRIVE_FORCE_LO,
        PEAK_DRIVE_FORCE_HI,
        AVG_DRIVE_FORCE_LO,
        AVG_DRIVE_FORCE_HI,
        WORK_PER_STROKE_LO,
        WORK_PER_STROKE_HI,
        STROKE_COUNT_LO,
        STROKE_COUNT_HI,
        BLE_PAYLOAD_SIZE
    }

    export const enum PM_Mux_Stroke_Data_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        DISTANCE_LO,
        DISTANCE_MID,
        DISTANCE_HI,
        DRIVE_LENGTH,
        DRIVE_TIME,
        STROKE_RECOVERY_TIME_LO,
        STROKE_RECOVERY_TIME_HI,
        STROKE_DISTANCE_LO,
        STROKE_DISTANCE_HI,
        PEAK_DRIVE_FORCE_LO,
        PEAK_DRIVE_FORCE_HI,
        AVG_DRIVE_FORCE_LO,
        AVG_DRIVE_FORCE_HI,
        STROKE_COUNT_LO,
        STROKE_COUNT_HI,
        BLE_PAYLOAD_SIZE
    }

// C2 Rowing Service - Extra Stroke Data Characteristic
// BLE payload definitions
    export const enum  PM_Extra_Stroke_Data_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        STROKE_POWER_LO,
        STROKE_POWER_HI,
        STROKE_CALORIES_LO,
        STROKE_CALORIES_HI,
        STROKE_COUNT_LO,
        STROKE_COUNT_HI,
        PROJ_WORK_TIME_LO,
        PROJ_WORK_TIME_MID,
        PROJ_WORK_TIME_HI,
        PROJ_WORK_DIST_LO,
        PROJ_WORK_DIST_MID,
        PROJ_WORK_DIST_HI,
        BLE_PAYLOAD_SIZE
    };

    export const enum PM_Mux_Extra_Stroke_Data_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        STROKE_POWER_LO,
        STROKE_POWER_HI,
        STROKE_CALORIES_LO,
        STROKE_CALORIES_HI,
        STROKE_COUNT_LO,
        STROKE_COUNT_HI,
        PROJ_WORK_TIME_LO,
        PROJ_WORK_TIME_MID,
        PROJ_WORK_TIME_HI,
        PROJ_WORK_DIST_LO,
        PROJ_WORK_DIST_MID,
        PROJ_WORK_DIST_HI,
        WORK_PER_STROKE_LO,
        WORK_PER_STROKE_HI,
        BLE_PAYLOAD_SIZE
    }

// C2 Rowing Service - Split/Interval Data Characteristic
// BLE payload definitions
    export const enum PM_Split_Interval_Data_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        DISTANCE_LO,
        DISTANCE_MID,
        DISTANCE_HI,
        SPLIT_TIME_LO,
        SPLIT_TIME_MID,
        SPLIT_TIME_HI,
        SPLIT_DISTANCE_LO,
        SPLIT_DISTANCE_MID,
        SPLIT_DISTANCE_HI,
        REST_TIME_LO,
        REST_TIME_HI,
        REST_DISTANCE_LO,
        REST_DISTANCE_HI,
        TYPE,
        INT_NUMBER,
        BLE_PAYLOAD_SIZE
    }

// C2 Rowing Service - Extra Split/Interval Data Characteristic
// BLE payload definitions
    export const enum PM_Extra_Split_Interval_Data_BLE_Payload
    {
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        STROKE_RATE,
        WORK_HR,
        REST_HR,
        AVG_PACE_LO,
        AVG_PACE_HI,
        CALORIES_LO,
        CALORIES_HI,
        AVG_CALORIES_LO,
        AVG_CALORIES_HI,
        SPEED_LO,
        SPEED_HI,
        POWER_LO,
        POWER_HI,
        AVG_DRAG_FACTOR,
        INT_NUMBER,
        BLE_PAYLOAD_SIZE
    }

// C2 Rowing Service - Workout Summary Data Characteristic
// BLE payload definitions
    export const enum PM_Workout_Summary_Data_BLE_Payload
    {
        LOG_DATE_LO,
        LOG_DATE_HI,
        LOG_TIME_LO,
        LOG_TIME_HI,
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        DISTANCE_LO,
        DISTANCE_MID,
        DISTANCE_HI,
        AVG_SPM,
        END_HR,
        AVG_HR,
        MIN_HR,
        MAX_HR,
        AVG_DRAG_FACTOR,
        RECOVERY_HR,
        WORKOUT_TYPE,
        AVG_PACE_LO,
        AVG_PACE_HI,
        BLE_PAYLOAD_SIZE
    }

    export const enum PM_Mux_Workout_Summary_Data_BLE_Payload
    {
        LOG_DATE_LO,
        LOG_DATE_HI,
        LOG_TIME_LO,
        LOG_TIME_HI,
        ELAPSED_TIME_LO,
        ELAPSED_TIME_MID,
        ELAPSED_TIME_HI,
        DISTANCE_LO,
        DISTANCE_MID,
        DISTANCE_HI,
        AVG_SPM,
        END_HR,
        AVG_HR,
        MIN_HR,
        MAX_HR,
        AVG_DRAG_FACTOR,
        RECOVERY_HR,
        WORKOUT_TYPE,
        BLE_PAYLOAD_SIZE
    }

// C2 Rowing Service - Extra Workout Summary Data Characteristic
// BLE payload definitions
    export const enum PM_Extra_Workout_Summary_Data_BLE_Payload
    {
        LOG_DATE_LO,
        LOG_DATE_HI,
        LOG_TIME_LO,
        LOG_TIME_HI,
        SPLIT_INT_TYPE,
        SPLIT_INT_SIZE_LO,
        SPLIT_INT_SIZE_HI,
        SPLIT_INT_COUNT,
        WORK_CALORIES_LO,
        WORK_CALORIES_HI,
        WATTS_LO,
        WATTS_HI,
        TOTAL_REST_DISTANCE_LO,
        TOTAL_REST_DISTANCE_MID,
        TOTAL_REST_DISTANCE_HI,
        INTERVAL_REST_TIME_LO,
        INTERVAL_REST_TIME_HI,
        AVG_CALORIES_LO,
        AVG_CALORIES_HI,
        DATA_BLE_PAYLOAD_SIZE
    };

    export const enum PM_Mux_Extra_Workout_Summary_Data_BLE_Payload
    {
        LOG_DATE_LO,
        LOG_DATE_HI,
        LOG_TIME_LO,
        LOG_TIME_HI,
        SPLIT_INT_SIZE_LO,
        SPLIT_INT_SIZE_HI,
        SPLIT_INT_COUNT,
        WORK_CALORIES_LO,
        WORK_CALORIES_HI,
        WATTS_LO,
        WATTS_HI,
        TOTAL_REST_DISTANCE_LO,
        TOTAL_REST_DISTANCE_MID,
        TOTAL_REST_DISTANCE_HI,
        INTERVAL_REST_TIME_LO,
        INTERVAL_REST_TIME_HI,
        AVG_CALORIES_LO,
        AVG_CALORIES_HI,
        BLE_PAYLOAD_SIZE
    }

    export const enum PM_Mux_Extra_Workout_Summary2_Data_BLE_Payload
    {
        LOG_DATE_LO,
        LOG_DATE_HI,
        LOG_TIME_LO,
        LOG_TIME_HI,
        AVG_PACE_LO,
        AVG_PACE_HI,
        GAME_ID,
        GAME_SCORE_LO,
        GAME_SCORE_HI,
        MACHINE_TYPE,
        DATA_BLE_PAYLOAD_SIZE
    } ;


// C2 Rowing Service - Heart Rate Belt Info Characteristic
// BLE payload definitions
    export const enum PM_Heart_Rate_Belt_Info_BLE_Payload
    {
        MANUFACTURER_ID,
        DEVICE_TYPE,
        BELT_ID_LO,
        BELT_ID_MID_LO,
        BELT_ID_MID_HI,
        BELT_ID_HI,
        BLE_PAYLOAD_SIZE
    }

// Multiplexed Information Data Type IDs
    export const enum PM_Multiplexed_Info_Type_ID
    {
        ROWING_GENERAL_STATUS = 0x31,
        ROWING_ADDITIONAL_STATUS1 = 0x32,
        ROWING_ADDITIONAL_STATUS2 = 0x33,
        STROKE_DATA_STATUS = 0x35,
        EXTRA_STROKE_DATA_STATUS = 0x36,
        SPLIT_INTERVAL_STATUS = 0x37,
        EXTRA_SPLIT_INTERVAL_STATUS = 0x38,
        WORKOUT_SUMMARY_STATUS = 0x39,
        EXTRA_WORKOUT_SUMMARY_STATUS1 = 0x3A,
        HEART_RATE_BELT_INFO_STATUS = 0x3B,
        EXTRA_WORKOUT_SUMMARY_STATUS2 = 0x3C
    }
}