// dependencies
const fs = require('fs')
const tcp = require('./converters/tcp')
const hto = require('./converters/hto')
const oll = require('./converters/oll')
const converters = { tcp, hto, oll }

// command line arguments
const path = process.argv[2]
const converter = converters[process.argv[3]]
const override = process.argv[4]

// sanity check
if (!fs.existsSync(`./data/texts/${path}`)) throw new Error(`Bad path ${path}`)
if (!converter) throw new Error(`No converter ${converter}`)

// get all filenames in path
const paths = []
const getPaths = (path) => {
  if (fs.statSync(`./data/texts/${path}`).isDirectory()) {
    fs.readdirSync(`./data/texts/${path}`).forEach((p) => { getPaths(`${path}/${p}`) })
  } else {
    paths.push(path)
  }
}
getPaths(path)

// get the texts
const texts = paths.map(path => JSON.parse(fs.readFileSync(`./data/texts/${path}`)))

// get texts that are sections not yet imported (with source data)
const sections = override
  ? texts.filter(x => !x.texts && x.source)
  : texts.filter(x => !x.texts && !x.imported && x.source)

if (sections.length > 0) {
  // apply the converter to import those sections
  sections.forEach(converter)
} else {
  console.log('Nothing to import.')
}
