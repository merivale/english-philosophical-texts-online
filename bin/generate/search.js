/*
 * Generate cache of searchable texts.
 */
import * as file from '../../service/file.js'
import { authors } from '../../service/get.js'
import * as prepare from '../../service/prepare.js'
import write from './write.js'

// subdirectory for storing search cache
const directory = 'cache/search'

// generate cache of searchable texts
export default function generateSearchCache (id, offset = 0) {
  // id === 'all' is a special case
  if (id === 'all') {
    const all = authors().filter(a => a.imported.length > 0).map(a => a.id)
    all.forEach(generateSearchCache)
    return
  }

  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) throw new Error(`No text found with ID ${id}.`)

  // otherwise generate the search cache for the text
  write(`Generating search cache for ${text.id}...\n`, offset)
  if (text.texts) {
    // generate the search cache for subtexts recursively
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        generateSearchCache(id, offset + 1)
      }
    })
    // generate the search cache for this text
    const data = {
      id: text.id,
      sex: text.sex, // set for authors, null otherwise
      imported: text.imported,
      title: text.sex ? `${text.forename} ${text.surname}` : text.title,
      texts: text.texts
    }
    file.save(directory, `${text.id}.index`, data)
    write('done!\n', offset)
  } else {
    // generate the search cache for this text
    write(`Generating search cache for ${text.id}... `, offset)
    const data = {
      id: text.id,
      imported: text.imported,
      title: text.title,
      fulltitle: prepare.searchableText(text.fulltitle),
      paragraphs: text.paragraphs.map(p => ({
        id: p.id,
        content: p.title ? prepare.searchableText(`${p.title} ${p.content}`) : prepare.searchableText(p.content)
      })),
      notes: text.notes.map(n => ({
        id: n.id,
        paragraph: n.paragraph,
        content: prepare.searchableText(n.content)
      }))
    }
    file.save(directory, text.id, data)
    write('done!\n')
  }
}
