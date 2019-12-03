/*
 * Generate cache of TF-IDF data.
 */
import * as file from '../../service/file.js'
import { authors } from '../../service/get.js'
import write from './write.js'

// subdirectory for storing search cache
const directory = 'cache/tfidf'

// generate TF-IDF cache
export default function generateTFIDFCache (id, offset = 0) {
  // id === 'all' is a special case
  if (id === 'all') {
    const all = authors({ enrich: true }).filter(a => a.imported.length > 0).map(a => a.id)
    all.forEach(generateTFIDFCache)
    return
  }

  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) throw new Error(`No text found with ID ${id}.`)

  // exit if the text is not an author and has not been imported
  if (text.forename === undefined && !text.imported) return

  // otherwise generate the TF-IDF cache for the text
  write(`Generating TF-IDF cache for ${text.id}...\n`, offset)
  if (text.texts) {
    // generate the TF-IDF cache for subtexts recursively
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        generateTFIDFCache(id, offset + 1)
      }
    })
    const usage = file.open('cache/rawusage', id)
    const lemmas = Object.keys(usage)
    const wordCount = lemmas.reduce((acc, cur) => acc + usage[cur], 0)
    const frequencies = getFrequencies(id, lemmas)
    const tfidf = []
    lemmas.forEach((lemma) => {
      const tf = (usage[lemma] / wordCount) * 100
      const idf = Math.log(frequencies.documentCount / frequencies.documentFrequency[lemma])
      tfidf.push({ lemma, tfidf: tf * idf })
    })
    tfidf.sort((x, y) => y.tfidf - x.tfidf)
    file.save(directory, `${text.id}.index`, tfidf)
    write('done!\n', offset)
  } else {
    // generate the TF-IDF cache for this text
    write(`Generating TF-IDF cache for ${text.id}... `, offset)
    const usage = file.open('cache/rawusage', id)
    const lemmas = Object.keys(usage)
    const wordCount = lemmas.reduce((acc, cur) => acc + usage[cur], 0)
    const frequencies = getFrequencies(id, lemmas)
    const tfidf = []
    lemmas.forEach((lemma) => {
      const tf = usage[lemma] / wordCount
      const idf = Math.log(frequencies.documentCount / frequencies.documentFrequency[lemma])
      tfidf.push({ lemma, tfidf: tf * idf })
    })
    tfidf.sort((x, y) => y.tfidf - x.tfidf)
    file.save(directory, text.id, tfidf)
    write('done!\n')
  }
}

// get the frequencies of several lemmas in all documents apart from the one to exclude
function getFrequencies (excludeId, lemmas) {
  const documentFrequency = {}
  let documentCount = 1 // start at 1 to avoid division by 0
  lemmas.forEach((lemma) => {
    documentFrequency[lemma] = 1 // start at 1 to avoid division by 0
  })
  const incrementTotals = (id) => {
    if (id === excludeId) return
    const text = file.open('texts', id)
    if (text.forename === undefined && !text.imported) return
    if (text.texts) {
      text.texts.forEach(incrementTotals)
    } else {
      const usage = file.open('cache/rawusage', id)
      lemmas.forEach((lemma) => {
        if (usage[lemma]) documentFrequency[lemma] += 1
      })
      documentCount += 1
    }
  }
  file.read('texts').forEach(incrementTotals)
  return { documentCount, documentFrequency }
}
