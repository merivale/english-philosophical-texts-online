/*
 * Generate cache of raw usage data.
 */
import * as file from '../../service/file.js'
import { authors } from '../../service/get.js'
import write from './write.js'

// subdirectory for storing usage data
const directory = 'cache/rawusage'

// generate details for text
export default function generateUsageData (id, offset = 0) {
  // id === 'all' is a special case
  if (id === 'all') {
    const all = authors({ enrich: true }).filter(a => a.imported.length > 0).map(a => a.id)
    all.forEach(generateUsageData)
    return
  }

  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) throw new Error(`No text found with ID ${id}.`)

  // exit if the text is not an author and has not been imported
  if (text.forename === undefined && !text.imported) {
    return
  }

  // otherwise generate the usage data cache for the text
  if (text.texts) {
    write(`Caching word usage statistics for ${text.id}...\n`, offset)
    const lemmaTypes = {}
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        generateUsageData(id, offset + 1)
        const subUsage = file.open(directory, id)
        if (subUsage) {
          Object.keys(subUsage).forEach((token) => {
            if (lemmaTypes[token]) {
              lemmaTypes[token] += subUsage[token]
            } else {
              lemmaTypes[token] = subUsage[token]
            }
          })
        }
      }
    })
    file.save(directory, `${text.id}.index`, lemmaTypes)
    write('done!\n', offset)
  } else {
    write(`Caching word usage statistics for ${text.id}... `, offset)
    const lemmas = file.open('cache/lemmas', text.id, 'txt')
    if (lemmas) {
      const lemmaTypes = usage(lemmas)
      file.save(directory, text.id, lemmaTypes)
      write('done!\n')
    } else {
      write(`lemmas for ${text.id} not found - "bin/generate lemmas" first\n`)
    }
  }
}

// generate usage details from text string
function usage (content) {
  const lemmaTokens = content.replace(/\*(.*?)\*/g, '') // remove foreign text
    .replace(/_(.*?)_('s)?/g, '') // remove names
    .replace(/\[(.*?)\]/g, '') // removes notes, citations, and cross references
    .replace(/\n/g, ' ') // replace line breaks with spaces
    .split(' ') // split into words
    .filter(x => x.length > 0) // filter out empties
  const lemmaTypes = {}
  lemmaTokens.forEach((token) => {
    if (lemmaTypes[token]) {
      lemmaTypes[token] += 1
    } else {
      lemmaTypes[token] = 1
    }
  })
  return lemmaTypes
}
