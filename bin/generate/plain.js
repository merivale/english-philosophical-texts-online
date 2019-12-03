/*
 * Generate cache of plain texts.
 */
import * as file from '../../service/file.js'
import { authors } from '../../service/get.js'
import * as prepare from '../../service/prepare.js'
import write from './write.js'

// subdirectory for storing search cache
const directory = 'cache/plain'

// generate cache of plain texts
export default function generatePlainCache (id, offset = 0) {
  // id === 'all' is a special case
  if (id === 'all') {
    const all = authors({ enrich: true }).filter(a => a.imported.length > 0).map(a => a.id)
    all.forEach(generatePlainCache)
    return
  }

  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) {
    throw new Error(`No text found with ID ${id}.`)
  }

  // exit if the text is not an author and has not been imported
  if (text.sex === undefined && !text.imported) {
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
