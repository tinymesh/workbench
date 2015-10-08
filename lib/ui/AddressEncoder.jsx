import React from 'react'

export class AddressEncoder extends React.Component {

  static encode(addr) {
    switch (AddressEncoder.format) {
      case "hex":
        return AddressEncoder.encodeHex(addr, AddressEncoder.endian)
        break

      case "bin":
        return AddressEncoder.encodeBin(addr, AddressEncoder.endian)
        break

      case "dec":
      default:
        return AddressEncoder.encodeDec(addr, AddressEncoder.endian)
        break
    }
  }

  static encodeHex(addr, endian) {
    let parts = [
      (addr >> 24) & 255,
      (addr >> 16) & 255,
      (addr >> 8)  & 255,
      (addr >> 0)  & 255
    ]

    return ('big' === endian ? parts : _.reverse(parts)).map(
      (n) => ("0" + n.toString(16)).slice(-2)
    ).join(':')
  }

  static encodeBin(addr, endian) {
    let parts = [
      (addr >> 24) & 255,
      (addr >> 16) & 255,
      (addr >> 8)  & 255,
      (addr >> 0)  & 255
    ]

    return ('big' === endian ? parts : _.reverse(parts)).join('.')
  }

  static encodeDec(addr, endian) {
    if ('little' === endian)
      return ((addr & 0xff) << 24)
           | ((addr & 0xff00) << 8)
           | ((addr >> 8) & 0xff00)
           | ((addr >> 24) & 0xff)

    return addr
  }

  render() {
    return (
      <span className="addr">{AddressEncoder.encode(this.props.value)}</span>
    )
  }
}

AddressEncoder.format = "hex"
AddressEncoder.endian = "big"
