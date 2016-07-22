# Web bluetooth

Web bluetooth is an emerging standard to access a bluetooth device directly from a browser without
the need of a plugin. At the moment of writing the only desktop browser which is capable of web bluetooth
is google chrome canary. This is still beta software and not ready for production. You can check  the support
on:

* [web bluetooth supported browsers](https://github.com/WebBluetoothCG/web-bluetooth/blob/gh-pages/implementation-status.md#chrome)
* [more info on web bluetooth](https://github.com/WebBluetoothCG/web-bluetooth)

The web bluetooth feature is still a beta fature. I have not yet been able to test everyting

Know problems

- Disconnect events do not yet work.
- Auto reconnect does not work
- I have to press twice on the connect button to be able to get my ergometer in the list
- Web bluetooth has some security restrictions:
   * Start scan and the connect an only be called from a click event
   * The user has to select the device him selves, you can not do this from your own code