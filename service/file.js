/*
 * Functions for reading and writing corpus data from/to disk.
 */
import fs from 'fs'
import path from 'path'

// get a list of directories from a subdirectory of the data directory
export function read (subdirectory) {
  return fs.readdirSync(`${getDirectoryPath('data')}/${subdirectory}`, { withFileTypes: true })
    .filter(x => x.isDirectory())
    .map(x => x.name)
}

// get json/text data from the data directory
export function open (subdirectory, id, ext = 'json') {
  return getFileContent(subdirectory, id, ext) || getFileContent(subdirectory, `${id}.index`, ext)
}

// save json/text data to the data directory
export function save (subdirectory, id, data, ext = 'json') {
  const filePath = getFilePath(subdirectory, id, ext)
  const dirName = path.dirname(filePath)
  fs.mkdirSync(dirName, { recursive: true })
  if (ext === 'json') data = `${JSON.stringify(data, null, 2)}\n`
  fs.writeFileSync(filePath, data)
}

// get a directory path (by recursively searching up from the current path)
function getDirectoryPath (directory) {
  return fs.existsSync(directory) ? directory : getDirectoryPath(`../${directory}`)
}

// get the contents of a file
function getFileContent (subdirectory, id, ext) {
  const filePath = getFilePath(subdirectory, id, ext)
  if (fs.existsSync(filePath)) {
    return (ext === 'json') ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : fs.readFileSync(filePath, 'utf8')
  }
  return null
}

// get the path to a file
function getFilePath (subdirectory, id, ext) {
  return subdirectory
    ? `${getDirectoryPath('data')}/${subdirectory}/${id.toLowerCase().replace(/\./g, '/')}.${ext}`
    : `${getDirectoryPath('data')}/${id.toLowerCase().replace(/\./g, '/')}.${ext}`
}
