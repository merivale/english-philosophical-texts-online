// dependencies
import * as file from './file.js'
import * as prepare from './prepare.js'

// get all authors from data/texts directory
export const authors = (enrich = true) =>
  file.read('texts').map(id => author(id, enrich))

// get stubs for all texts
export const texts = () =>
  authors()
    .map(a => a.texts.map(t => Object.assign(t, { author: a })))
    .reduce((x, y) => x.concat(y), [])
    .sort((x, y) => x.published[0] - y.published[0])

// get author from id
export const author = (id, enrich = true) => {
  const author = file.open('texts', id)
  if (author) {
    return prepare.author(author, enrich)
  }
}

// get text from id
export const text = (id, enrich = true) => {
  const text = file.open('texts', id)
  if (text) {
    return prepare.text(text, enrich)
  }
}

// get searchable text from id
export const searchableText = (id) => {
  const text = file.open('cache/search', id)
  if (text) {
    return text
  }
}

// get usage data from id
export const usage = id =>
  file.open('cache/usage', id)

// get usage data from id
export const tfidf = id =>
  file.open('cache/tfidf', id)

export const lexicon = () =>
  file.open(null, 'lexicon')

export const reducedLexicon = () => {
  const lexicon = file.open(null, 'lexicon')
  return Object.keys(lexicon)
    .map((lemma) => lexicon[lemma].concat(lemma))
    .filter(words => words.length > 1)
}
