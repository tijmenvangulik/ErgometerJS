package org.vangulik.usb.hid;

import java.io.IOException;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Arrays;
import java.util.Iterator;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONException;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.os.Build;
import android.util.Log;

public class UsbHid extends CordovaPlugin {
    private final String TAG = UsbHid.class.getSimpleName();

    private USBThreadDataReceiver usbThreadDataReceiver;

    private UsbManager manager;
    private UsbDeviceConnection connection;
    private UsbEndpoint endPointRead;
    private UsbEndpoint endPointWrite;
    private UsbDevice device;
    private PendingIntent mPermissionIntent;

    private CallbackContext readCallback;

    private int packetSize;
    private boolean skippZeroResults = false;
    private boolean skippFirstByteZero = false;

    private Byte[] bytes;
    private int writeTimeout = 500;
    private boolean forceClaim = true;
    private int readTimeout = 100;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        JSONObject arg_object = args.optJSONObject(0);

        if (action.equals("enumerateDevices")) {
            this.enumerateDevices(callbackContext);
            return true;
        } else if (action.equals("requestPermission")) {
            JSONObject opts = arg_object.has("opts")? arg_object.getJSONObject("opts") : new JSONObject();

            this.requestPermission(opts, callbackContext);
            return true;
        } else if (action.equals("open")) {
            JSONObject opts = arg_object.has("opts")? arg_object.getJSONObject("opts") : new JSONObject();
            this.open(opts, callbackContext);
            return true;
        } else if (action.equals("close")) {
            this.close( callbackContext);
            return true;
        } else if (action.equals("registerReadCallback")) {
            this.registerReadCallback(callbackContext);
            return true;
        } else if (action.equals("writeHex")) {
            JSONObject opts = arg_object.has("opts")? arg_object.getJSONObject("opts") : new JSONObject();

            this.writeHex(opts,callbackContext);
            return true;
        } else if (action.equals("writeReadHex")) {
            JSONObject opts = arg_object.has("opts")? arg_object.getJSONObject("opts") : new JSONObject();

            this.writeReadHex(opts,callbackContext);
            return true;
        }

