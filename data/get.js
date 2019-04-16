// dependencies
const fs = require('fs')
const path = require('./path')
const lexicon = require('./lexicon')

// get array of all authors
const authors = (options = {}) =>
  fs.readdirSync(path('authors')).map(id => author(id, options))

// get author by id (optionally map text ids to enriched text data)
const author = (id, options = {}) => {
  const a = open('authors', id)
  if (!a) return undefined
  a.url = `/browse/${a.id.toLowerCase()}`
  a.fullname = a.title ? `${a.title} [${a.forename} ${a.surname}]` : `${a.forename} ${a.surname}`
  a.imported = a.texts.filter(id => text(id).imported)
  if (options.enrich) a.texts = a.texts.map(stub)
  return a
}

// get text by id
const text = (id, options = {}) => {
  let t = open('texts', id)
  if (!t) return undefined
  t.url = `/browse/${t.id.toLowerCase().replace(/\./g, '/')}`
  if (t.parent) {
    const parent = text(t.parent)
    t.published = t.published || parent.published
    t.copytext = t.copytext || parent.copytext
    t.source = t.source || parent.source
    t.comments = t.comments || parent.comments
    t.copyright = t.copyright || parent.copyright
    if (options.context) {
      const index = parent.texts.indexOf(t.id)
      if (index > 0) t.prev = stub(parent.texts[index - 1])
      if (index < parent.texts.length - 1) t.next = stub(parent.texts[index + 1])
      t.parent = stub(t.parent)
    }
  }
  if (options.enrich && t.texts) t.texts = t.texts.map(stub)
  return t
}

// create a text stub from a text id
const stub = (id) => {
  const t = text(id)
  if (!t) return undefined
  return {
    parent: t.parent ? stub(t.parent) : undefined,
    title: t.title,
    breadcrumb: t.breadcrumb,
    published: t.published,
    url: `/browse/${t.id.toLowerCase().replace(/\./g, '/')}`,
    imported: t.imported
  }
}

// get details from a text
const details = (text) => {
  const blocks = text.paragraphs.concat(text.notes)
  const people = blocks.map(block => block.content.match(/<u>.*?<\/u>/g))
    .reduce((x, y) => x.concat(y), []).filter(Boolean)
    .map(x => x.replace(/<([^>]+)>/g, '')) // strip html
    .sort().reduce((sofar, current) => {
      const existing = sofar.find(x => x.name === current)
      if (existing) {
        existing.frequency += 1
      } else {
        sofar.push({ name: current, frequency: 1 })
      }
      return sofar
    }, [])
  const citations = blocks.map(block => block.content.match(/<cite>.*?<\/cite>/g))
    .reduce((x, y) => x.concat(y), []).filter(Boolean)
  const foreign = blocks.map(block => block.content.match(/<i>.*?<\/i>/g))
    .reduce((x, y) => x.concat(y), []).filter(Boolean)
  return { people, citations, foreign }
}

// get lemmas from a text
const lemmas = (text) => {
  const entries = Object.entries(lexicon)
  const tokens = text.paragraphs.concat(text.notes)
    .map(block => tokenize(block.content))
    .reduce((x, y) => x.concat(y), [])
  const numbers = tokens.filter(x => !isNaN(x[0])).sort()
  const words = tokens.filter(x => isNaN(x[0]))
  const count = words.length
  const lemmas = []
  const unidentified = []
  words.forEach((word) => {
    const lexeme = entries.find(x => x[0] === word || x[1].includes(word))
    const lemma = lexeme ? lexeme[0] : undefined
    if (lemma) {
      const existing = lemmas.find(x => x.lemma === lemma)
      if (existing) {
        existing.frequency += 1
      } else {
        lemmas.push({ lemma, frequency: 1 })
      }
    } else {
      if (word === 'better') console.log(lexeme)
      const existing = unidentified.find(x => x.word === word)
      if (existing) {
        existing.frequency += 1
      } else {
        unidentified.push({ word, frequency: 1 })
      }
    }
  })
  lemmas.sort((x, y) => x.lemma.localeCompare(y.lemma, 'en'))
  unidentified.sort((x, y) => x.word.localeCompare(y.word, 'en'))
  return { numbers, lemmas, unidentified, count }
}

// convert a string of marked-up text to an array of (plain text) words
const tokenize = content =>
  content.toLowerCase()
    .replace(/[,.;:!?()]/g, '') // remove all punctuation
    .replace(/&amp/g, '&amp;') // reinstate semicolon after escaped ampersand
    .replace(/<a(.*?)>(.*?)<\/a>/g, '') // remove all footnote anchors
    .replace(/<i>(.*?)<\/i>/g, '') // remove all foreign language text
    .replace(/<cite>(.*?)<\/cite>/g, '') // remove all citations
    .replace(/(<(b|em)>)?<u>(.*?)<\/u>(<\/(b|em)>)?('s)?/g, '') // remove all names
    .replace(/<label>(.*?)<\/label>/g, '') // remove all margin notes
    .replace(/<small>(.*?)<\/small>/g, '') // remove anything marked as <small>
    .replace(/<([^>]+)>/g, '') // remove all HTML tags
    .replace(/-|—/g, ' ') // replace dashes with spaces
    .split(' ') // split into an array of words
    .filter(x => x.length > 0) // and get rid of empties caused by multiple adjacent spaces

// open and parse a JSON file
const open = (type, id) =>
  fs.existsSync(path(type, id)) ? JSON.parse(fs.readFileSync(path(type, id))) : undefined

// export the getters
module.exports = {
  authors,
  author,
  text,
  details,
  lemmas
}
