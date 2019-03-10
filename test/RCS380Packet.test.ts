import { SendPacket, SuccessPacket, FailurePacket, AckPacket } from '../src/RCS380Packet'

describe('Test Parse Sending Packet', () => {
  const data = Uint8Array.of(0xd6, 0x2a, 0x01)
  const packet = new SendPacket(data)
  it('check payload', () => {
    const expectPacket = Uint8Array.of(
      0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x2a, 0x01, 0xff, 0x00
    )
    expect(packet.payload).toEqual(expectPacket)
  })
  it('check header', () => {
    const packetHeader = Uint8Array.of(0x00, 0x00, 0xff, 0xff, 0xff)
    expect(packet.header).toEqual(packetHeader)
  })
  it('check dataLength', () => {
    const dataLength = Uint8Array.of(0x03, 0x00)
    expect(packet.dataLengthAsBytes).toEqual(dataLength)
  })
  it('check dataLengthCheckSum', () => {
    const dataLengthCheckSum = 0xfd
    expect(packet.dataLengthCheckSum).toBe(dataLengthCheckSum)
  })
  it('check data', () => {
    expect(packet.data).toEqual(data)
  })
  it('check dataCheckSum', () => {
    const dataCheckSum = 0xff
    expect(packet.dataCheckSum).toBe(dataCheckSum)
  })
  it('check footer', () => {
    const footer = 0x00
    expect(packet.footer).toBe(footer)
  })
})

describe('Test receive success packet', () => {
  const data = Uint8Array.of(
    0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd7, 0x01, 0x00, 0x28, 0x00
  )
  const packet = new SuccessPacket(data)
  it('check header', () => {
    const packetHeader = Uint8Array.of(0x00, 0x00, 0xff, 0xff, 0xff)
    expect(packet.header).toEqual(packetHeader)
  })
  it('check dataLength', () => {
    const dataLength = Uint8Array.of(0x03, 0x00)
    expect(packet.dataLengthAsBytes).toEqual(dataLength)
  })
  it('check dataLengthCheckSum', () => {
    const checkSum = 0xfd
    expect(packet.dataLengthCheckSum).toBe(checkSum)
  })
  it('check data', () => {
    const data = Uint8Array.of(0xd7, 0x01, 0x00)
    expect(packet.data).toEqual(data)
  })
  it('check dataCheckSum', () => {
    const dataCheckSum = 0x28
    expect(packet.dataCheckSum).toBe(dataCheckSum)
  })
  it('check footer', () => {
    const footer = 0x00
    expect(packet.footer).toBe(footer)
  })
})

describe('Test receive failure packet', () => {
  const data = Uint8Array.of(0x00, 0x00, 0xff, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00)
  const packet = new FailurePacket(data)
  it('check header', () => {
    const packetHeader = Uint8Array.of(0x00, 0x00, 0xff, 0x00, 0xff)
    expect(packet.header).toEqual(packetHeader)
  })
  it('check dataLength', () => {
    const dataLength = Uint8Array.of(0x00, 0x00)
    expect(packet.dataLengthAsBytes).toEqual(dataLength)
  })
  it('check dataLengthCheckSum', () => {
    const checkSum = 0x00
    expect(packet.dataLengthCheckSum).toBe(checkSum)
  })
  it('check dataCheckSum', () => {
    const dataCheckSum = 0x00
    expect(packet.dataCheckSum).toBe(dataCheckSum)
  })
  it('check footer', () => {
    const footer = 0x00
    expect(packet.footer).toBe(footer)
  })
})

describe('Test ack packet', () => {
  const data = Uint8Array.of(0x00, 0x00, 0xff, 0x00, 0xff, 0x00)
  const packet = new AckPacket()
  it('check ack packet', () => {
    expect(packet.payload).toEqual(data)
  })
})