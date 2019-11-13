// dependencies
const file = require('../../data/file')
const prepare = require('./prepare')
const write = require('./write')

// subdirectory for storing search cache
const directory = 'cache/plain'

// generate cache of plain texts
const generatePlainCache = (id, offset = 0) => {
  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) throw new Error(`No text found with ID ${id}.`)

  // exit if the text is not an author and has not been imported
  if (text.forename === null && !text.imported) {
    return
  }

  // otherwise generate the plain text cache for the text
  write(`Generating plain text cache for ${text.id}...\n`, offset)
  if (text.texts) {
    // generate the plain text cache for subtexts recursively
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        generatePlainCache(id, offset + 1)
      }
    })
    write('done!\n', offset)
  } else {
    // generate the plain text cache for this text
    write(`Generating plain text cache for ${text.id}... `, offset)
    let plainText = `${prepare.plainText(text.fulltitle)}\n\n`
    text.paragraphs.forEach((p) => {
      plainText += `${prepare.plainText(p.content)}\n\n`
    })
    text.notes.forEach((n) => {
      plainText += `[n${n.id}]\n\n${prepare.plainText(n.content)}\n\n`
    })
    file.save(directory, text.id, plainText, 'txt')
    write('done!\n')
  }
}

module.exports = generatePlainCache
