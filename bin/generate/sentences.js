/*
 * Generate cache of sentences.
 */
import * as file from '../../service/file.js'
import { authors } from '../../service/get.js'
import * as prepare from '../../service/prepare.js'
import write from './write.js'

// subdirectory for storing sentences cache
const directory = 'cache/sentences'

// generate cache of sentences
export default function generateSentencesCache (id, offset = 0) {
  // id === 'all' is a special case
  if (id === 'all') {
    const all = authors().filter(a => a.imported.length > 0).map(a => a.id)
    all.forEach(generateSentencesCache)
    return
  }

  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) throw new Error(`No text found with ID ${id}.`)

  // otherwise generate the search cache for the text
  write(`Generating sentences cache for ${text.id}...\n`, offset)
  if (text.texts) {
    // generate the search cache for subtexts recursively
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        generateSentencesCache(id, offset + 1)
      }
    })
  } else {
    // generate the search cache for this text
    write(`Generating sentences cache for ${text.id}... `, offset)
    const data = []
    text.paragraphs.forEach((paragraph) => {
      const sentences = prepare.plainSentences(paragraph.content)
      sentences.forEach((content, index) => {
        data.push({ id: `${text.id}.${paragraph.id}.${index + 1}`, content })
      })
    })
    file.save(directory, text.id, data)
    write('done!\n')
  }
}
