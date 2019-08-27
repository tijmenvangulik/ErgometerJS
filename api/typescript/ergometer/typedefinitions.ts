/**
 * Created by tijmen on 28-12-15.
 */
namespace ergometer {

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
        justRowNoSplits,
        justRowSplits,
        fixedDistanceNoAplits,
        fixedDistanceSplits,
        fixedTimeNoAplits,
        fixedTimeAplits,
        fixedTimeInterval,
        fixedDistanceInterval,
        variableInterval,
        variableUndefinedRestInterval,
        fixedCalorie,
        fixedWattMinutes
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
    export const enum Program {
        Programmed,
        StandardList1,
        StandardList2,
        StandardList3,
        StandardList4,
        StandardList5,
        CustomList1,
        CustomList2,
        CustomList3,
        CustomList4,
        CustomList5,
        FavoritesList1,
        FavoritesList2,
        FavoritesList3,
        FavoritesList4,
        FavoritesList5,
    }
    export  const enum Unit {
        distanceMile             =0x01,
        distanceMile1             =0x02,
        distanceMile2             =0x03,
        distanceMile3             =0x04,
        distanceFeet             =0x05,
        distanceInch             =0x06,
        weightLbs                =0x07,
        weightLbs1                =0x08,
        distanceFeet10           	=0x0a,
        speedMilePerHour          =0x10,
        speedMilePerHour1          =0x11,
        speedMilePerHour2          =0x12,
        speedFeetPerMinute        =0x13,
        distanceKm               =0x21,
        distanceKm1               =0x22,
        distanceKm2               =0x23,
        distanceMeter            =0x24,
        distanceMeter1            =0x25,
        distance_cm               =0x26,
        weightKg                 =0x27,
        weightKg1                 =0x28,
        speedKmPerHour            =0x30,
        speedKmPerHour1            =0x31,
        speedKmPerHour2            =0x32,
        speedMeterPerMinute       =0x33,
        paceMinutePermile        =0x37,
        paceMinutePerkm          =0x38,
        paceSecondsPerkm         =0x39,
        paceSecondsPermile       =0x3a,
        distanceFloors           =0x41,
        distanceFloors1           =0x42,
        distanceSteps            =0x43,
        distanceRevs             =0x44,
        distanceStrides          =0x45,
        distanceStrokes          =0x46,
        miscBeats                =0x47,
        energyCalories           =0x48,
        gradePercent             =0x4a,
        gradePercent2             =0x4b,
        gradePercent1             =0x4c,
        cadenceFloorsPerMinute1   =0x4f,
        cadenceFloorsPerMinute   =0x50,
        cadenceStepsPerMinute    =0x51,
        cadenceRevsPerMinute     =0x52,
        cadenceStridesPerMinute  =0x53,
        cadenceStrokesPerMinute  =0x54,
        miscBeatsPerMinute       =0x55,
        burnCaloriesPerMinute    =0x56,
        burnCaloriesPerHour      =0x57,
        powerWatts               =0x58,
        energyInchlb             =0x5a,
        energyFootlb             =0x5b,
        energyNm                 =0x5c
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
