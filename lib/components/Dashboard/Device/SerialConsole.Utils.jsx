import React from 'react'
import _ from 'lodash'

export var parsers = {
   hex: function(input) {
      var processed = input
       .split(/\s+/)
       .map(function(v) {
         return v ? ("0" + v).slice(-1 * v.length - (v.length % 2)) : '';
       })
       .join('')

      try {
         if (isNaN(parseInt(processed, 16)) || processed.match("x"))
           return {error: "invalid hex input"}

         return new Buffer(processed, "hex")
      } catch (e) {
         return {error: "invalid hex input"}
      }
   },

   bytes: function(input) {
      var err = undefined

      var processed = input
        .split(/\s+/)
        .reduce(function(acc, n) {
          if ('' === n)
            return acc

          var num = parseInt(n)

          if (isNaN(num && !err)) {
            err = {error: 'invalid number `' + n + '` in byte array', pos: -1}
          } else if (num > 255 || num < 0 && !err) {
            err = {error: 'invalid byte `' + n + ', out of range 0..255', pos: -1}
          } else {
            acc.push(num)
          }

          return acc
        }, [])

      return err || new Buffer(processed)
   },

   ascii: function(input) {
      input = input
        .replace(/\\0/g, "\0")
        .replace(/\\\\/g, "\\")
        .replace(/\\a/g, "\a")
        .replace(/\\t/g, "\t")
        .replace(/\\n/g, "\n")
        .replace(/\\v/g, "\v")
        .replace(/\\f/g, "\f")
        .replace(/\\r/g, "\r")

      return new Buffer(input)
   }
}

const parseAs = {
    '<':  parsers.hex,
    '[':  parsers.bytes,
     '"': parsers.ascii,
    '\'': parsers.ascii
   },
   pairs = {
    '<': '>',
    '[': ']',
    '"': '"',
    '\'': '\''
   }

// parse data as an output string
export var parse = function(input, pos, acc) {
   let head, rest, p, parts, res

   pos = pos || 0

   acc = acc || new Buffer("")

   if (!input)
     return acc

   let input2 = _.trimLeft(input)
   pos += input.length - input2.length // preserve spaces for pos

   head = input2[0]
   rest = input2.slice(1)

   parts = rest.split(pairs[head])
   pos += parts[0].length + 1

   if (undefined === parts[1] && pairs[head])
     return {error: "expected a terminating `" + pairs[head] + "`", pos: pos + 1}
   if (undefined === parts[1] && !pairs[head])
     return {error: "expected your data to start with either: your data with one of \" .. \", [ ... ] or < ... >.", pos: pos + 1}

   res = parseAs[head](parts[0])
   parts.shift()

   rest = parts.join(pairs[head])
   return res.error
      ? res
      : parse(rest, pos + 1, Buffer.concat([acc, res]))
}

// make it readable
export var prettify = {
   'hex':     buf => ( _.map(buf, chr => chr.toString(16)) ).join(' '),
   'bytes':   buf => buf.join(' '),
   'ascii':   buf => buf.toString()
                      //  .replace(/\n/, '\\n')
                      //  .replace(/\r/, '\\r')
}

const formats = ['hex', 'bytes', 'ascii']

export var formatters = {
   serial:  function(line, fmt) {
      if (!line)
         return

      if (-1 === formats.lastIndexOf(fmt))
         return {error: "invalid output format `" + fmt + "`."}


      let encode = buf => Buffer.isBuffer(buf) ? prettify[fmt](buf) : buf


      if (line.error) {
         let buf = "! Error: " + line.error
         if (line.pos)
            buf += " (char: " + line.pos + ")"

         return <span className="error"><br />{buf}</span>
      } else if (line['proto/tm']) {
         if (line['proto/tm'].detail === 'serial') {
            let block = line['proto/tm'].block

            return <span className="upstream block-{block}"><br />&lt;{encode(line['proto/tm'].data)}</span>
         } else if (line['proto/tm'].command === 'serial') {
            return <span className="downstream"><br />&gt; {encode(line['proto/tm'].data)}</span>
         } else {
            return
         }
      }

      if (Buffer.isBuffer(line))
         return <span className="meta">{line.toString()}</span>
      else if (_.isString(line))
         return <span className="meta">{line}</span>
      else
         return line
   }
}
