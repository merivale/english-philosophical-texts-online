// dependencies
const fs = require('fs')
const hto = require('./import/hto')
const oll = require('./import/oll')
const tcp = require('./import/tcp')
const converters = { hto, oll, tcp }

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

// get texts to be imported
const textsToBeImported = override
  ? texts.filter(x => x.source)
  : texts.filter(x => x.source && !x.imported)

if (textsToBeImported.length > 0) {
  // apply the converter to import those sections
  textsToBeImported.forEach(converter)
} else {
  console.log('Nothing to import.')
}
