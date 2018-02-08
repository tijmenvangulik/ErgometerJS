/**
 * Created by tijmen on 13-03-16.
 */

declare module webbluetooth {

    export type UUID= string                     
    export type DOMString= UUID
    export type BluetoothServiceUUID = DOMString | number
    export type BluetoothCharacteristicUUID = DOMString | number
    export type BluetoothDescriptorUUID = DOMString | number
    export type UnsignedLong = number
    export type UnsignedShort = number
    export type Byte = number
    export type BufferSource = ArrayBufferView | ArrayBuffer
    export type EventHandler = (ev: Event) => any
    export type CharacteristicsValueChangedEventHandler = (ev: CharacteristicsValueChangedEvent) => any

    export interface BluetoothScanFilter {
        services?: BluetoothServiceUUID[];
        name? : DOMString;
        namePrefix? : DOMString;
    }

    export interface RequestDeviceOptions {

        filters: BluetoothScanFilter[];
        optionalServices? : BluetoothServiceUUID[];
        //bleat addition
        deviceFound? : ( device : BluetoothDevice)=>void;
    }

    export interface Bluetooth extends EventTarget,BluetoothDeviceEventHandlers,CharacteristicEventHandlers,ServiceEventHandlers {
        requestDevice(options : RequestDeviceOptions) : Promise<BluetoothDevice>;
        //bleat extension
        cancelRequest() : Promise<void>;
    }


// Allocation authorities for Vendor IDs:
    export const enum VendorIDSource {
        "bluetooth",
        "usb"
    }

    export interface BluetoothDevice extends EventTarget,BluetoothDeviceEventHandlers,CharacteristicEventHandlers,ServiceEventHandlers {
        id : DOMString;
        name? : DOMString;
        adData : BluetoothAdvertisingData;
        deviceClass? : UnsignedLong;
        vendorIDSource? : VendorIDSource;
        vendorID? : UnsignedLong;
        productID? : UnsignedLong;
        productVersion? : UnsignedLong;
        gatt : BluetoothRemoteGATTServer;
        uuids : UUID[];
        //this seems to be a chrome specification not in the standard, it is only temorary
        //instead use gatt.connect()in the chrome canary
        connectGATT() : Promise<BluetoothRemoteGATTServer>;
    }

    export interface CharacteristicsValueChangedEvent extends Event {
        target  : BluetoothRemoteGATTCharacteristic
    }
    export interface BluetoothManufacturerDataMap {
        [id: number] : DataView
    }
    export interface BluetoothServiceDataMap {
        [uuid: string] : DataView;
    }

    export interface BluetoothAdvertisingData {
        appearance? : UnsignedShort;
        xPower? : Byte;
        rssi? : Byte;
        manufacturerData : BluetoothManufacturerDataMap;
        serviceData : BluetoothServiceDataMap;
    }

    export interface BluetoothRemoteGATTServer {
        device : BluetoothDevice;
        connected : boolean;
        connect() : Promise<BluetoothRemoteGATTServer>;
        disconnect() : void;
        getPrimaryService( service : BluetoothServiceUUID) : Promise<BluetoothRemoteGATTService>;

        getPrimaryServices( service? : BluetoothServiceUUID) : Promise<BluetoothRemoteGATTService[]>;
    }

    export interface BluetoothRemoteGATTService {
        device : BluetoothDevice;
        uuid : UUID;
        isPrimary : boolean;

        getCharacteristic( characteristic : BluetoothCharacteristicUUID) : Promise<BluetoothRemoteGATTCharacteristic>;

        getCharacteristics( characteristic? : BluetoothCharacteristicUUID) : Promise<BluetoothRemoteGATTCharacteristic[]>

        getIncludedService( service : BluetoothServiceUUID) : Promise<BluetoothRemoteGATTService>;

        getIncludedServices(  service? : BluetoothServiceUUID) : Promise<BluetoothRemoteGATTService[]>
    }

    export interface BluetoothRemoteGATTCharacteristic extends EventTarget,CharacteristicEventHandlers,ServiceEventHandlers {
        service : BluetoothRemoteGATTService;
        uuid : UUID;
        properties : BluetoothCharacteristicProperties;
        value? : DataView;
        getDescriptor( descriptor : BluetoothDescriptorUUID) : Promise<BluetoothRemoteGATTDescriptor>;
        getDescriptors(  descriptor? : BluetoothDescriptorUUID) : Promise<BluetoothRemoteGATTDescriptor[]>;
        readValue() : Promise<DataView>;
        writeValue( value : BufferSource) : Promise<void>;
        startNotifications() : Promise<void>;
        stopNotifications() : Promise<void>;
    }


    export interface BluetoothCharacteristicProperties extends EventTarget,CharacteristicEventHandlers{
        broadcast :boolean;
        read : boolean;
        writeWithoutResponse :boolean;
        write : boolean;
        notify :boolean;
        indicate :boolean;
        authenticatedSignedWrites : boolean;
        reliableWrite :boolean;
        writableAuxiliaries :boolean;
    }

    export interface BluetoothRemoteGATTDescriptor {
        characteristic : BluetoothRemoteGATTCharacteristic;
        uuid :UUID;
        value? : DataView;
        readValue() : Promise<DataView>;
        writeValue( value : BufferSource) : Promise<void>;
    }


    export interface CharacteristicEventHandlers {
        oncharacteristicvaluechanged : CharacteristicsValueChangedEventHandler;
    }


    export interface BluetoothDeviceEventHandlers {
        ongattserverdisconnected : EventHandler;
    }


    export interface ServiceEventHandlers {
        onserviceadded : (service : BluetoothRemoteGATTService)=>void;
        onservicechanged : (service : BluetoothRemoteGATTService)=>void;
        onserviceremoved : (service : BluetoothRemoteGATTService)=>void;
    }


}
declare module BluetoothUUID {
    export function getService( name : webbluetooth.DOMString | webbluetooth.UnsignedLong ) :webbluetooth.UUID;
    export function getCharacteristic(name :webbluetooth.DOMString | webbluetooth.UnsignedLong) : webbluetooth.UUID;
    export function getDescriptor(name : webbluetooth.DOMString | webbluetooth.UnsignedLong) : webbluetooth.UUID;
    export function canonicalUUID(  alias : webbluetooth.UnsignedLong) : webbluetooth.UUID;
}
interface Navigator {
    bluetooth : webbluetooth.Bluetooth;
}
