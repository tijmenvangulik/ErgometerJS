ErgometerJS running in react Native

I have not yet made exact installation instructions. The follwoing

Install react native
  https://facebook.github.io/react-native/docs/getting-started.html#content

You should install react-native-ble (https://github.com/jacobrosenthal/react-native-ble)
  The react native library must be linked in the XCode project

Run the project:
  npm start

  react-native run-ios

The app can only connect to the ergometer when it is running on the phone.

I have added a simple "module.exports" wrapper around the ergometer.js code to be able to require it.
