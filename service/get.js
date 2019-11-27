// dependencies
import * as file from './file.js'
import * as prepare from './prepare.js'

// get all authors from data/texts directory
export function authors (enrich = true) {
  return file.read('texts').map(id => author(id, enrich))
}

// get stubs for all texts
export function texts () {
  return authors()
    .map(a => a.texts.map(t => Object.assign(t, { author: a })))
    .reduce((x, y) => x.concat(y), [])
    .sort((x, y) => x.published[0] - y.published[0])
}

// get author from id
export function author (id, enrich = true) {
  const author = file.open('texts', id)
  return author ? prepare.author(author, enrich) : null
}

// get text from id
export function text (id, enrich = true) {
  const text = file.open('texts', id)
  return text ? prepare.text(text, enrich) : null
}

// get searchable text from id
export function searchableText (id) {
  const text = file.open('cache/search', id)
  return text || null
}

// get usage data from id
export function usage (id) {
  return file.open('cache/usage', id)
}

// get usage data from id
export function tfidf (id) {
  return file.open('cache/tfidf', id)
}

// get the lexicon
export function lexicon () {
  return file.open(null, 'lexicon')
}

// get the reduced lexicon
export function reducedLexicon () {
  const lexicon = file.open(null, 'lexicon')
  return Object.keys(lexicon)
    .map((lemma) => lexicon[lemma].concat(lemma))
    .filter(words => words.length > 1)
}
