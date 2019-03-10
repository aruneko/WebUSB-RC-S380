import { AckPacket, FailurePacket, ReceivedPacket, SendPacket, SuccessPacket } from './RCS380Packet'

export class RCS380 {
  private ackPacket = new AckPacket()
  private maxReceiveSize = 290
  readonly defaultProtocol = Uint8Array.of(
    0x00,
    0x18,
    0x01,
    0x01,
    0x02,
    0x01,
    0x03,
    0x00,
    0x04,
    0x00,
    0x05,
    0x00,
    0x06,
    0x00,
    0x07,
    0x08,
    0x08,
    0x00,
    0x09,
    0x00,
    0x0a,
    0x00,
    0x0b,
    0x00,
    0x0c,
    0x00,
    0x0e,
    0x04,
    0x0f,
    0x00,
    0x10,
    0x00,
    0x11,
    0x00,
    0x12,
    0x00,
    0x13,
    0x06
  )
  private frameWaitingTime = 2.474516
  private deltaFrameWaitingTime = 49152 / 13.56e6
  // デフォルトのタイムアウト時間
  public timeout = this.frameWaitingTime + this.deltaFrameWaitingTime

  private constructor(
    readonly device: USBDevice
  ) {}

  public static async connect(): Promise<RCS380> {
    // ベンダーIDでRC-S380を特定
    const filter: USBDeviceFilter = {vendorId: 0x054c}
    const options: USBDeviceRequestOptions = {
      filters: [filter]
    }
    // デバイスを開いてインターフェースに接続
    const device = await navigator.usb.requestDevice(options)
    await device.open()
    await device.selectConfiguration(1)
    await device.claimInterface(0)
    // RCS380オブジェクトにして返す
    return new RCS380(device)
  }

  private async write(packet: AckPacket | SendPacket) {
    console.info('>>>>> send >>>>>')
    console.log(packet.payload)

    try {
      await this.device.transferOut(2, packet.payload)
    } catch (e) {
      console.error(e)
    }
  }

  private async read(): Promise<ReceivedPacket> {
    // 結果を取得
    const result = await this.device.transferIn(1, this.maxReceiveSize)
    // 入っているパケットをUint8Arrayに変換
    const rawPacket = (result.data !== undefined)
      ? new Uint8Array(result.data.buffer)
      : Uint8Array.of(0x00, 0x00, 0xff, 0x00, 0xff, 0x00, 0x00, 0x00, 0x00)

    console.info('<<<<< receive <<<<<')
    console.log(rawPacket)

    // 成否に応じて返す
    const errorPacketHeader = Uint8Array.of(0x00, 0x00, 0xff, 0x00, 0xff)
    if (rawPacket.slice(0, 5).equals(errorPacketHeader)) {
      return new FailurePacket(rawPacket)
    } else {
      return new SuccessPacket(rawPacket)
    }
  }

  private buildCommand(commandCode: number, rawCommand: Uint8Array): SendPacket {
    // コマンドヘッダ
    const header = 0xd6
    // コマンドの組み立て
    const command = Uint8Array.of(header, commandCode, ...rawCommand)
    return new SendPacket(command)
  }

  private parseTimeout(timeoutMs: number): Uint8Array {
    // タイムアウト指定パケット組み立て用バッファの確保(2bytes)
    const buffer = new ArrayBuffer(2)
    // 指定された計算式に従ってタイムアウト秒数を整数化
    const hexTimeout = (Math.floor(timeoutMs * 1000) + 1) * 10
    // リトルエンディアンでタイムアウト秒数を書き込む
    const view = new DataView(buffer)
    view.setUint16(0, hexTimeout, true)
    return new Uint8Array(buffer)
  }

  private async sendTypeBCommandAndReceiveResult(commandCode: number, rawCommand: Uint8Array): Promise<ReceivedPacket> {
    // コマンドの組み立てと送信
    const command = this.buildCommand(commandCode, rawCommand)
    await this.write(command)

    // ACKの受理
    await this.read()
    // 本体データの取り出し
    return this.read()
  }

  private async sendAck() {
    await this.write(this.ackPacket)
  }

  private async setCommandType() {
    const commandType = Uint8Array.of(0x01)
    await this.sendTypeBCommandAndReceiveResult(0x2a, commandType)
  }

  private async switchRf() {
    const rf = Uint8Array.of(0x00)
    await this.sendTypeBCommandAndReceiveResult(0x06, rf)
  }

  public async inSetRf(rf: Uint8Array) {
    await this.sendTypeBCommandAndReceiveResult(0x00, rf)
  }

  public async inSetProtocol(protocol: Uint8Array) {
    await this.sendTypeBCommandAndReceiveResult(0x02, protocol)
  }

  public async inCommRf(data: Uint8Array, timeoutMs: number): Promise<ReceivedPacket> {
    const timeout = this.parseTimeout(timeoutMs)
    const command = Uint8Array.of(...timeout, ...data)
    return this.sendTypeBCommandAndReceiveResult(0x04, command)
  }

  public async sendPreparationCommands(rf: Uint8Array, protocol: Uint8Array) {
    await this.inSetRf(rf)
    await this.inSetProtocol(this.defaultProtocol)
    await this.inSetProtocol(protocol)
  }

  public async initDevice() {
    console.info('Initialize RC-S380')
    await this.sendAck()
    await this.setCommandType()
    await this.switchRf()
    await this.switchRf()
  }

  public async disconnect() {
    console.info('Disconnect RC-S380')
    await this.switchRf()
    await this.sendAck()
  }
}
