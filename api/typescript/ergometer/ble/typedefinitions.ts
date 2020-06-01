/**
 * Created by tijmen on 16-01-16.
 */
/** @internal */
namespace ergometer.ble {

    /** @internal */
    export const  PMDEVICE =                             "ce060000-43e5-11e4-916c-0800200c9a66";

    export const  HEART_RATE_DEVICE_SERVICE =            "0000180d-0000-1000-8000-00805f9b34fb"   // "heart_rate";
    
    export const HEART_RATE_MEASUREMENT =                "00002a37-0000-1000-8000-00805f9b34fb"
   
// Service UUIDs
    export const  PMDEVICE_INFO_SERVICE =                  "ce060010-43e5-11e4-916c-0800200c9a66";
    export const  PMCONTROL_SERVICE =                     "ce060020-43e5-11e4-916c-0800200c9a66";
    export const  PMROWING_SERVICE =                      "ce060030-43e5-11e4-916c-0800200c9a66";

// Characteristic UUIDs for PM device info service
    export const  MODELNUMBER_CHARACTERISIC =             "ce060011-43e5-11e4-916c-0800200c9a66";
    export const  SERIALNUMBER_CHARACTERISTIC =           "ce060012-43e5-11e4-916c-0800200c9a66";
    export const  HWREVISION_CHARACTERISIC =              "ce060013-43e5-11e4-916c-0800200c9a66";
    export const  FWREVISION_CHARACTERISIC =              "ce060014-43e5-11e4-916c-0800200c9a66";
    export const  MANUFNAME_CHARACTERISIC =               "ce060015-43e5-11e4-916c-0800200c9a66";
    export const  MACHINETYPE_CHARACTERISIC =             "ce060016-43e5-11e4-916c-0800200c9a66";

// Characteristic UUIDs for PM control service
    export const  TRANSMIT_TO_PM_CHARACTERISIC =            "ce060021-43e5-11e4-916c-0800200c9a66";
    export const  RECEIVE_FROM_PM_CHARACTERISIC =           "ce060022-43e5-11e4-916c-0800200c9a66";

// Characteristic UUIDs for rowing service
    export const  ROWING_STATUS_CHARACTERISIC =            "ce060031-43e5-11e4-916c-0800200c9a66";
    export const  EXTRA_STATUS1_CHARACTERISIC =            "ce060032-43e5-11e4-916c-0800200c9a66";
    export const  EXTRA_STATUS2_CHARACTERISIC =            "ce060033-43e5-11e4-916c-0800200c9a66";
    export const  ROWING_STATUS_SAMPLE_RATE_CHARACTERISIC ="ce060034-43e5-11e4-916c-0800200c9a66";
    export const  STROKE_DATA_CHARACTERISIC =              "ce060035-43e5-11e4-916c-0800200c9a66";
    export const  EXTRA_STROKE_DATA_CHARACTERISIC =         "ce060036-43e5-11e4-916c-0800200c9a66";
    export const  SPLIT_INTERVAL_DATA_CHARACTERISIC =       "ce060037-43e5-11e4-916c-0800200c9a66";
    export const  EXTRA_SPLIT_INTERVAL_DATA_CHARACTERISIC =  "ce060038-43e5-11e4-916c-0800200c9a66";
    export const  ROWING_SUMMARY_CHARACTERISIC =           "ce060039-43e5-11e4-916c-0800200c9a66";
    export const  EXTRA_ROWING_SUMMARY_CHARACTERISIC =      "ce06003a-43e5-11e4-916c-0800200c9a66";
    export const  HEART_RATE_BELT_INFO_CHARACTERISIC =       "ce06003b-43e5-11e4-916c-0800200c9a66";
    export const  MULTIPLEXED_INFO_CHARACTERISIC =         "ce060080-43e5-11e4-916c-0800200c9a66";

    export const  NOTIFICATION_DESCRIPTOR =               "00002902-0000-1000-8000-00805f9b34fb";

    export const  PACKET_SIZE = 20;

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