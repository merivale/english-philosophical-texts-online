// write text to stdout
export default function write (text, offset = 0) {
  process.stdout.write(createOffset(offset) + text)
}

// create padding offset for stdout display
function createOffset (int) {
  let padding = ''
  for (let i = 0; i < int; i += 1) padding += '  '
  return padding
}
