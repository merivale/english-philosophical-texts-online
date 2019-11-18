// dependencies
import fs from 'fs'
import path from 'path'

// get the data directory (by recursively searching up from the current path)
const getDataDir = (directory = 'data') =>
  fs.existsSync(directory) ? directory : getDataDir(`../${directory}`)

// path to a file
const getFilePath = (subdirectory, id, ext) =>
  subdirectory
    ? `${getDataDir()}/${subdirectory}/${id.toLowerCase().replace(/\./g, '/')}.${ext}`
    : `${getDataDir()}/${id.toLowerCase().replace(/\./g, '/')}.${ext}`

// get list of directories from a subdirectory
export const read = subdirectory =>
  fs.readdirSync(`${getDataDir()}/${subdirectory}`, { withFileTypes: true })
    .filter(x => x.isDirectory())
    .map(x => x.name)

// get file content
const getFileContent = (subdirectory, id, ext) => {
  const filePath = getFilePath(subdirectory, id, ext)
  if (fs.existsSync(filePath)) {
    return (ext === 'json') ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : fs.readFileSync(filePath, 'utf8')
  }
  return null
}

// get json/text data from disk
export const open = (subdirectory, id, ext = 'json') =>
  getFileContent(subdirectory, id, ext) || getFileContent(subdirectory, `${id}.index`, ext)

// save json data to disk
export const save = (subdirectory, id, data, ext = 'json') => {
  const filePath = getFilePath(subdirectory, id, ext)
  const dirName = path.dirname(filePath)
  fs.mkdirSync(dirName, { recursive: true })
  if (ext === 'json') data = `${JSON.stringify(data, null, 2)}\n`
  fs.writeFileSync(filePath, data)
}
