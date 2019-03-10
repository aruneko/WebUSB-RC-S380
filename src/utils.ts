export {}

declare global {
  interface Uint8Array {
    sum(): number
    checkSum(): Uint8Array
    equals(other: Uint8Array): boolean
  }
  interface Number {
    asLittleEndian(): Uint8Array
  }
}

Uint8Array.prototype.sum = function() {
  return this.reduce((x, y) => x + y)
}

Uint8Array.prototype.checkSum = function() {
  return Uint8Array.of((256 - this.sum()) % 256)
}

Uint8Array.prototype.equals = function(other: Uint8Array) {
  if (this.byteLength !== other.byteLength) {
    return false
  }

  for(let i = 0; i < this.byteLength; ++i) {
    if(this[i] !== other[i]) {
      return false
    }
  }
  return true
}

Number.prototype.asLittleEndian = function() {
  const buffer = new ArrayBuffer(2)
  new DataView(buffer).setUint16(0, (this as number), true)
  return new Uint8Array(buffer)
}
