# ionic 2

Example how to integrate the ErgomterJS into ionic2. The blue tooth driver runs outside angular so the
change detection does not work. For this reason the change detection is called manually in this demo. 

When not already installed inionic

    npm install -g ionic@beta
    
    npm install

add the blue tooth plugin

    cordova plugin add cordova-plugin-ble

Run in the web browser 

    ionic serve

blue tooth will only work on the device it selves so deploy it on the device to do further testing

    ionic platform add ios

    ionic run ios