# RC-S380 Driver for WebUSB
## What is this?
Sony RC-S380 (NFC card reader) Driver for WebUSB written in TypeScript.

## How to install

```bash
$ npm i rc_s380_driver
# or
$ yarn add rc_s380_driver
```

## How to use

```TypeScript
import { RCS380, ReceivedPacket } from 'rc_s380_driver'

class Sample {
    constructor(readonly rcs380: RCS380) {}

    public static async connect(): Promise<TypeFTag> {
        const device = await RCS380.connect()
        return new Sample(device)
    }

    public async sendCommand(): Promise<ReceivedPacket> {
        const command = Uint8Array.of(0x00, 0xff, 0xff, 0x01, 0x00)
        return this.rcs380.inCommRf(command, 0.01)
    }
}
```

## npm package
[rc-s380-driver](https://www.npmjs.com/package/rc_s380_driver)

## License
MIT
