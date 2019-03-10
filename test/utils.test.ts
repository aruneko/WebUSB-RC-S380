import '../src/utils'

describe('Test equals function', () => {
    it('test equality', () => {
        const data1 = Uint8Array.of(0x01, 0x02, 0x03)
        const data2 = Uint8Array.of(0x01, 0x02, 0x03)
        expect(data1.equals(data2)).toBe(true)
    })
    it('test difference length', () => {
        const data1 = Uint8Array.of(0x01, 0x02, 0x03)
        const data2 = Uint8Array.of(0x01, 0x02, 0x03, 0x04)
        expect(data1.equals(data2)).toBe(false)
    })
    it('test difference packet', () => {
        const data1 = Uint8Array.of(0x01, 0x02, 0x03)
        const data2 = Uint8Array.of(0x01, 0x02, 0x04)
        expect(data1.equals(data2)).toBe(false)
    })
})