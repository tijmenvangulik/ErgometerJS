/**
 * Created by tijmen on 25-12-15.
 */
 /** @internal */
module utils {
    /**
     * Interpret byte buffer as unsigned little endian 32 bit integer.
     * Returns converted number.
     * @param {ArrayBuffer} data - Input buffer.
     * @param {number} offset - Start of data.
     * @return Converted number.
     * @public
     */
    export function getUint24(data: DataView, offset : number)
    {
        return (data.getUint8(offset + 2) << 16) +
            (data.getUint8(offset + 1) << 8) +
            (data.getUint8(offset))
    }
    export function bufferToString(buf : ArrayBuffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }
    export function valueToNullValue(value : number,nullValue : number) : number {
        if (value==nullValue) return null;
        else return value;
    }
}