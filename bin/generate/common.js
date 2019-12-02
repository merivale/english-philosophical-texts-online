/*
 * Generate cache of common lemmas found in every text.
 */
import * as file from '../../service/file.js'
import write from './write.js'

// subdirectory for storing the lemmatized text cache
const directory = 'cache'

// define the lemma count map
const lemmaFrequencies = {}

// define the total number of documents
let documents = 0

// generate cache of common lemmas found in every text
export default function generateCommonLemmasCache () {
  write('Generating cache of lemma document frequencies... ')

  // filter the lemmas recursively
  file.read('texts').forEach(countLemmas)

  // save the lemma cache
  file.save(directory, 'lemma-frequencies', lemmaFrequencies)

  // create and save the cache of common lemmas
  const common = Object.keys(lemmaFrequencies).filter(lemma => (lemmaFrequencies[lemma] / documents) > 0.9)
  file.save(directory, 'common-lemmas', common)

  write('done!\n')
}

// increase the lemma count for the text with the given id
function countLemmas (id) {
  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) throw new Error(`No text found with ID ${id}.`)

  // exit if the text is not an author and has not been imported
  if (text.sex === undefined && !text.imported) {
    return
  }

  // otherwise filter the array for that text
  if (text.texts) {
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        countLemmas(id)
      }
    })
  } else {
    const lemmatizedText = file.open('cache/lemmas', id, 'txt')
    const lemmas = lemmatizedText.replace(/\n\n/g, ' ').split(' ').filter(x => x.length)
    const uniqueLemmas = new Set(lemmas)

    documents += 1

    uniqueLemmas.forEach((lemma) => {
      if (lemmaFrequencies[lemma]) {
        lemmaFrequencies[lemma] += 1
      } else {
        lemmaFrequencies[lemma] = 1
      }
    })
  }
}
