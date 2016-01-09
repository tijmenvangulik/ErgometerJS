# Introduction

The Mobile Ergometer project is a cordova/ phonegap driver for the concept2 ergometer with a
PM5 performance monitor.

I hope this project will become a shared effort to make it easier to write next generation ergometer software.

Tijmen 
Tijmen@vangulik

# Project features

* The project is open source and and it is based on open source project. (appache 2 license) 
* Uses low power blue tooth (BLE) connection.
* Written in typescript which is compiled to javascript. You can use the driver without typescript.
* Platform independent (cordova/ phonegap /ionic)
* For now the internal ble driver only works with ios and android.  
* API definitions can be found in a separate typescript definition file (ergometer.d.ts).  

    http://www.concept2.com/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf

# Todo

* Make a better conversions of some of the values which the ergometer returns. 
* Make it possible to call csafe commands
* Make an event to receive power curves (need csafe for this)
* Write a demo of an app which can really be used. (now it)
 
# Installation

To make it work you need:

* An concept2 ergometer with PM5
* An android or iphone with BLE capability.
* npm which can be downloaded from https://www.npmjs.com

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

to build and run in the emulator 

    cordova run ios

Blue tooth will not work in an emulator so it is better to test directly on your device:

    cordova --device run ios

Check the console for the ergometer data. (you can read the log by starting a browser and debug the cordova app.
GabDebug is a handy tool for is. For debugging you should enable debug mode in the build properties the platform project)