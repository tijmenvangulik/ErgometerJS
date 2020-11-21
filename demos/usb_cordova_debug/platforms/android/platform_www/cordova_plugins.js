cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "org.vangulik.usb.hid.UsbHid",
      "file": "plugins/org.vangulik.usb.hid/www/UsbHid.js",
      "pluginId": "org.vangulik.usb.hid",
      "clobbers": [
        "cordova.plugins.UsbHid"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.4",
    "org.vangulik.usb.hid": "0.0.1"
  };
});