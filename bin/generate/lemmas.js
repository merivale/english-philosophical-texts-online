// dependencies
const file = require('../../data/file')
const lexicon = require('../../data/lexicon')
const prepare = require('./prepare')
const write = require('./write')

// subdirectory for storing search cache
const directory = 'cache/lemmas'

// hahsmap of lemmas
const lemmaMap = {}

// generate cache of lemmatized texts
const generateLemmasCache = (id, offset = 0) => {
  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) throw new Error(`No text found with ID ${id}.`)

  // exit if the text is not an author and has not been imported
  if (text.forename === null && !text.imported) {
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
    write(`Generating plain text cache for ${text.id}...\n`, offset)
    // generate the lemmatized text cache for subtexts recursively
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        generateLemmasCache(id, offset + 1)
      }
    })
    write('done!\n', offset)
  } else {
    // generate the lemmatized text cache for this text
    write(`Generating plain text cache for ${text.id}... `, offset)
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

module.exports = generateLemmasCache
