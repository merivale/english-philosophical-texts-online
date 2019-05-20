// dependencies
const fs = require('fs')

// texts directory
const dir = (path = 'data') =>
  fs.existsSync(path) ? path : dir(`../${path}`)

// path to json file
const path = (id) =>
  `${dir()}/${id.toLowerCase().replace(/\./g, '/')}.json`

// get json data
const open = (id) =>
  fs.existsSync(path(id)) ? JSON.parse(fs.readFileSync(path(id))) : open(`${id}.index`)

// save json data
const save = (data) => {
  fs.writeFileSync(path(data.id), `${JSON.stringify(data, null, 2)}\n`)
}

// exports
module.exports = {
  dir,
  open,
  save
}
