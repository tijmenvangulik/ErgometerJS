# Web bluetooth

Web bluetooth is an emerging standard to access a bluetooth device directly from a browser without
the need of a plugin. At the moment of writing it works only in chrome (both mobile and desktop)
on:

* [web bluetooth supported browsers](https://github.com/WebBluetoothCG/web-bluetooth/blob/gh-pages/implementation-status.md#chrome)
* [more info on web bluetooth](https://github.com/WebBluetoothCG/web-bluetooth)


Know problems

- Disconnect events do not yet work.
- Auto reconnect does not work
ergometer in the list
- Web bluetooth has some security restrictions:
   * Start scan and the connect an only be called from a click event
   * The user has to select the device him selves, you can not do this from your own code
   * https is required (when not localhost)