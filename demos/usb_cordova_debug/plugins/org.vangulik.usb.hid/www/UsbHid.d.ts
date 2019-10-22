declare namespace cordova_usb_hid {
    type ErrorCallBack = (e: any) => void;
    type VoidCallBack = () => void;
    type ReadCallBack = (data: ArrayBuffer) => void;
    interface UsbHidDevice {
        name: string;
        vendorId: string;
        productId: string;
        serialNumber: string;
        productName: string;
    }
    type UsbHidDevices = UsbHidDevice[];
    interface PermissonOptions {
    }
    interface OpenOptions {
        packetSize?: number;
        timeout?: number;
        skippZeroResults?: boolean;
        skippFirstByteZero?: boolean;
    }
    interface WriteOptions {
        packetsize?: number;
        timeout?: number;
    }
    class UsbHidPlugin {
        enumerateDevices(): Promise<UsbHidDevices>;
        requestPermission(device: UsbHidDevice): Promise<void>;
        open(opts?: OpenOptions): Promise<void>;
        write(data: ArrayBuffer, opts?: WriteOptions): Promise<void>;
        close(): Promise<void>;
        registerReadCallback(readCallback: ReadCallBack): Promise<ArrayBuffer>;
    }
}
interface CordovaPlugins {
    UsbHid: cordova_usb_hid.UsbHidPlugin;
}
