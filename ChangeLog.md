- 1.5.0
   * fix problem when combining large commands with a detail code. The length was not set correctly which resulted into not executing the commands 
   * Support for creating workouts. Blue tooth supports all features. For USB you need authentication to use all proprietary commands . Please contact concept2 for full USB support.
   * Included documentation and examples for the new workout features
   * Breaking changes
     * Renamed WorkoutType.fixedTimeAplits to WorkoutType.fixedTimeSplits
     * Removed  registerStandardLongGet
     * Moved setWorkoutType 
     * IntervalType renamed dist and cal to distance and calories

- 1.4.8
   New values for usb,:
   * strokeDistance;
   * driveTime;
   * strokeRecoveryTime;
   * strokeCount;
- 1.4.6
  * Fixed PM5 usb communication problem, On some hardware/firmware combinations the buffer size was higher than expected. This gives problems with newer PM5 devices.
- 1.4.5
  * Made a work around for ble central bug for ios (1.3.1) You have run start scan twice to get the scan to work on ios13
- 1.4.4
  * Cordova ios has very late library initialization (even after device ready). Recheck if the driver needs initialization just before connecting 
  * Improved error handling and stop scan when driver could not be found
- 1.4.3
  * Upgrade android to 9.0.0 (api level 29 needed for the android store)
  * Removed obsolete simple cordova demo
  * fix connection issue for usb demo when connecting for the first time
- 1.4.2
  * When multi plexing is enabled on android devices it did not receive any events because a disable was send as last. After this fix connecting with multi plex should also be faster.
- 1.4.1
  * after c2 firmware is updated , the power curve contains often two curve. made a workaround to detect the correct end. 
- 1.4.0
  * Separate blue tooth Heart rate monitor class which makes use of the existing driver infra structure. This is use full for devices like the PM3 which does not support heart rate.
- 1.3.7
  * BLE: fix strokes value
  * BLE: fix power value
  * USB: Fixed time workout EndDuration/time is now correctly set
- 1.3.6
  * fixed breaking change in web hid api
- 1.3.5
  * New Ble central driver for cordova + demo.  Currently bleat + evo things ble was used on cordova. This driver is not supported any more and there where a lot of errors in the log. So I replaced it by the popular ble central.
  * For ble the notification enable/disable was called too many times. This fix can prevent initial connection problems on some ble drivers.
  * Expose the driver property so it can be set.
- 1.3.4
  * added minified version of ergometer.js
  * Merge long config commands when they are directly after each other
  * Added sortCommands property (by default switched off) This sorts the commands so they can be merged for efficiency.
  * Refactored sending commands (added an extra buffer and removed wait state)
  * Reduced calls when not yet rowing  
- 1.3.3
  * Increased accuracy of usb 
- 1.3.2
  * Add missing stuffing
- 1.3.1
  * Added csafe state to the receive buffer and access from the command to the receive buffer
  * more async refactorings for better stabliity
  * Small bug fixes 
- 1.3.0 
  * Refactored internals for better stability of the usb csafe commands (csafe command processing could stop after some time.) 
  * Breaking change: the csafebuffer is not a property of the monitor any more. It is replaced by a function newCsafeBuffer() which creates a new buffer on every call. This prevents potential async problems.
  * the clear function of the csafebuffer is removed. (it is not needed any more because newCsafeBuffer creates every time an empty buffer )
- 1.2.0
  * Cordova android usb support
- 1.1.0
  * Added WebHid support
  * The promise of the send function is now resolved after receiving all the data. (for both usb and ble)
  * Error handling and connection stability enhancements
- 1.0.1
   * Fixed bugs in Usb part
- 1.0.0
   * Added USB support for PM3, PM4, PM5 for electron and node
     I am  anticipating on the next WebHid standard which should add browser support for Usb devices. I will also check if it is possible to support cordova.
   * Make it possible to set the driver
   * Breaking change: the PerformanceMonitor is now named PerformanceMonitorBle
   * Fix: Web blue tooth driver dit not notice when device is disconnected
   * Upgraded Electron demo. The demo does not use web bluetooth instead of noble.
- 0.0.12
    * Web bluetooth Fix: web blue tooth messages stop after some time.
- 0.0.11
    * added web bluetooth support
- 0.0.10
     * ionic 2 example
     * moved readme's
- 0.0.9
     * Upgraded bleat 0.1.0 
        - The bleat bug fixes are not needed any more. 
        - Still use the bleat classic interface
        - The ergometer api is not changed but you will need to include other bleat javascript libraries in your html/javascript.
          See the demo's for the details
     * Upgraded to typescript 1.8.2
     * Made a start with implementing Web-bluetooth. In the future this allows you to run the app from a normal browser. 
       This is still work in progress
- 0.0.8 
     * Record and replay events. This is use full for:
        - Writing code without the constant need of an ergometer 
        - You can test code in an phone emulator (emulators do not have access to bluetooth hardware)
        - Writing unit tests
        - Record issues and send them to some one else to fix.
     * added a demo project for record and replay
- 0.0.7
     * More commands
     * Skipp some strange return values which look like corrupted or undocumented return values
     * Short hand notation for some simple get and set commands
     * Program command , the value now a correct type and the property program is now named value
- 0.0.6
     * Refactored all internal error handling to make use of Promises
     * Made internal driver layer based on Promises which gives some more protection and 
       will make recording easier in the future.
- 0.0.5
    * Improved npm build script and typescript config files
    * Send now returns a Promise. Changed the demo for this.
      I plan to make more use of promises to clean up some internal error handling code.
- 0.0.4
     * Electron demo for desktop apps
    * separated the demo code from the platform code
    * Refactored error handling
    * Renamed project from MobileErgometer to ErgometerJS
- 0.0.3 
 * easy ble is replaced by bleat (still uses the evothings ble drivers)
   Easy ble is replaced by bleat. With some small changes in bleat api my ergometer api is still backwards compatible. 
    
You only need to change the javascript included file

    <script src="libs/evothings/easyble/easyble.js"></script>

   to

    <script src="libs/bleat.js"></script>

 * bleat (https://github.com/thegecko/bleat) will allow multiple platforms

     * Android/iOS/Windows (using Evothings/Cordova/PhoneGap) https://github.com/evothings/cordova-ble/blob/master/ble.js
     * Mac/Linux/Windows (using noble on Node.js) https://github.com/sandeepmistry/noble
     * ChromeOS https://developer.chrome.com/apps/bluetoothLowEnergy
- 0.0.2 New features: 
    * csafe framework 
    * power curve event and csafe command
    * some simple csafe commands
- 0.0.1 First version