        return false;
    }

    private void enumerateDevices(CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    UsbManager manager = (UsbManager) cordova.getActivity().getSystemService(Context.USB_SERVICE);
                    HashMap<String, UsbDevice> deviceList = manager.getDeviceList();
                    JSONArray result = new JSONArray();
                    for (UsbDevice usbDevice : deviceList.values()) {
                        JSONObject obj = new JSONObject();
                        addProperty(obj, "name", usbDevice.getDeviceName());
                        addProperty(obj, "vendorId", usbDevice.getVendorId());
                        addProperty(obj, "productId", usbDevice.getProductId());
                        if (Build.VERSION.SDK_INT>21 ) {
                            addProperty(obj, "serialNumber", usbDevice.getSerialNumber());
                            addProperty(obj, "productName", usbDevice.getProductName());
                        }

                        result.put(obj);
                    }
                    callbackContext.success(result);
                }
                catch (Exception e) {
                    callbackContext.error("Can not enumerate devices: "+e.getMessage());
                }

            }
        });


    }

    //lets thread sleep on pauze and start/stop the receiver
    @Override
    public void onPause(boolean value)
    {
        super.onPause(value);
        if (usbThreadDataReceiver!=null)
            usbThreadDataReceiver.stopThis();
        /*if(usbReceiver!=null) cordova.getActivity().unregisterReceiver(usbReceiver);*/
    }

    @Override
    public void onResume(boolean value)
    {

        super.onResume( value);
        if( endPointRead!=null && usbThreadDataReceiver!=null){
            usbThreadDataReceiver = new USBThreadDataReceiver();
            usbThreadDataReceiver.start();
        }

        //IntentFilter filter = new IntentFilter(UsbBroadcastReceiver.USB_PERMISSION);
        //filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        //filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
       // cordova.getActivity().registerReceiver(usbReceiver, filter);
    }

    //UsbBroadcastReceiver usbReceiver;
    private void requestPermission(final JSONObject opts, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                manager = (UsbManager) cordova.getActivity().getSystemService(Context.USB_SERVICE);
                try {

                    String name=opts.getString("name");
                    device = manager.getDeviceList().get(name);

                    mPermissionIntent = PendingIntent.getBroadcast(cordova.getActivity(), 0, new Intent(UsbBroadcastReceiver.USB_PERMISSION), 0);
                    IntentFilter filter = new IntentFilter(UsbBroadcastReceiver.USB_PERMISSION);
                    UsbBroadcastReceiver usbReceiver = new UsbBroadcastReceiver(callbackContext, cordova.getActivity());

                    cordova.getActivity().registerReceiver(usbReceiver, filter);
                    // ask permission
                    manager.requestPermission(device, mPermissionIntent);
                    callbackContext.success("Permisson given");
                } catch (Exception e) {
                    callbackContext.error("Can not get permission: "+e.getMessage());
                }
            }
        });
    }

    private void open(final JSONObject opts, final CallbackContext callbackContext) {
        //callbackContext.success("connected !");
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                if (device==null) {
                    callbackContext.error("device not set");
                    return;
                }
                UsbDeviceConnection c = manager.openDevice(device);
                if (c == null) {
                    callbackContext.error("Can not open device");
                    return;
                }

                connection = c;
                UsbInterface intf = device.getInterface(0);
                UsbEndpoint endpoint = intf.getEndpoint(0);
                endPointWrite=null;
                endPointRead=null;
                connection.claimInterface(intf, forceClaim);
                try {
                    if (UsbConstants.USB_DIR_IN == intf.getEndpoint(0).getDirection()) {
                        endPointRead = intf.getEndpoint(0);

                        //packetSize = 8;
                        if (opts.has("packetSize"))
                            packetSize=opts.getInt("packetSize");
                        else packetSize = endPointRead.getMaxPacketSize();
                        if (opts.has("skippZeroResults"))
                            skippZeroResults=opts.getBoolean("skippZeroResults");
                        if (opts.has("skippFirstByteZero"))
                            skippFirstByteZero=opts.getBoolean("skippFirstByteZero");

                        if (opts.has("writeTimeout"))
                            writeTimeout=opts.getInt("writeTimeout");
                        if (opts.has("readTimeout"))
                            readTimeout=opts.getInt("readTimeout");

                    }

                    if (intf.getEndpointCount()>=2 && UsbConstants.USB_DIR_OUT == intf.getEndpoint(1).getDirection()) {
                        endPointWrite = intf.getEndpoint(1);
                    }
                } catch (Exception e) {
                    Log.e("endPointWrite", "Error reading endpoints", e);
                    callbackContext.error("Error getting end points: "+e.getMessage());
                    return;
                }
                if( endPointRead!=null && readCallback!=null) {
                    try {
                        usbThreadDataReceiver = new USBThreadDataReceiver();
                        usbThreadDataReceiver.start();

                    } catch (Exception e) {
                        Log.e("open", "Can not open connection", e);
                        callbackContext.error("Can not open connection"+e.getMessage());
                        return;
                    }
                }
                callbackContext.success("Connection opened!");

            }
        });
    }

    private void close(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    // Make sure we don't die if we try to close an non-existing port!
                    if (connection != null) {
                        connection.close();
                    }
                    connection = null;
                    endPointRead=null;
                    endPointWrite=null;
                    usbThreadDataReceiver.stopThis();
                    callbackContext.success();
                }
                catch (Exception e) {
                    // deal with error
                    Log.d(TAG, e.getMessage());
                    callbackContext.error(e.getMessage());
                }

            }
        });
    }
    private void registerReadCallback(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    Log.d(TAG, "Registering Read Callback");
                    readCallback = callbackContext;
                    JSONObject returnObj = new JSONObject();
                    addProperty(returnObj, "registerReadCallback", "true");
                    // Keep the callback
                    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, returnObj);
                    pluginResult.setKeepCallback(true);
                    callbackContext.sendPluginResult(pluginResult);
                }
                catch (Exception e) {
                    Log.d(TAG, e.getMessage());
                    callbackContext.error(e.getMessage());
                }

            }
        });

    }

    private boolean writeHex_internal(final JSONObject opts, final CallbackContext callbackContext, boolean returnSucess) {
        if (connection == null) {
            callbackContext.error("Not connected");
            return false;
        }
        if (endPointWrite == null) {
            callbackContext.error("No end point available to write to");
            return false;
        }

        try {
            String data=opts.getString("data");
            int localPacketsize=packetSize;
            if (opts.has("packetsize"))
                localPacketsize=opts.getInt("packetsize");
            int localTimeout=writeTimeout;
            if (opts.has("writeTimeout"))
                localTimeout=opts.getInt("writeTimeout");
            Log.d(TAG, data);
            byte[] buffer = hexStringToByteArray(data,localPacketsize);
            int result = connection.bulkTransfer(endPointWrite,buffer,localPacketsize, localTimeout);
            if (result<0) {
                callbackContext.error("Can not transfer data to the device.");
                return false;
            }
            else if (returnSucess){
                callbackContext.success(result + " bytes written.");
            }

        }
        catch (Exception e) {
            // deal with error
            Log.d(TAG, e.getMessage());
            callbackContext.error(e.getMessage());
            return false;
        }
        return true;
    }
    /**
     * Write hex on the serial port
     * @param data the {@link String} representation of the data to be written on the port as hexadecimal string
     *             e.g. "ff55aaeeef000233"
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void writeHex(final JSONObject opts, final CallbackContext callbackContext) {

        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                writeHex_internal(opts,callbackContext,true);


            }
        });
    }
    private void writeReadHex(final JSONObject opts, final CallbackContext callbackContext) {

        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    if (readCallback!=null) {
                        callbackContext.error("Read/write can not be used when the read callback is registered.");
                        return;
                    }
                    if (writeHex_internal(opts,callbackContext,false)) {
                        int localPacketsize=packetSize;
                        if (opts.has("packetsize"))
                            localPacketsize=opts.getInt("packetsize");
                        int localTimeout=readTimeout;
                        if (opts.has("readTimeout"))
                            localTimeout=opts.getInt("readTimeout");

                        final byte[] buffer = new byte[packetSize];
                        int bytesReceived = connection.bulkTransfer(endPointRead, buffer, localPacketsize, localTimeout);
                        if (bytesReceived>=0) {

                            if (!receivedData_Internal(buffer,bytesReceived,callbackContext,localPacketsize)) {
                                callbackContext.error("No data returned");
                            }
                        }
                        else callbackContext.error("Read error");
                    }
                }
                catch (Exception e) {
                    callbackContext.error("Error writing and reading: "+e.getMessage());
                }



            }
        });
    }
    /**
     * Convert a given string of hexadecimal numbers
     * into a byte[] array where every 2 hex chars get packed into
     * a single byte.
     *
     * E.g. "ffaa55" results in a 3 byte long byte array
     *
     * @param s
     * @return
     */
    private byte[] hexStringToByteArray(String s,int bufSize) {
        int len = s.length();
        int strBytesCount=len/2;
        if (strBytesCount>bufSize) bufSize=strBytesCount;
        byte[] data = new byte[bufSize];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }
    /***************************/

    private void addProperty(JSONObject obj, String key, Object value) {
        try {
            obj.put(key, value);
        } catch (JSONException e) {
        }
    }
    private boolean receivedData_Internal(byte[] dataIn, int bytesReceived, CallbackContext pReadCallBack, int pPacketsize) {
        byte[] data =dataIn;
        if (bytesReceived<0) return false;

        if (bytesReceived < pPacketsize) {
            data = Arrays.copyOfRange(dataIn, 0, bytesReceived);
        }

        int i=0;
        if (skippFirstByteZero)  {
            if (data[i]==0) i=data.length;
        }
        else {
            while (skippZeroResults && i<data.length && data[i]==0) i++;
        }

        if (i<data.length) { //if there is any none zero data
            PluginResult result = new PluginResult(PluginResult.Status.OK, data);
            result.setKeepCallback(true);
            pReadCallBack.sendPluginResult(result);
            return true;
        }
        return false;
    }

    private void updateReceivedData(byte[] data, int bytesReceived) {
        if (readCallback != null) {
        //check if the return is all zero, when it is then do not send the result
            receivedData_Internal(data,bytesReceived,readCallback,packetSize);
        }

    }

    /***************************/

    private class USBThreadDataReceiver extends Thread {

        private volatile boolean isStopped;

        public USBThreadDataReceiver() {
        }

        @Override
        public void run() {
            try {
                if (connection != null && endPointRead != null) {
                    while (!isStopped) {
                        final byte[] buffer = new byte[packetSize];
                        int bytesReceived = connection.bulkTransfer(endPointRead, buffer, packetSize, readTimeout);
                        if (bytesReceived>0 && !isStopped) {
                            updateReceivedData(buffer,packetSize);
                        }

                        if (bytesReceived>0 && bytesReceived!=bytesReceived) {
                            Log.e(TAG, "Warning packet not fully read");
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error in receive thread", e);
            }
        }


        public void stopThis() {
            if (this!=null)
               isStopped = true;
        }

        public String decodeUtf8(byte[] src) {
            return new String(src, UTF8_CHARSET);
        }

        private final Charset UTF8_CHARSET = Charset.forName("UTF-8");
    }
}