# Simple Cordova

! this demo is obsolete because it uses an very old ble driver , check the demo ble_cordova demo  which uses an new ble driver !

first install Cordova

    npm install -g cordova
    (or the same as I used: npm install -g cordova@5.4.1 )

in the command line go to dir demos\simplecodova

add one ore more platforms which you want to test (only ios, android and windows (8.1) are possible)

    cordova platform add ios
    cordova platform add android
    cordova platform add windows
    
optional: update ble plugin to get the latest

    cordova plugin rm cordova-plugin-ble
    cordova plugin add cordova-plugin-ble

To build and run in the emulator 

    cordova run ios

Blue tooth will not work in an emulator so it is better to test directly on your device:

    cordova --device run ios

Check the console for the ergometer data. (you can read the log by starting a browser and debug the cordova app.
GabDebug is a handy tool for is. For debugging you should enable debug mode in the build properties the platform project)
