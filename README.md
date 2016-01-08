Do a download or checkout from github (https://github.com/tijmenvangulik/MobileErgometer)

open a command prompt on the downloaded directory and type

    npm install

to build the driver and the demo from the original typescript source. (not required they are already build)
    npm run build

after the build the driver will be located in
    driver\lib\ergometer.js

the description of the interface can be viewed as type script definition file. (this is generated from the source)
    driver\lib\ergometer.d.ts

To use the library you need all the files in the lib directory and include it in your cordova phone gab app
	<script src="libs/ergometer.js"></script>
	<script src="libs/jquery/jquery.js"></script>
	<script src="libs/evothings/evothings.js"></script>
	<script src="libs/evothings/easyble/easyble.js"></script>


Demo Simple Cordova

first install Cordova

    npm install -g cordova
    (or the same as I used: npm install -g cordova@5.4.1 )

in the command line go to dir demos\simplecodova

add one ore more platforms which you want to test (only ios and android are possible)
    cordova platform add ios
    cordova platform add android

optional: update ble plugin to get the latest
    cordova plugin rm cordova-plugin-ble
    cordova plugin add cordova-plugin-ble

to build type
  cordova build

to run in the emulator use
cordova emulate ios
cordova run ios
