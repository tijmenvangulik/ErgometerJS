# Web hid

Web hid is a new feature of chrome to access a usb hid device (a pm3-5) directly from a browser without
the need of a plugin. At the moment of writing the only desktop browser which is capable of web bluetooth is google chrome canary. This is still expermintal software and not ready for production. More info can be found on:

https://github.com/robatwilliams/awesome-webhid#status

Know problems

- Disconnect events do not yet work.
- Auto reconnect does not work
Know problems

- Disconnect events do not yet work.
- Auto reconnect does not work
- Web bluetooth has some security restrictions:
   * Start scan and the connect an only be called from a click event
   * The user has to select the device him selves, you can not do this from your own code
   * https is required (when not localhost)