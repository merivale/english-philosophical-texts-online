// dependencies
import * as file from '../../service/file.js'
import * as get from '../../service/get.js'
import * as prepare from './prepare.js'
import write from './write.js'

const lexicon = get.lexicon()

// subdirectory for storing search cache
const directory = 'cache/lemmas'

// hahsmap of lemmas
const lemmaMap = {}

// generate cache of lemmatized texts
export default function generateLemmasCache (id, offset = 0) {
  // id === 'all' is a special case
  if (id === 'all') {
    const all = ['astell', 'berkeley', 'hume', 'hutcheson', 'locke', 'mandeville', 'norris', 'shaftesbury']
    all.forEach(generateLemmasCache)
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

  // generate the lemma map (first time round only)
  if (offset === 0) {
    Object.keys(lexicon).forEach((lemma) => {
      lexicon[lemma].forEach((word) => {
        lemmaMap[word] = lemma
      })
    })
  }

  // otherwise generate the lemmatized text cache for the text
  if (text.texts) {
    write(`Generating lemma usage cache for ${text.id}...\n`, offset)
    // generate the lemmatized text cache for subtexts recursively
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        generateLemmasCache(id, offset + 1)
      }
    })
    write('done!\n', offset)
  } else {
    // generate the lemmatized text cache for this text
    write(`Generating lemma usage cache for ${text.id}... `, offset)
    let lemmatizedText = `${prepare.lemmatizedText(text.fulltitle, lemmaMap)}\n\n`
    text.paragraphs.forEach((p) => {
      lemmatizedText += `${prepare.lemmatizedText(p.content, lemmaMap)}\n\n`
    })
    text.notes.forEach((n) => {
      lemmatizedText += `[n${n.id}]\n\n${prepare.lemmatizedText(n.content, lemmaMap)}\n\n`
    })
    file.save(directory, text.id, lemmatizedText, 'txt')
    write('done!\n')
  }
}
