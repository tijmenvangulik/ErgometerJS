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
