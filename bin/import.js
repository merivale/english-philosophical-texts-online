/*
 * Command-line module for importing texts.
 */
import fs from 'fs'
import hto from './import/hto.js'
import oll from './import/oll.js'
import tcp from './import/tcp.js'

// create an object containing all the converters
const converters = { hto, oll, tcp }

// command line arguments
const path = process.argv[2]
const converter = converters[process.argv[3]]
const override = process.argv[4]

// sanity check 1
if (!fs.existsSync(`./data/texts/${path}`) && !fs.existsSync(`./data/texts/${path}.json`)) {
  throw new Error(`Bad path ${path}`)
}

// sanity check 2
if (!converter) {
  throw new Error(`No converter ${converter}`)
}

// get all filenames in path
const paths = []
const getPaths = (path) => {
  path = fs.existsSync(`./data/texts/${path}`) ? path : `${path}.json`
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
