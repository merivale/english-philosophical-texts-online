/*
 * Generate cache of usage data.
 */
import analyse from '../../service/analyse.js'
import * as file from '../../service/file.js'
import { authors } from '../../service/get.js'
import write from './write.js'

// subdirectory for storing usage data
const directory = 'cache/usage'

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
    write(`Caching details for ${text.id}...\n`, offset)
    const details = {
      people: [],
      citations: [],
      foreign: [],
      numbers: [],
      count: 0,
      lexemes: [],
      unidentified: []
    }
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        generateUsageData(id, offset + 1)
        const subdetails = file.open(directory, id)
        if (subdetails) {
          combine(details.people, subdetails.people, 'name')
          details.citations.push(...subdetails.citations)
          details.foreign.push(...subdetails.foreign)
          details.numbers.push(...subdetails.numbers)
          details.count += subdetails.count
          combine(details.lexemes, subdetails.lexemes, 'lemma')
          combine(details.unidentified, subdetails.unidentified, 'word')
        }
      }
    })
    file.save(directory, `${text.id}.index`, details)
    write('done!\n', offset)
  } else {
    write(`Caching details for ${text.id}... `, offset)
    const details = analyse(text)
    file.save(directory, text.id, details)
    write('done!\n')
  }
}

// combine two records of text details
function combine (details, subdetails, nameField) {
  subdetails.forEach((x) => {
    const existing = details.find(y => y[nameField] === x[nameField])
    if (existing) {
      existing.frequency += x.frequency
    } else {
      details.push(x)
    }
    details.sort((a, b) => a[nameField].localeCompare(b[nameField]))
  })
}
