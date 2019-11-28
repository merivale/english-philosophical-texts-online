// dependencies
import * as file from '../../service/file.js'
import * as prepare from './prepare.js'
import write from './write.js'

// subdirectory for storing sentences cache
const directory = 'cache/sentences'

// generate cache of sentences
export default function generateSentencesCache (id, offset = 0) {
  // id === 'all' is a special case
  if (id === 'all') {
    const all = ['astell', 'berkeley', 'hume', 'hutcheson', 'locke', 'mandeville', 'norris', 'shaftesbury']
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
    write(`Generating sentences cache for ${text.id}... `, offset)
    const data = {
      id: text.id,
      imported: text.imported,
      title: text.title,
      fulltitle: prepare.searchableText(text.fulltitle),
      sentences: generateSentences(text.paragraphs, text.id)
    }
    file.save(directory, text.id, data)
    write('done!\n')
  }
}

// generate sentences from an array of paragraphs
function generateSentences (paragraphs, id) {
  const sentences = []
  paragraphs.forEach((paragraph) => {
    const content = prepare.plainText(paragraph.content).replace(/([.!?]) /g, '$1@')
    content.split('@').forEach((content, index) => {
      sentences.push({ id: `${paragraph.id}.${index + 1}`, content })
    })
  })
  return sentences
}
