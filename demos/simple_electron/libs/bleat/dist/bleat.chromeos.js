/* @license
 *
 * BLE Abstraction Tool: chromeos adapter
 * Version: 0.0.8
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
        define(['bleat.core'], factory.bind(this, root.chrome));
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory(root.chrome, require('./bleat.core'));
    } else {
        // Browser globals with support for web workers (root is window)
        factory(root.chrome, root.bleat);
    }
}(this, function(chrome, bleat) {
    "use strict";

    function checkForError(errorFn, continueFn) {
        return function() {
            if (chrome.runtime.lastError) {
                errorFn(chrome.runtime.lastError.message);
                return;
            }
            if (typeof continueFn === "function") {
                var args = [].slice.call(arguments);
                continueFn.apply(this, args);
            }
        };
    }

    // https://developer.chrome.com/apps/bluetoothLowEnergy
    if (chrome && chrome.bluetooth && chrome.bluetoothLowEnergy) {

        bleat._addAdapter("chromeos", {
            charNotifies: {},
            deviceDisconnects: {},
            deviceFoundFn: function() {},
            init: function(readyFn, errorFn) {
                chrome.bluetooth.getAdapterState(checkForError(errorFn, function(adapterInfo) {
                    if (adapterInfo.available) {
                        chrome.bluetooth.onDeviceAdded.addListener(this.deviceFoundFn);
                        chrome.bluetoothLowEnergy.onCharacteristicValueChanged.addListener(function(characteristicInfo) {
                            if (typeof this.charNotifies[characteristicInfo.instanceId] === "function") {
                                this.charNotifies[characteristicInfo.instanceId](characteristicInfo.value);
                                delete this.charNotifies[characteristicInfo.instanceId];
                            }
                        }.bind(this));
                        chrome.bluetooth.onDeviceRemoved.addListener(this.checkDisconnect.bind(this));
                        chrome.bluetooth.onDeviceChanged.addListener(function(deviceInfo) {
                            if (deviceInfo.connected === false) this.checkDisconnect(deviceInfo);
                        }.bind(this));
                        readyFn();
                    }
                    else errorFn("adapter not enabled");
                }.bind(this)));
            },
            checkDisconnect: function(deviceInfo) {
                if (typeof this.deviceDisconnects[deviceInfo.address] === "function") {
                    this.deviceDisconnects[deviceInfo.address]();
                    delete this.deviceDisconnects[deviceInfo.address];
                }
            },
            startScan: function(serviceUUIDs, foundFn, errorFn) {
                this.deviceFoundFn = function(deviceInfo) {
                    var hasService = (serviceUUIDs.length === 0) || serviceUUIDs.some(function(serviceUUID) {
                        return (deviceInfo.uuids.indexOf(serviceUUID) >= 0);
                    });
                    if (hasService) {
                        var device = new bleat._Device(deviceInfo.address, deviceInfo.name, deviceInfo.uuids || []);
                        foundFn(device);
                    }
                };
                chrome.bluetooth.getDevices(checkForError(errorFn, function(devices) {
                    devices.forEach(this.deviceFoundFn);
                }));
                chrome.bluetooth.stopDiscovery(function() {
                    var e = chrome.runtime.lastError;
                    chrome.bluetooth.startDiscovery(checkForError(errorFn));
                });
            },
            stopScan: function(errorFn) {
                this.deviceFoundFn = function() {};
                chrome.bluetooth.stopDiscovery(function() {
                    var e = chrome.runtime.lastError;
                });
            },
            connect: function(device, connectFn, disconnectFn, errorFn) {
                chrome.bluetoothLowEnergy.connect(device.address, checkForError(errorFn, function() {
                    this.deviceDisconnects[device.address] = disconnectFn;
                    connectFn();
                }.bind(this)));
            },
            disconnect: function(device, errorFn) {
                chrome.bluetoothLowEnergy.disconnect(device.address, checkForError(errorFn));
            },
            discoverServices: function(device, serviceUUIDs, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.getServices(device.address, checkForError(errorFn, function(services) {
                    services.forEach(function(serviceInfo) {

                        if (serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceInfo.uuid) >= 0) {
                            var service = new bleat._Service(serviceInfo.instanceId, serviceInfo.uuid, serviceInfo.isPrimary);
                            device.services[service.uuid] = service;
                        }

                    });
                    completeFn();
                }));
            },
            discoverIncludedServices: function(service, serviceUUIDs, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.getIncludedServices(service._handle, checkForError(errorFn, function(services) {
                    services.forEach(function(serviceInfo) {

                        if (serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceInfo.uuid) >= 0) {
                            var service = new bleat._Service(serviceInfo.instanceId, serviceInfo.uuid, serviceInfo.isPrimary);
                            service.includedServices[service.uuid] = service;
                        }

                    });
                    completeFn();
                }));
            },
            discoverCharacteristics: function(service, characteristicUUIDs, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.getCharacteristics(service._handle, checkForError(errorFn, function(characteristics) {
                    characteristics.forEach(function(characteristicInfo) {

                        if (characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(characteristicInfo.uuid) >= 0) {
                            var characteristic = new bleat._Characteristic(characteristicInfo.instanceId, characteristicInfo.uuid, characteristicInfo.properties);
                            service.characteristics[characteristic.uuid] = characteristic;
                        }

                    });
                    completeFn();
                }));
            },
            discoverDescriptors: function(characteristic, descriptorUUIDs, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.getDescriptors(characteristic._handle, checkForError(errorFn, function(descriptors) {
                    descriptors.forEach(function(descriptorInfo) {

                        if (descriptorUUIDs.length === 0 || descriptorUUIDs.indexOf(descriptorInfo.uuid) >= 0) {
                            var descriptor = new bleat._Descriptor(descriptorInfo.instanceId, descriptorInfo.uuid);
                            characteristic.descriptors[descriptor.uuid] = descriptor;
                        }

                    });
                    completeFn();
                }));
            },
            readCharacteristic: function(characteristic, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.readCharacteristicValue(characteristic.handle, checkForError(errorFn, function(characteristicInfo) {
                    completeFn(characteristicInfo.value);
                }));
            },
            writeCharacteristic: function(characteristic, bufferView, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.writeCharacteristicValue(characteristic.handle, bufferView.buffer, checkForError(errorFn, completeFn));
            },
            enableNotify: function(characteristic, notifyFn, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.startCharacteristicNotifications(characteristic.handle, null, checkForError(errorFn, function() {
                    this.charNotifies[characteristic.handle] = notifyFn;
                    completeFn();
                }.bind(this)));
            },
            disableNotify: function(characteristic, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.stopCharacteristicNotifications(characteristic.handle, checkForError(errorFn, function() {
                    if (this.charNotifies[characteristic.handle]) delete this.charNotifies[characteristic.handle];
                    completeFn();
                }.bind(this)));
            },
            readDescriptor: function(descriptor, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.readDescriptorValue(descriptor.handle, checkForError(errorFn, function(descriptorInfo) {
                    completeFn(descriptorInfo.value);
                }));
            },
            writeDescriptor: function(descriptor, bufferView, completeFn, errorFn) {
                chrome.bluetoothLowEnergy.writeDescriptorValue(descriptor.handle, bufferView.buffer, checkForError(errorFn, completeFn));
            }
        });
    }
}));