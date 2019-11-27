// dependencies
import fs from 'fs'
import path from 'path'

// get list of directories from a subdirectory
export function read (subdirectory) {
  return fs.readdirSync(`${getDataDir()}/${subdirectory}`, { withFileTypes: true })
    .filter(x => x.isDirectory())
    .map(x => x.name)
}

// get json/text data from disk
export function open (subdirectory, id, ext = 'json') {
  return getFileContent(subdirectory, id, ext) || getFileContent(subdirectory, `${id}.index`, ext)
}

// save json data to disk
export function save (subdirectory, id, data, ext = 'json') {
  const filePath = getFilePath(subdirectory, id, ext)
  const dirName = path.dirname(filePath)
  fs.mkdirSync(dirName, { recursive: true })
  if (ext === 'json') data = `${JSON.stringify(data, null, 2)}\n`
  fs.writeFileSync(filePath, data)
}

// get the data directory (by recursively searching up from the current path)
function getDataDir (directory = 'data') {
  return fs.existsSync(directory) ? directory : getDataDir(`../${directory}`)
}

// get file content
function getFileContent (subdirectory, id, ext) {
  const filePath = getFilePath(subdirectory, id, ext)
  if (fs.existsSync(filePath)) {
    return (ext === 'json') ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : fs.readFileSync(filePath, 'utf8')
  }
  return null
}

// path to a file
function getFilePath (subdirectory, id, ext) {
  return subdirectory
    ? `${getDataDir()}/${subdirectory}/${id.toLowerCase().replace(/\./g, '/')}.${ext}`
    : `${getDataDir()}/${id.toLowerCase().replace(/\./g, '/')}.${ext}`
}
