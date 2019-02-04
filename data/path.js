const fs = require('fs')

const dataDir = (path = 'data') =>
  fs.existsSync(path) ? path : dataDir(`../${path}`)

const filename = id =>
  `${id.toLowerCase().replace(/\.json$/, '').replace(/\./g, '/')}.json`

const path = (type, id = null) =>
  id ? `${dataDir()}/${type}/${filename(id)}` : `${dataDir()}/${type}`

module.exports = path
