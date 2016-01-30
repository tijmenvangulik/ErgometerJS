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
/* @license
 *
 * BLE Abstraction Tool: evothings adapter
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
        define(['bleat.core'], factory.bind(this, root, root.cordova));
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory(root, root.cordova, require('./bleat.core'));
    } else {
        // Browser globals with support for web workers (root is window)
        factory(root, root.cordova, root.bleat);
    }
}(this, function(root, cordova, bleat) {
    "use strict";

    var CCCD_UUID = "00002902-0000-1000-8000-00805f9b34fb";

    // Advert parsing from https://github.com/evothings/evothings-examples/blob/master/resources/libs/evothings/easyble/easyble.js
    // Should be encapsulated in the native Android implementation (see issue #62)
    function b64ToUint6(nChr) {
        return nChr > 64 && nChr < 91 ? nChr - 65
            : nChr > 96 && nChr < 123 ? nChr - 71
            : nChr > 47 && nChr < 58 ? nChr + 4
            : nChr === 43 ? 62
            : nChr === 47 ? 63
            : 0;
    }

    function base64DecToArr(sBase64, nBlocksSize) {
        var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, "");
        var nInLen = sB64Enc.length;
        var nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2;
        var taBytes = new Uint8Array(nOutLen);

        for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
            nMod4 = nInIdx & 3;
            nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
            if (nMod4 === 3 || nInLen - nInIdx === 1) {
                for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                    taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                }
                nUint24 = 0;
            }
        }
        return taBytes;
    }

    function littleEndianToUint16(data, offset) {
        return (data[offset + 1] << 8) + data[offset];
    }

    function littleEndianToUint32(data, offset) {
        return (data[offset + 3] << 24) + (data[offset + 2] << 16) + (data[offset + 1] << 8) + data[offset];
    }

    function arrayToUUID(array, offset) {
        var uuid = "";
        for (var i = 0; i < 16; i++) {
            uuid += ("00" + array[offset + i].toString(16)).slice(-2);
        }
        return uuid;
    }

    function parseAdvert(deviceInfo) {
        var advert = {
            name: deviceInfo.name,
            serviceUUIDs: []
        };

        if (deviceInfo.advertisementData) {
            if (deviceInfo.advertisementData.kCBAdvDataLocalName) advert.name = deviceInfo.advertisementData.kCBAdvDataLocalName;
            if (deviceInfo.advertisementData.kCBAdvDataServiceUUIDs) {
                deviceInfo.advertisementData.kCBAdvDataServiceUUIDs.forEach(function(serviceUUID) {
                    advert.serviceUUIDs.push(bleat._canonicalUUID(serviceUUID));
                });
            }
        } else if (deviceInfo.scanRecord) {

            var byteArray = base64DecToArr(deviceInfo.scanRecord);
            var pos = 0;
            while (pos < byteArray.length) {

                var length = byteArray[pos++];
                if (length === 0) break;
                length -= 1;
                var type = byteArray[pos++];
                var i;

                if (type == 0x02 || type == 0x03) { // 16-bit Service Class UUIDs
                    for (i = 0; i < length; i += 2) {
                        advert.serviceUUIDs.push(bleat._canonicalUUID(littleEndianToUint16(byteArray, pos + i).toString(16)));
                    }
                } else if (type == 0x04 || type == 0x05) { // 32-bit Service Class UUIDs
                    for (i = 0; i < length; i += 4) {
                        advert.serviceUUIDs.push(bleat._canonicalUUID(littleEndianToUint32(byteArray, pos + i).toString(16)));
                    }
                } else if (type == 0x06 || type == 0x07) { // 128-bit Service Class UUIDs
                    for (i = 0; i < length; i += 16) {
                        advert.serviceUUIDs.push(bleat._canonicalUUID(arrayToUUID(byteArray, pos + i)));
                    }
                } else if (type == 0x08 || type == 0x09) { // Local Name
                    advert.name = evothings.ble.fromUtf8(new Uint8Array(byteArray.buffer, pos, length)).replace('\0', '');
                }
                pos += length;
            }
        }
        return advert;
    }

    // https://github.com/evothings/cordova-ble/blob/master/ble.js
    if (cordova) {

        var platform = cordova.platformId;

        bleat._addAdapter("evothings", {
            deviceHandles: {},
            serviceHandles: {},
            characteristicHandles: {},
            descriptorHandles: {},
            notifyCallbacks: {},
            init: function(readyFn, errorFn) {
                if (root.evothings && evothings.ble) readyFn();
                else document.addEventListener("deviceready", readyFn);
            },
            startScan: function(serviceUUIDs, foundFn, errorFn) {
                evothings.ble.startScan(function(deviceInfo) {
                    var advert = parseAdvert(deviceInfo);
                    var hasService = (serviceUUIDs.length === 0) || serviceUUIDs.some(function(serviceUUID) {
                        return (advert.serviceUUIDs.indexOf(serviceUUID) >= 0);
                    });
                    if (hasService) {
                        var device = new bleat._Device(deviceInfo.address, advert.name, advert.serviceUUIDs);
                        device.rssi= deviceInfo.rssi;
                        foundFn(device);
                    }
                }, errorFn);
            },
            stopScan: function(errorFn) {
                evothings.ble.stopScan();
            },
            connect: function(device, connectFn, disconnectFn, errorFn) {
                evothings.ble.connect(device.address, function(connectInfo) {
                    if (connectInfo.state === 0) { // Disconnected
                        if (this.deviceHandles[device.address]) {
                            evothings.ble.close(this.deviceHandles[device.address]);
                            delete this.deviceHandles[device.address];
                        }
                        disconnectFn();
                    } else if (connectInfo.state === 2) { // Connected
                        this.deviceHandles[device.address] = connectInfo.deviceHandle;
                        connectFn();
                    }
                }.bind(this), errorFn);
            },
            disconnect: function(device, errorFn) {
                if (this.deviceHandles[device.address]) evothings.ble.close(this.deviceHandles[device.address]);
            },
            discoverServices: function(device, serviceUUIDs, completeFn, errorFn) {
                var deviceHandle = this.deviceHandles[device.address];
                evothings.ble.services(deviceHandle, function(services) {
                    services.forEach(function(serviceInfo) {

                        if (serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceInfo.uuid) >= 0) {
                            this.serviceHandles[serviceInfo.handle] = deviceHandle;
                            var service = new bleat._Service(serviceInfo.handle, serviceInfo.uuid, (serviceInfo.type === 0));
                            device.services[service.uuid] = service;
                        }

                    }, this);
                    completeFn();
                }.bind(this), errorFn);
            },
            discoverIncludedServices: function(device, serviceUUIDs, completeFn, errorFn) {
                // Not Implemented in evothings
                completeFn();
            },
            discoverCharacteristics: function(service, characteristicUUIDs, completeFn, errorFn) {
                var deviceHandle = this.serviceHandles[service._handle];
                evothings.ble.characteristics(deviceHandle, service._handle, function(characteristics) {
                    characteristics.forEach(function(characteristicInfo) {

                        if (characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(characteristicInfo.uuid) >= 0) {
                            this.characteristicHandles[characteristicInfo.handle] = deviceHandle;
                            var properties = [];// [characteristicInfo.permission + characteristicInfo.property + characteristicInfo.writeType]
                            var characteristic = new bleat._Characteristic(characteristicInfo.handle, characteristicInfo.uuid, properties);
                            service.characteristics[characteristic.uuid] = characteristic;
                        }

                    }, this);
                    completeFn();
                }.bind(this), errorFn);
            },
            discoverDescriptors: function(characteristic, descriptorUUIDs, completeFn, errorFn) {
                var deviceHandle = this.characteristicHandles[characteristic._handle];
                evothings.ble.descriptors(deviceHandle, characteristic._handle, function(descriptors) {
                    descriptors.forEach(function(descriptorInfo) {

                        if (descriptorUUIDs.length === 0 || descriptorUUIDs.indexOf(descriptorInfo.uuid) >= 0) {
                            this.descriptorHandles[descriptorInfo.handle] = deviceHandle;
                            var descriptor = new bleat._Descriptor(descriptorInfo.handle, descriptorInfo.uuid);
                            characteristic.descriptors[descriptor.uuid] = descriptor;
                        }

                    }, this);
                    completeFn();
                }.bind(this), errorFn);
            },
            readCharacteristic: function(characteristic, completeFn, errorFn) {
                evothings.ble.readCharacteristic(this.characteristicHandles[characteristic._handle], characteristic._handle, function(data) {
                    // Re-enable notification on iOS if there was one, see issue #61
                    if (platform === "ios" && this.notifyCallbacks[characteristic.uuid]) this.enableNotify(characteristic, this.notifyCallbacks[characteristic.uuid], null, errorFn);
                    completeFn(data);
                }.bind(this), errorFn);
            },
            writeCharacteristic: function(characteristic, bufferView, completeFn, errorFn) {
                evothings.ble.writeCharacteristic(this.characteristicHandles[characteristic._handle], characteristic._handle, bufferView, completeFn, errorFn);
            },
            enableNotify: function(characteristic, notifyFn, completeFn, errorFn) {
                var callbackFn = function() {
                    evothings.ble.enableNotification(this.characteristicHandles[characteristic._handle], characteristic._handle, notifyFn, errorFn);
                    if (platform === "ios") this.notifyCallbacks[characteristic.uuid] = notifyFn;
                    if (completeFn) completeFn();
                };
                if (platform === "android") {
                    // Android needs the CCCD descriptor written to for notifications
                    // Should be encapsulated in native android layer (see issue #30)
                    var descriptor = characteristic.descriptors[CCCD_UUID];
                    if (!descriptor) {
                        errorFn("cannot find notify descriptor");
                        return;
                    }
                    this.writeDescriptor(descriptor, new Uint8Array([1, 0]), callbackFn.bind(this), errorFn);
                } else callbackFn.call(this);
            },
            disableNotify: function(characteristic, completeFn, errorFn) {
                evothings.ble.disableNotification(this.characteristicHandles[characteristic._handle], characteristic._handle, completeFn, errorFn);
                if (platform === "ios") {
                    delete this.notifyCallbacks[characteristic.uuid];
                    // iOS doesn't call back after disable (see issue #65)
                    completeFn();
                }
            },
            readDescriptor: function(descriptor, completeFn, errorFn) {
                evothings.ble.readDescriptor(this.descriptorHandles[descriptor._handle], descriptor._handle, completeFn, errorFn);
            },
            writeDescriptor: function(descriptor, bufferView, completeFn, errorFn) {
                evothings.ble.writeDescriptor(this.descriptorHandles[descriptor._handle], descriptor._handle, bufferView, completeFn, errorFn);
            }
        });
    }
}));
/* @license
 *
 * BLE Abstraction Tool: noble adapter
 * Version: 0.0.4
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
        define(['noble', 'bleat.core'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS
        module.exports = factory(require('noble'), require('./bleat.core'));
    } else {
        // Browser globals with support for web workers (root is window)
        factory(root.noble, root.bleat);
    }
}(this, function(noble, bleat) {
    "use strict";

    function checkForError(errorFn, continueFn) {
        return function(error) {
            if (error) errorFn(error);
            else if (typeof continueFn === "function") {
                var args = [].slice.call(arguments, 1);
                continueFn.apply(this, args);
            }
        };
    }

    // https://github.com/sandeepmistry/noble
    if (noble) {
        bleat._addAdapter("noble", {
            foundFn: null,
            deviceHandles: {},
            serviceHandles: {},
            characteristicHandles: {},
            descriptorHandles: {},
            charNotifies: {},
            init: function(readyFn, errorFn) {
                function stateCB(state) {
                    if (state === "poweredOn") {
                        noble.on('discover', function(deviceInfo) {
                            if (this.foundFn) {
                                var address = (deviceInfo.address && deviceInfo.address !== "unknown") ? deviceInfo.address : deviceInfo.uuid;
                                this.deviceHandles[address] = deviceInfo;
                                var serviceUUIDs = [];
                                deviceInfo.advertisement.serviceUuids.forEach(function(serviceUUID) {
                                    serviceUUIDs.push(bleat._canonicalUUID(serviceUUID));
                                });
                                var device = new bleat._Device(address, deviceInfo.advertisement.localName || address, serviceUUIDs);
                                device.rssi= deviceInfo.rssi;
                                device.serviceData = deviceInfo.advertisement.serviceData;
                                this.foundFn(device);
                            }
                        }.bind(this));
                        readyFn();
                    }
                    else errorFn("adapter not enabled");
                }
                if (noble.state === "unknown") noble.once('stateChange', stateCB.bind(this));
                else stateCB(noble.state);
            },
            startScan: function(serviceUUIDs, foundFn, errorFn) {
                this.foundFn = foundFn;
                noble.startScanning(serviceUUIDs, false, checkForError(errorFn));
            },
            stopScan: function(errorFn) {
                noble.stopScanning();
            },
            connect: function(device, connectFn, disconnectFn, errorFn) {
                var baseDevice = this.deviceHandles[device.address];
                baseDevice.once("connect", connectFn);
                baseDevice.once("disconnect", disconnectFn);
                baseDevice.connect(checkForError(errorFn));
            },
            disconnect: function(device, errorFn) {
                this.deviceHandles[device.address].disconnect(checkForError(errorFn));
            },
            discoverServices: function(device, serviceUUIDs, completeFn, errorFn) {
                var baseDevice = this.deviceHandles[device.address];
                baseDevice.discoverServices(serviceUUIDs, checkForError(errorFn, function(services) {
                    services.forEach(function(serviceInfo) {

                        this.serviceHandles[serviceInfo.uuid] = serviceInfo;
                        var serviceUUID = bleat._canonicalUUID(serviceInfo.uuid);
                        var service = new bleat._Service(serviceInfo.uuid, serviceUUID, true);
                        device.services[service.uuid] = service;

                    }, this);
                    completeFn();
                }.bind(this)));
            },
            discoverIncludedServices: function(service, serviceUUIDs, completeFn, errorFn) {
                var serviceInfo = this.serviceHandles[service._handle];
                serviceInfo.discoverIncludedServices(serviceUUIDs, checkForError(errorFn, function(services) {
                    services.forEach(function(serviceInfo) {

                        this.serviceHandles[serviceInfo.uuid] = serviceInfo;
                        var serviceUUID = bleat._canonicalUUID(serviceInfo.uuid);
                        var service = new bleat._Service(serviceInfo.uuid, serviceUUID, false);
                        service.includedServices[service.uuid] = service;

                    }, this);
                    completeFn();
                }.bind(this)));
            },
            discoverCharacteristics: function(service, characteristicUUIDs, completeFn, errorFn) {
                var serviceInfo = this.serviceHandles[service._handle];
                serviceInfo.discoverCharacteristics(characteristicUUIDs, checkForError(errorFn, function(characteristics) {
                    characteristics.forEach(function(characteristicInfo) {

                        this.characteristicHandles[characteristicInfo.uuid] = characteristicInfo;
                        var charUUID = bleat._canonicalUUID(characteristicInfo.uuid);
                        var characteristic = new bleat._Characteristic(characteristicInfo.uuid, charUUID, characteristicInfo.properties);
                        service.characteristics[characteristic.uuid] = characteristic;

                        characteristicInfo.on('read', function(data, isNotification) {
                            if (isNotification === true && typeof this.charNotifies[charUUID] === "function") {
                                var arrayBuffer = new Uint8Array(data).buffer;
                                this.charNotifies[charUUID](arrayBuffer);
                            }
                        }.bind(this));

                    }, this);
                    completeFn();
                }.bind(this)));
            },
            discoverDescriptors: function(characteristic, descriptorUUIDs, completeFn, errorFn) {
                var characteristicInfo = this.characteristicHandles[characteristic._handle];
                characteristicInfo.discoverDescriptors(checkForError(errorFn, function(descriptors) {
                    descriptors.forEach(function(descriptorInfo) {

                        if (descriptorUUIDs.length === 0 || descriptorUUIDs.indexOf(descriptorInfo.uuid) >= 0) {
                            var descHandle = characteristicInfo.uuid + "-" + descriptorInfo.uuid;
                            this.descriptorHandles[descHandle] = descriptorInfo;
                            var descUUID = bleat._canonicalUUID(descriptorInfo.uuid);
                            var descriptor = new bleat._Descriptor(descHandle, descUUID);
                            characteristic.descriptors[descUUID] = descriptor;
                        }

                    }, this);
                    completeFn();
                }.bind(this)));
            },
            readCharacteristic: function(characteristic, completeFn, errorFn) {
                this.characteristicHandles[characteristic._handle].read(checkForError(errorFn, function(data) {
                    var arrayBuffer = new Uint8Array(data).buffer;
                    completeFn(arrayBuffer);
                }));
            },
            writeCharacteristic: function(characteristic, bufferView, completeFn, errorFn) {
                var buffer = new Buffer(new Uint8Array(bufferView.buffer));
                this.characteristicHandles[characteristic._handle].write(buffer, true, checkForError(errorFn, completeFn));
            },
            enableNotify: function(characteristic, notifyFn, completeFn, errorFn) {
                this.characteristicHandles[characteristic._handle].once("notify", function(state) {
                    if (state !== true) return errorFn("notify failed to enable");
                    this.charNotifies[characteristic.uuid] = notifyFn;
                    completeFn();
                }.bind(this));
                this.characteristicHandles[characteristic._handle].notify(true, checkForError(errorFn));
            },
            disableNotify: function(characteristic, completeFn, errorFn) {
                this.characteristicHandles[characteristic._handle].once("notify", function(state) {
                    if (state !== false) return errorFn("notify failed to disable");
                    if (this.charNotifies[characteristic.uuid]) delete this.charNotifies[characteristic.uuid];
                    completeFn();
                }.bind(this));
                this.characteristicHandles[characteristic._handle].notify(false, checkForError(errorFn));
            },
            readDescriptor: function(descriptor, completeFn, errorFn) {
                this.descriptorHandles[descriptor._handle].readValue(checkForError(errorFn, function(data) {
                    var arrayBuffer = new Uint8Array(data).buffer;
                    completeFn(arrayBuffer);                    
                }));
            },
            writeDescriptor: function(descriptor, bufferView, completeFn, errorFn) {
                var buffer = new Buffer(new Uint8Array(bufferView.buffer));
                this.descriptorHandles[descriptor._handle].writeValue(buffer, checkForError(errorFn, completeFn));
            }
        });
    }
}));