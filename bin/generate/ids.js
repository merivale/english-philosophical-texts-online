/*
 * Generate cache of text and paragraph IDs.
 */
import * as file from '../../service/file.js'
import { authors } from '../../service/get.js'
import write from './write.js'

// subdirectory for storing search cache
const directory = 'cache'

// initialise the records of sub IDs and paragraph IDs
const subTextIds = {} // text collection IDs with their sub-text IDs
const subParagraphIds = {} // text section IDs with their sub-paragraph IDs
const paragraphIds = [] // array of all paragraph IDs

// generate cache of sub IDs
export default function generateIdCache () {
  write('Generating sub ID cache...')

  // get IDs of all authors with imported texts
  const all = authors().filter(a => a.imported.length > 0).map(a => a.id)

  // add these to the special 'all' record
  subTextIds.all = all

  // add IDs recursively
  all.forEach(addIds)

  // save the files
  file.save(directory, 'sub-text-ids', subTextIds)
  file.save(directory, 'sub-paragraph-ids', subParagraphIds)
  file.save(directory, 'paragraph-ids', paragraphIds)
  write('done!\n')
}

// add sub IDs for the text with the given ID
function addIds (id) {
  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) {
    throw new Error(`No text found with ID ${id}.`)
  }

  // skip the text if it isn't an author or hasn't been imported
  if (text.sex === undefined && !text.imported) {
    return
  }

  // otherwise generate the sub ID cache for the text
  if (text.texts) {
    // generate the sub ID cache for this text and its subtexts recursively
    text.texts.forEach((id) => {
      const subtext = file.open('texts', id)
      // skip past texts that haven't been imported
      if (!subtext.imported) {
        return
      }

      // skip past subtexts by different authors
      if (!id.match(text.id.split('.')[0])) {
        return
      }

      // otherwise add record to the sub ID cache
      if (subtext.texts === undefined || subtext.texts.some(x => x.match(subtext.id))) {
        const idBits = subtext.id.split('.')
        const visualParent = idBits.slice(0, -1).join('.')
        if (subTextIds[visualParent]) {
          subTextIds[visualParent].push(id)
        } else {
          subTextIds[visualParent] = [id]
        }
      }
      // and continue with its subtexts recursively
      addIds(id)
    })
  } else {
    // generate the sub ID and paragraph ID cache for this text
    subParagraphIds[text.id] = []
    text.paragraphs.forEach((paragraph) => {
      const paragraphId = `${text.id}.${paragraph.id}`
      subParagraphIds[text.id].push(paragraphId)
      paragraphIds.push(paragraphId)
    })
  }
}
