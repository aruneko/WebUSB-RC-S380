import './utils'

abstract class Packet {
  protected constructor(readonly payload: Uint8Array) {}

  get header(): Uint8Array {
    return this.payload.slice(0, 5)
  }

  get footer(): number {
    return this.payload.slice(-1)[0]
  }
}

abstract class RCS380Packet extends Packet {
  protected constructor(readonly payload: Uint8Array) {
    super(payload)
  }

  get dataLengthAsBytes(): Uint8Array {
    return this.payload.slice(5, 7)
  }

  get dataLength(): number {
    // Bufferを作っておく
    const buffer = new ArrayBuffer(2)
    // 8bytesごとに書き込む
    const octedView = new Uint8Array(buffer)
    octedView[0] = this.payload[5]
    octedView[1] = this.payload[6]
    // それを16bytesとして読む
    const view = new Uint16Array(buffer)
    return view[0]
  }

  get dataLengthCheckSum(): number {
    return this.payload[7]
  }

  get data(): Uint8Array {
    return this.payload.slice(8, 8 + this.dataLength)
  }

  get dataCheckSum(): number {
    return this.payload[8 + this.dataLength]
  }
}

export class AckPacket extends Packet {
  constructor() {
    const ackPacket = Uint8Array.of(0x00, 0x00, 0xff, 0x00, 0xff, 0x00)
    super(ackPacket)
  }
}

export class SendPacket extends RCS380Packet {
  constructor(data: Uint8Array) {
    const header = Uint8Array.of(0x00, 0x00, 0xff, 0xff, 0xff)
    const dataLength = data.byteLength.asLittleEndian()
    const dataLengthCheckSum = dataLength.checkSum()
    const dataCheckSum = data.checkSum()
    const footer = Uint8Array.of(0)

    const payload = Uint8Array.of(
      ...header, ...dataLength, ...dataLengthCheckSum, ...data, ...dataCheckSum, ...footer
    )

    super(payload)
  }
}

export abstract class ReceivedPacket extends RCS380Packet {
  protected constructor(payload: Uint8Array) {
    super(payload)
  }
}

export class SuccessPacket extends ReceivedPacket {
  constructor(payload: Uint8Array) {
    super(payload)
  }
}

export class FailurePacket extends ReceivedPacket {
  constructor(payload: Uint8Array) {
    super(payload)
  }
}
