/* @license
 *
 * BLE Abstraction Tool: core functionality - bleat specification
 * Version: 0.0.15
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Rob Moran
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// https://github.com/umdjs/umd
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory();
    } else {
        // Browser globals with support for web workers (root is window)
        root.bleat = factory();
    }
}(this, function() {
    "use strict";

    var adapter = null;
    var adapters = {};

    // Helpers
    var onError = null;
    function raiseError(msg) {
        return function(error) {
            if (onError) onError(msg + ": " + error);
        };
    }

    function handleError(errorFn,msg) {
        return function(error) {
            if (onError) onError(msg + ": " + error);
            if (errorFn) errorFn(msg + ": " + error);
        };
    }

    function executeFn(fn) {
        return function() {
            if (typeof fn === "function") {
                var args = [].slice.call(arguments);
                fn.apply(this, args);
            }
        };
    }

    function AsyncWait(finishFn) {
        var count = 0;
        var callbackAdded = false;
        this.addCallback = function(fn) {
            count++;
            callbackAdded = true;
            return function() {
                if (fn) fn.apply(null, arguments);
                if (--count === 0 && finishFn) finishFn();
            };
        };
        this.finish = function() {
            if (!callbackAdded && finishFn) finishFn();
        };
    }

    function canonicalUUID(uuid) {
        if (typeof uuid === "number") uuid = uuid.toString(16);
        if (uuid.length <= 8) uuid = ("00000000" + uuid).slice(-8) + "-0000-1000-8000-00805f9b34fb";
        uuid = uuid.toLowerCase();
        if (uuid.length === 32) uuid = uuid.match(/^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})$/).splice(1).join("-");
        return uuid;
    }

    // Device Object
    var Device = function(address, name, serviceUUIDs) {
        this.address = address;
        this.name = name;
        this.serviceUUIDs = serviceUUIDs;
        this.connected = false;
        this.rssi=null;
        this.services = {};
    };
    Device.prototype.hasService = function(serviceUUID) {
        return this.serviceUUIDs.some(function(uuid) {
            return (uuid === serviceUUID);
        });
    };
    Device.prototype.connect = function(connectFn, disconnectFn, suppressDiscovery,errorFn) {
        adapter.connect(this, function() {
            this.connected = true;
            if (suppressDiscovery) return executeFn(connectFn)();
            this.discoverAll(connectFn);
        }.bind(this), function() {
            this.connected = false;
            this.services = {};
            executeFn(disconnectFn)();
        }.bind(this), handleError(errorFn,"connect error"));
    };
    Device.prototype.disconnect = function() {
        adapter.disconnect(this, raiseError("disconnect error"));
    };
    Device.prototype.discoverServices = function(serviceUUIDs, completeFn) {
        if (this.connected === false) return raiseError("discovery error")("device not connected");
        if (typeof serviceUUIDs === "function") {
            completeFn = serviceUUIDs;
            serviceUUIDs = [];
        } else if (typeof serviceUUIDs === "string") {
            serviceUUIDs = [serviceUUIDs];
        }
        adapter.discoverServices(this, serviceUUIDs, executeFn(completeFn), raiseError("service discovery error"));
    };
    Device.prototype.discoverAll = function(completeFn) {
        if (this.connected === false) return raiseError("discovery error")("device not connected");
        var wait = new AsyncWait(completeFn);

        this.discoverServices(wait.addCallback(function() {
            Object.keys(this.services).forEach(function(serviceUUID) {
                var service = this.services[serviceUUID];

                service.discoverIncludedServices(wait.addCallback());

                service.discoverCharacteristics(wait.addCallback(function() {
                    Object.keys(service.characteristics).forEach(function(characteristicUUID) {
                        var characteristic = service.characteristics[characteristicUUID];
                        characteristic.discoverDescriptors(wait.addCallback());
                    }, this);
                }.bind(this)));

            }, this);
        }.bind(this)));

        wait.finish();
    };

    // Service Object
    var Service = function(handle, uuid, primary) {
        this._handle = handle;
        this.uuid = uuid;
        this.primary = primary;
        this.includedServices = {};
        this.characteristics = {};
    };
    Service.prototype.discoverIncludedServices = function(serviceUUIDs, completeFn) {
        if (typeof serviceUUIDs === "function") {
            completeFn = serviceUUIDs;
            serviceUUIDs = [];
        } else if (typeof serviceUUIDs === "string") {
            serviceUUIDs = [serviceUUIDs];
        }
        adapter.discoverIncludedServices(this, serviceUUIDs, executeFn(completeFn), raiseError("included service discovery error"));
    };
    Service.prototype.discoverCharacteristics = function(characteristicUUIDs, completeFn) {
        if (typeof characteristicUUIDs === "function") {
            completeFn = characteristicUUIDs;
            characteristicUUIDs = [];
        } else if (typeof characteristicUUIDs === "string") {
            characteristicUUIDs = [characteristicUUIDs];
        }
        adapter.discoverCharacteristics(this, characteristicUUIDs, executeFn(completeFn), raiseError("characteristic discovery error"));
    };

    // Characteristic Object
    var Characteristic = function(handle, uuid, properties) {
        this._handle = handle;
        this.uuid = uuid;
        this.properties = properties;
        this.descriptors = {};
    };
    Characteristic.prototype.discoverDescriptors = function(descriptorUUIDs, completeFn) {
        if (typeof descriptorUUIDs === "function") {
            completeFn = descriptorUUIDs;
            descriptorUUIDs = [];
        } else if (typeof descriptorUUIDs === "string") {
            descriptorUUIDs = [descriptorUUIDs];
        }
        adapter.discoverDescriptors(this, descriptorUUIDs, executeFn(completeFn), raiseError("descriptor discovery error"));
    };
    Characteristic.prototype.read = function(completeFn,errorFn) {
        adapter.readCharacteristic(this, executeFn(completeFn), handleError(errorFn,"read characteristic error"));
    };
    Characteristic.prototype.write = function(bufferView, completeFn,errorFn) {
        adapter.writeCharacteristic(this, bufferView, executeFn(completeFn), handleError(errorFn,"write characteristic error"));
    };
    Characteristic.prototype.enableNotify = function(notifyFn, completeFn,errorFn) {
        adapter.enableNotify(this, executeFn(notifyFn), executeFn(completeFn), handleError(errorFn,"enable notify error"));
    };
    Characteristic.prototype.disableNotify = function(completeFn,errorFn) {
        adapter.disableNotify(this, executeFn(completeFn), handleError(errorFn,"disable notify error"));
    };

    // Descriptor Object
    var Descriptor = function(handle, uuid) {
        this._handle = handle;
        this.uuid = uuid;
    };
    Descriptor.prototype.read = function(completeFn) {
        adapter.readDescriptor(this, executeFn(completeFn), raiseError("read descriptor error"));
    };
    Descriptor.prototype.write = function(bufferView, completeFn) {
        adapter.writeDescriptor(this, bufferView, executeFn(completeFn), raiseError("write descriptor error"));
    };

    // Main Module
    return {
        _Device: Device,
        _Service: Service,
        _Characteristic: Characteristic,
        _Descriptor: Descriptor,
        _canonicalUUID: canonicalUUID,
        _addAdapter: function(adapterName, definition) {
            adapters[adapterName] = definition;
            adapter = definition;
        },
        init: function(readyFn, errorFn, adapterName) {
            onError = errorFn;
            if (adapterName) adapter = adapters[adapterName];
            if (!adapter) return raiseError("init error")("adapter not found");
            adapter.init(executeFn(readyFn), raiseError("init error"));
        },
        startScan: function(serviceUUIDs, foundFn) {
            if (typeof serviceUUIDs === "function") {
                foundFn = serviceUUIDs;
                serviceUUIDs = [];
            } else if (typeof serviceUUIDs === "string") {
                serviceUUIDs = [serviceUUIDs];
            }
            adapter.stopScan(raiseError("stop scan error"));
            var devices = {};
            adapter.startScan(serviceUUIDs, function(device) {
                if (devices[device.address]) return;
                devices[device.address] = device;
                if (foundFn) foundFn(device);
            }.bind(this), raiseError("scan error"));
        },
        stopScan: function() {
            adapter.stopScan(raiseError("stop scan error"));
        }
    };
}));